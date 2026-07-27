import { createClient } from "@supabase/supabase-js";

// Supabase client (real Postgres, dedicated `buckets-ai` project).
// Server-only: the anon key is used here because these tables have no RLS
// (the app handles its own authentication, not Supabase Auth). It is never
// exposed to the browser — all access goes through Server Components,
// Server Actions and Route Handlers.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL / SUPABASE_ANON_KEY in the environment (check your .env)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
