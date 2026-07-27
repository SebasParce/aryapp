import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/db";
import {
  listCalls,
  listCallsAi,
  downloadRecording,
  normalizeDirection,
  normalizeOutcome,
  normalizeSentiment,
  normalizeTranscript,
  toIso,
  type JustCallCall,
} from "@/lib/justcall";
import { uploadRecording, recordingPath } from "@/lib/recordings";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Sincroniza llamadas desde JustCall hacia BucketsAi.
 *
 *   POST /api/sync/justcall
 *   Authorization: Bearer <SYNC_SECRET>
 *   { "tenantSlug": "titan-marine-air", "days": 7, "withRecordings": true }
 *
 * Es idempotente: usa `justcall_call_id` como clave única, así que se puede
 * correr en cron cuantas veces sea necesario sin duplicar registros.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SYNC_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  let body: { tenantSlug?: string; days?: number; withRecordings?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const { tenantSlug, days = 7, withRecordings = false } = body;
  if (!tenantSlug) {
    return NextResponse.json({ ok: false, error: "Falta tenantSlug" }, { status: 400 });
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id,slug,justcall_numbers")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant) {
    return NextResponse.json({ ok: false, error: "Contratista no encontrado" }, { status: 404 });
  }

  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");

  const { data: run } = await supabase
    .from("sync_runs")
    .insert({
      tenant_id: tenant.id,
      kind: "calls",
      status: "running",
      from_datetime: from.toISOString(),
      to_datetime: to.toISOString(),
    })
    .select("id")
    .single();

  let fetched = 0;
  let inserted = 0;
  let updated = 0;

  try {
    // 1. Traer las llamadas del rango (paginado)
    const calls: JustCallCall[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await listCalls({
        fromDatetime: fmt(from),
        toDatetime: fmt(to),
        justcallNumber: tenant.justcall_numbers?.[0],
        page,
        perPage: 100,
      });
      const batch = res.data ?? [];
      calls.push(...batch);
      if (batch.length < 100) break;
    }
    fetched = calls.length;

    // 2. Traer las transcripciones y mapearlas por call id
    const transcriptsById = new Map<number, ReturnType<typeof normalizeTranscript>>();
    try {
      for (let page = 1; page <= 20; page++) {
        const res = await listCallsAi({ fromDatetime: fmt(from), toDatetime: fmt(to), page, perPage: 100 });
        const batch = res.data ?? [];
        for (const item of batch) {
          transcriptsById.set(item.call_id, normalizeTranscript(item.transcription));
        }
        if (batch.length < 100) break;
      }
    } catch {
      // La cuenta puede no tener JustCall AI contratado: seguimos sin transcripción.
    }

    // 3. Normalizar y hacer upsert
    for (const jc of calls) {
      const id = `call_jc_${jc.id}`;
      const occurredAt = toIso(jc.call_date, jc.call_time);
      const transcript = transcriptsById.get(jc.id) ?? [];

      // Cliente (upsert por teléfono)
      const customerId = `cus_${tenant.id}_${(jc.contact_number || "").replace(/\D/g, "")}`;
      if (jc.contact_number) {
        await supabase.from("customers").upsert(
          {
            id: customerId,
            tenant_id: tenant.id,
            name: jc.contact_name || jc.contact_number,
            phone: jc.contact_number,
            email: jc.contact_email || null,
          },
          { onConflict: "tenant_id,phone" }
        );
      }

      const row = {
        id,
        tenant_id: tenant.id,
        justcall_call_id: String(jc.id),
        justcall_call_sid: jc.call_sid ?? null,
        justcall_number: jc.justcall_number ?? null,
        direction: normalizeDirection(jc.call_info?.direction),
        call_type: jc.call_info?.type ?? null,
        customer_name: jc.contact_name || jc.contact_number || "Desconocido",
        phone: jc.contact_number ?? "",
        customer_email: jc.contact_email ?? null,
        agent_name: jc.agent_name || "Sin asignar",
        agent_email: jc.agent_email ?? null,
        duration_sec: jc.call_duration?.conversation_time ?? jc.call_duration?.total_duration ?? 0,
        outcome: normalizeOutcome(jc.call_info?.disposition),
        occurred_at: occurredAt,
        recording_url: jc.call_info?.recording ?? null,
        transcript: transcript.length > 0 ? transcript : null,
        transcript_text:
          transcript.length > 0
            ? transcript.map((l) => `${l.t} ${l.speaker}: ${l.text}`).join("\n")
            : (jc.call_info?.voicemail_transcription ?? null),
        ai_summary: jc.justcall_ai?.call_summary ?? null,
        sentiment: normalizeSentiment(jc.justcall_ai?.customer_sentiment),
        ai_score: jc.justcall_ai?.call_score ?? null,
        ai_tags: jc.justcall_ai?.tags ?? jc.justcall_ai?.call_moments ?? null,
        synced_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("calls")
        .select("id")
        .eq("justcall_call_id", String(jc.id))
        .maybeSingle();

      const { error } = await supabase
        .from("calls")
        .upsert(existing ? { ...row, id: existing.id } : row, { onConflict: "justcall_call_id" });

      if (error) throw error;
      if (existing) updated++;
      else inserted++;

      // 4. Copiar la grabación al Storage privado (opcional, es lo más lento)
      if (withRecordings && jc.call_info?.recording) {
        try {
          const audio = await downloadRecording(jc.id);
          const path = await uploadRecording(tenant.id, existing?.id ?? id, audio);
          await supabase
            .from("calls")
            .update({ recording_path: path })
            .eq("justcall_call_id", String(jc.id));
        } catch {
          // Si falla la descarga seguimos: queda el enlace remoto de JustCall.
        }
      }
    }

    if (run) {
      await supabase
        .from("sync_runs")
        .update({ status: "ok", fetched, inserted, updated, finished_at: new Date().toISOString() })
        .eq("id", run.id);
    }

    return NextResponse.json({ ok: true, tenant: tenant.slug, fetched, inserted, updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (run) {
      await supabase
        .from("sync_runs")
        .update({ status: "error", error: message, fetched, inserted, updated, finished_at: new Date().toISOString() })
        .eq("id", run.id);
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
