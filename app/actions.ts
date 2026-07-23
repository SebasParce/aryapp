"use server";

import { revalidatePath } from "next/cache";
import { supabase, newId } from "@/lib/db";
import { getTenantBySlug } from "@/lib/queries";
import { parseCsv, mapRetentionCsv } from "@/lib/csv";
import { getSession } from "@/lib/auth-server";

export type UploadResult = {
  ok: boolean;
  message: string;
  inserted?: number;
  skipped?: number;
};

export async function uploadRetentionCsv(
  _prevState: UploadResult | null,
  formData: FormData
): Promise<UploadResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, message: "Tu sesión expiró. Vuelve a iniciar sesión." };
  }

  const requestedSlug = String(formData.get("tenantSlug") ?? "");
  const file = formData.get("file");

  const tenant = await getTenantBySlug(requestedSlug);
  if (!tenant) {
    return { ok: false, message: "Contratista no encontrado." };
  }

  // Un contratista solo puede cargar datos de su propio tenant, sin
  // importar lo que venga en el formulario (evita fuga entre tenants).
  if (session.role === "contractor" && tenant.id !== session.tenantId) {
    return { ok: false, message: "No tienes permiso para cargar datos de ese contratista." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Selecciona un archivo CSV." };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  const { contacts, skipped } = mapRetentionCsv(rows);

  if (contacts.length === 0) {
    return {
      ok: false,
      message:
        "No se encontraron filas válidas. Verifica que el CSV tenga columnas: nombre, telefono, email, direccion, ultimo_servicio, equipo, notas.",
    };
  }

  const { error } = await supabase.from("arya_retention_contacts").insert(
    contacts.map((c) => ({
      id: newId("ret"),
      tenant_id: tenant.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      last_service: c.last_service,
      equipment: c.equipment,
      notes: c.notes,
    }))
  );
  if (error) {
    return { ok: false, message: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/base-de-datos");

  return {
    ok: true,
    message: `Se cargaron ${contacts.length} contactos${skipped > 0 ? ` (${skipped} filas omitidas por datos incompletos)` : ""}.`,
    inserted: contacts.length,
    skipped,
  };
}
