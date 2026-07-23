import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase (Postgres real, proyecto compartido con fitness-tracker
// pero en sus propias tablas `arya_*`). Server-only: la anon key se usa acá
// porque estas tablas no tienen RLS (la app maneja su propia autenticación,
// no Supabase Auth) — nunca se expone al cliente, todo el acceso pasa por
// Server Components / Server Actions / Route Handlers.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan SUPABASE_URL / SUPABASE_ANON_KEY en el entorno (revisa tu .env)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
