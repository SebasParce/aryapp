/**
 * Cliente de la API de JustCall (v2.1).
 *
 * Autenticación: header `Authorization: <api_key>:<api_secret>`.
 * Docs: https://developer.justcall.io/reference/call_list_v21
 *
 * Nota: JustCall solo expone los últimos 3 meses de historial vía API.
 * Para un export completo hay que pedirlo a su soporte.
 */

const BASE = "https://api.justcall.io/v2.1";

export type JustCallCall = {
  id: number;
  call_sid?: string;
  contact_number: string;
  contact_name?: string;
  contact_email?: string;
  justcall_number?: string;
  agent_id?: number;
  agent_name?: string;
  agent_email?: string;
  call_date: string;
  call_time: string;
  call_info?: {
    direction?: string;
    type?: string;
    disposition?: string;
    notes?: string;
    recording?: string;
    voicemail_transcription?: string;
  };
  call_duration?: {
    total_duration?: number;
    conversation_time?: number;
  };
  justcall_ai?: {
    call_summary?: string;
    customer_sentiment?: string;
    call_score?: number;
    call_moments?: string[];
    tags?: string[];
  };
};

export type JustCallAiData = {
  call_id: number;
  transcription?: Array<{
    speaker?: string;
    text?: string;
    start_time?: number;
    end_time?: number;
  }>;
  call_summary?: string;
  customer_sentiment?: string;
};

function authHeader(): string {
  const key = process.env.JUSTCALL_API_KEY;
  const secret = process.env.JUSTCALL_API_SECRET;
  if (!key || !secret) {
    throw new Error(
      "Faltan JUSTCALL_API_KEY / JUSTCALL_API_SECRET en el entorno."
    );
  }
  return `${key}:${secret}`;
}

async function jcFetch<T>(path: string, params: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: { Authorization: authHeader(), Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`JustCall ${res.status} en ${path}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Lista llamadas en un rango. Incluye la data de JustCall AI. */
export async function listCalls(opts: {
  fromDatetime?: string;
  toDatetime?: string;
  justcallNumber?: string;
  page?: number;
  perPage?: number;
}): Promise<{ data: JustCallCall[] }> {
  return jcFetch<{ data: JustCallCall[] }>("/calls", {
    from_datetime: opts.fromDatetime,
    to_datetime: opts.toDatetime,
    justcall_number: opts.justcallNumber,
    fetch_ai_data: true,
    page: opts.page ?? 1,
    per_page: Math.min(opts.perPage ?? 100, 100),
    sort: "datetime",
    order: "desc",
  });
}

/** Data de AI (incluye la transcripción completa) para un rango de llamadas. */
export async function listCallsAi(opts: {
  fromDatetime?: string;
  toDatetime?: string;
  page?: number;
  perPage?: number;
}): Promise<{ data: JustCallAiData[] }> {
  return jcFetch<{ data: JustCallAiData[] }>("/calls_ai", {
    from_datetime: opts.fromDatetime,
    to_datetime: opts.toDatetime,
    fetch_transcription: true,
    page: opts.page ?? 1,
    per_page: Math.min(opts.perPage ?? 100, 100),
  });
}

/** Descarga el audio de la grabación para subirlo a Storage. */
export async function downloadRecording(callId: number): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/calls/${callId}/recording/download`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`No se pudo descargar la grabación de ${callId}: ${res.status}`);
  }
  return res.arrayBuffer();
}

// ---------- Normalización al modelo de BucketsAi ----------

/** JustCall usa "Incoming"/"Outgoing"; nosotros inbound/outbound. */
export function normalizeDirection(dir?: string): "inbound" | "outbound" {
  return (dir ?? "").toLowerCase().startsWith("in") ? "inbound" : "outbound";
}

/**
 * Traduce la disposición del agente en JustCall al outcome del dashboard.
 * Los códigos exactos dependen de cómo el contratista configure su lista,
 * así que se hace por palabras clave y cae en `sin_clasificar`.
 */
export function normalizeOutcome(disposition?: string): string {
  const d = (disposition ?? "").toLowerCase();
  if (!d) return "sin_clasificar";
  if (/(book|agend|schedul|appointment|cita)/.test(d)) return "agendado";
  if (/(follow|later|callback|call back|despu)/.test(d)) return "llamar_despues";
  if (/(not interested|no interes|declin|lost)/.test(d)) return "no_interesado";
  if (/(wrong|equivocad|spam)/.test(d)) return "numero_equivocado";
  return "sin_clasificar";
}

export function normalizeSentiment(s?: string): string | null {
  const v = (s ?? "").toLowerCase();
  if (!v) return null;
  if (v.startsWith("pos")) return "positivo";
  if (v.startsWith("neg")) return "negativo";
  return "neutral";
}

/** Convierte la transcripción de JustCall al formato del visor. */
export function normalizeTranscript(
  segments: JustCallAiData["transcription"]
): Array<{ t: string; speaker: "agente" | "cliente"; text: string }> {
  if (!Array.isArray(segments)) return [];
  return segments
    .filter((s) => s?.text)
    .map((s) => {
      const secs = Math.max(0, Math.round(s.start_time ?? 0));
      const m = Math.floor(secs / 60);
      const sec = secs % 60;
      const who = (s.speaker ?? "").toLowerCase();
      return {
        t: `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`,
        speaker: /agent|rep|user/.test(who) ? ("agente" as const) : ("cliente" as const),
        text: String(s.text),
      };
    });
}

/** JustCall entrega fecha y hora UTC por separado. */
export function toIso(callDate: string, callTime: string): string {
  const raw = `${callDate}T${(callTime || "00:00:00").trim()}Z`;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
