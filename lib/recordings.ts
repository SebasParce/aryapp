import { supabase } from "./db";

const BUCKET = process.env.SUPABASE_RECORDINGS_BUCKET || "recordings";

/** Ruta canónica del audio dentro del bucket. */
export function recordingPath(tenantId: string, callId: string): string {
  return `${tenantId}/${callId}.mp3`;
}

/** Sube el audio de una llamada al bucket privado. */
export async function uploadRecording(
  tenantId: string,
  callId: string,
  audio: ArrayBuffer,
  contentType = "audio/mpeg"
): Promise<string> {
  const path = recordingPath(tenantId, callId);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, audio, { contentType, upsert: true });
  if (error) throw error;
  return path;
}

/**
 * URL firmada temporal para reproducir la grabación.
 * El bucket es privado: nunca se expone el archivo directamente.
 */
export async function getRecordingUrl(
  path: string | null,
  expiresInSec = 3600
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSec);
  if (error) return null;
  return data?.signedUrl ?? null;
}
