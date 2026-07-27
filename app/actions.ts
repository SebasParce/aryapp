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
    return { ok: false, message: "Your session expired. Please sign in again." };
  }

  const requestedSlug = String(formData.get("tenantSlug") ?? "");
  const file = formData.get("file");

  const tenant = await getTenantBySlug(requestedSlug);
  if (!tenant) {
    return { ok: false, message: "Contractor not found." };
  }

  // A contractor can only upload data for their own tenant, regardless of
  // what the form sends (prevents cross-tenant leakage).
  if (session.role === "contractor" && tenant.id !== session.tenantId) {
    return { ok: false, message: "You do not have permission to upload data for that contractor." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Select a CSV file." };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  const { contacts, skipped } = mapRetentionCsv(rows);

  if (contacts.length === 0) {
    return {
      ok: false,
      message:
        "No valid rows found. Make sure the CSV has these columns: name, phone, email, address, last_service, equipment, notes.",
    };
  }

  const { error } = await supabase.from("retention_contacts").insert(
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
    return { ok: false, message: `Error saving: ${error.message}` };
  }

  revalidatePath("/database");

  return {
    ok: true,
    message: `Loaded ${contacts.length} contacts${skipped > 0 ? ` (${skipped} rows skipped for incomplete data)` : ""}.`,
    inserted: contacts.length,
    skipped,
  };
}
