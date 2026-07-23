"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth-server";
import { hashPassword } from "@/lib/password";
import * as db from "@/lib/admin-queries";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }
  return session;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function strOrNull(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v === "" ? null : v;
}
function numOrNull(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  return v === "" ? null : Number(v);
}

// ---------- Tenants ----------

export async function createTenantAction(formData: FormData) {
  await requireAdmin();
  await db.createTenant({
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    trade: str(formData, "trade"),
    city: str(formData, "city") || "South Florida",
  });
  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

export async function updateTenantAction(id: string, formData: FormData) {
  await requireAdmin();
  await db.updateTenant(id, {
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    trade: str(formData, "trade"),
    city: str(formData, "city") || "South Florida",
  });
  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

export async function deleteTenantAction(formData: FormData) {
  await requireAdmin();
  await db.deleteTenant(str(formData, "id"));
  revalidatePath("/admin/tenants");
  redirect("/admin/tenants");
}

// ---------- Calls ----------

export async function createCallAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.createCall({
    tenant_id: tenantId,
    direction: str(formData, "direction"),
    customer_name: str(formData, "customer_name"),
    phone: str(formData, "phone"),
    agent_name: str(formData, "agent_name"),
    duration_sec: Number(str(formData, "duration_sec") || "0"),
    outcome: str(formData, "outcome"),
    service_type: strOrNull(formData, "service_type"),
    occurred_at: new Date(str(formData, "occurred_at")).toISOString(),
  });
  revalidatePath("/admin/calls");
  redirect(`/admin/calls?tenant=${tenantId}`);
}

export async function updateCallAction(id: string, formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.updateCall(id, {
    tenant_id: tenantId,
    direction: str(formData, "direction"),
    customer_name: str(formData, "customer_name"),
    phone: str(formData, "phone"),
    agent_name: str(formData, "agent_name"),
    duration_sec: Number(str(formData, "duration_sec") || "0"),
    outcome: str(formData, "outcome"),
    service_type: strOrNull(formData, "service_type"),
    occurred_at: new Date(str(formData, "occurred_at")).toISOString(),
  });
  revalidatePath("/admin/calls");
  redirect(`/admin/calls?tenant=${tenantId}`);
}

export async function deleteCallAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.deleteCall(str(formData, "id"));
  revalidatePath("/admin/calls");
  redirect(`/admin/calls?tenant=${tenantId}`);
}

// ---------- Appointments ----------

export async function createAppointmentAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.createAppointment({
    tenant_id: tenantId,
    customer_name: str(formData, "customer_name"),
    phone: str(formData, "phone"),
    address: strOrNull(formData, "address"),
    service_type: str(formData, "service_type"),
    technician: strOrNull(formData, "technician"),
    scheduled_at: new Date(str(formData, "scheduled_at")).toISOString(),
    status: str(formData, "status") || "confirmada",
    value_usd: numOrNull(formData, "value_usd"),
  });
  revalidatePath("/admin/appointments");
  redirect(`/admin/appointments?tenant=${tenantId}`);
}

export async function updateAppointmentAction(id: string, formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.updateAppointment(id, {
    tenant_id: tenantId,
    customer_name: str(formData, "customer_name"),
    phone: str(formData, "phone"),
    address: strOrNull(formData, "address"),
    service_type: str(formData, "service_type"),
    technician: strOrNull(formData, "technician"),
    scheduled_at: new Date(str(formData, "scheduled_at")).toISOString(),
    status: str(formData, "status") || "confirmada",
    value_usd: numOrNull(formData, "value_usd"),
  });
  revalidatePath("/admin/appointments");
  redirect(`/admin/appointments?tenant=${tenantId}`);
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.deleteAppointment(str(formData, "id"));
  revalidatePath("/admin/appointments");
  redirect(`/admin/appointments?tenant=${tenantId}`);
}

// ---------- Chats ----------

export async function createChatAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.createChat({
    tenant_id: tenantId,
    channel: str(formData, "channel"),
    customer_name: str(formData, "customer_name"),
    phone: str(formData, "phone"),
    agent_name: str(formData, "agent_name"),
    status: str(formData, "status"),
    tag: strOrNull(formData, "tag"),
    last_message: strOrNull(formData, "last_message"),
    started_at: new Date(str(formData, "started_at")).toISOString(),
  });
  revalidatePath("/admin/chats");
  redirect(`/admin/chats?tenant=${tenantId}`);
}

export async function updateChatAction(id: string, formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.updateChat(id, {
    tenant_id: tenantId,
    channel: str(formData, "channel"),
    customer_name: str(formData, "customer_name"),
    phone: str(formData, "phone"),
    agent_name: str(formData, "agent_name"),
    status: str(formData, "status"),
    tag: strOrNull(formData, "tag"),
    last_message: strOrNull(formData, "last_message"),
    started_at: new Date(str(formData, "started_at")).toISOString(),
  });
  revalidatePath("/admin/chats");
  redirect(`/admin/chats?tenant=${tenantId}`);
}

export async function deleteChatAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.deleteChat(str(formData, "id"));
  revalidatePath("/admin/chats");
  redirect(`/admin/chats?tenant=${tenantId}`);
}

// ---------- Retention ----------

export async function createRetentionAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.createRetention({
    tenant_id: tenantId,
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    email: strOrNull(formData, "email"),
    address: strOrNull(formData, "address"),
    last_service: strOrNull(formData, "last_service"),
    equipment: strOrNull(formData, "equipment"),
    notes: strOrNull(formData, "notes"),
  });
  revalidatePath("/admin/retention");
  redirect(`/admin/retention?tenant=${tenantId}`);
}

export async function updateRetentionAction(id: string, formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.updateRetention(id, {
    tenant_id: tenantId,
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    email: strOrNull(formData, "email"),
    address: strOrNull(formData, "address"),
    last_service: strOrNull(formData, "last_service"),
    equipment: strOrNull(formData, "equipment"),
    notes: strOrNull(formData, "notes"),
  });
  revalidatePath("/admin/retention");
  redirect(`/admin/retention?tenant=${tenantId}`);
}

export async function deleteRetentionAction(formData: FormData) {
  await requireAdmin();
  const tenantId = str(formData, "tenant_id");
  await db.deleteRetention(str(formData, "id"));
  revalidatePath("/admin/retention");
  redirect(`/admin/retention?tenant=${tenantId}`);
}

// ---------- Users ----------

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const role = str(formData, "role") as "admin" | "contractor";
  const tenantId = role === "contractor" ? str(formData, "tenant_id") || null : null;
  await db.createUser({
    email: str(formData, "email").toLowerCase(),
    passwordHash: hashPassword(str(formData, "password")),
    role,
    tenantId,
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  await requireAdmin();
  await db.deleteUser(str(formData, "id"));
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
