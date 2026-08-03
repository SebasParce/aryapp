import { supabase } from "./db";

const BUCKET = process.env.SUPABASE_RECORDINGS_BUCKET || "recordings";

/** Canonical path for the audio inside the bucket. */
export function recordingPath(tenantId: string, callId: string): string {
  return `${tenantId}/${callId}.mp3`;
}

/** Uploads a call recording to the private bucket. */
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
 * Short-lived signed URL for playing the recording.
 * The bucket is private: the file is never exposed directly.
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

/**
 * Resolves the playable audio source for a call.
 *
 * Order of preference:
 *  1. A file in the private Storage bucket (signed URL).
 *  2. A file served by the app itself (`/recordings/...`), used for demos.
 *  3. A direct https:// link (e.g. the recording hosted by JustCall).
 *
 * The `justcall://` placeholder is not playable and resolves to null.
 */
export async function resolveRecordingSrc(
  recordingPath: string | null,
  recordingUrl: string | null
): Promise<string | null> {
  const signed = await getRecordingUrl(recordingPath);
  if (signed) return signed;
  if (!recordingUrl) return null;
  if (recordingUrl.startsWith("/")) return recordingUrl;
  if (recordingUrl.startsWith("https://")) return recordingUrl;
  return null;
}
