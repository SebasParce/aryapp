/**
 * JustCall API client (v2.1).
 *
 * Auth: `Authorization: <api_key>:<api_secret>` header.
 * Docs: https://developer.justcall.io/reference/call_list_v21
 *
 * Note: JustCall only exposes the last 3 months of history over the API.
 * A full export has to be requested from their support team.
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
      "Missing JUSTCALL_API_KEY / JUSTCALL_API_SECRET in the environment."
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
    throw new Error(`JustCall ${res.status} on ${path}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** Lists calls in a date range, including JustCall AI data. */
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

/** AI data (including the full transcript) for a range of calls. */
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

/** Downloads the recording audio so it can be uploaded to Storage. */
export async function downloadRecording(callId: number): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/calls/${callId}/recording/download`, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Could not download the recording for ${callId}: ${res.status}`);
  }
  return res.arrayBuffer();
}

// ---------- Normalization into the Arya model ----------

/** JustCall uses "Incoming"/"Outgoing"; we use inbound/outbound. */
export function normalizeDirection(dir?: string): "inbound" | "outbound" {
  return (dir ?? "").toLowerCase().startsWith("in") ? "inbound" : "outbound";
}

/**
 * Maps the agent's JustCall disposition onto the dashboard outcome.
 * The exact codes depend on how each contractor sets up their list, so this
 * matches on keywords and falls back to `unclassified`.
 */
export function normalizeOutcome(disposition?: string): string {
  const d = (disposition ?? "").toLowerCase();
  if (!d) return "unclassified";
  if (/(book|agend|schedul|appointment|cita)/.test(d)) return "booked";
  if (/(follow|later|callback|call back|despu)/.test(d)) return "follow_up";
  if (/(not interested|no interes|declin|lost)/.test(d)) return "not_interested";
  if (/(wrong|equivocad|spam)/.test(d)) return "wrong_number";
  return "unclassified";
}

export function normalizeSentiment(s?: string): string | null {
  const v = (s ?? "").toLowerCase();
  if (!v) return null;
  if (v.startsWith("pos")) return "positive";
  if (v.startsWith("neg")) return "negative";
  return "neutral";
}

/** Converts a JustCall transcript into the viewer's format. */
export function normalizeTranscript(
  segments: JustCallAiData["transcription"]
): Array<{ t: string; speaker: "agent" | "customer"; text: string }> {
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
        speaker: /agent|rep|user/.test(who) ? ("agent" as const) : ("customer" as const),
        text: String(s.text),
      };
    });
}

/** JustCall returns the UTC date and time as separate fields. */
export function toIso(callDate: string, callTime: string): string {
  const raw = `${callDate}T${(callTime || "00:00:00").trim()}Z`;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
