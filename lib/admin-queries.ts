import { supabase, newId } from "./db";
import type { Tenant } from "./queries";

// ---------- Tenants ----------

export async function createTenant(input: {
  name: string;
  slug: string;
  trade: string;
  city: string;
}): Promise<string> {
  const id = newId("ten");
  const { error } = await supabase.from("arya_tenants").insert({ id, ...input });
  if (error) throw error;
  return id;
}

export async function updateTenant(
  id: string,
  input: { name: string; slug: string; trade: string; city: string }
) {
  const { error } = await supabase.from("arya_tenants").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteTenant(id: string) {
  const { error } = await supabase.from("arya_tenants").delete().eq("id", id);
  if (error) throw error;
}

export async function getTenantById(id: string): Promise<Tenant | undefined> {
  const { data, error } = await supabase
    .from("arya_tenants")
    .select("id,name,slug,trade,city")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export type TenantCounts = {
  calls: number;
  appointments: number;
  chats: number;
  retention: number;
};

async function countIn(table: string, tenantId: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  if (error) throw error;
  return count ?? 0;
}

export async function getTenantCounts(tenantId: string): Promise<TenantCounts> {
  const [calls, appointments, chats, retention] = await Promise.all([
    countIn("arya_calls", tenantId),
    countIn("arya_appointments", tenantId),
    countIn("arya_chats", tenantId),
    countIn("arya_retention_contacts", tenantId),
  ]);
  return { calls, appointments, chats, retention };
}

// ---------- Calls ----------

export type CallRow = {
  id: string;
  tenant_id: string;
  direction: string;
  customer_name: string;
  phone: string;
  agent_name: string;
  duration_sec: number;
  outcome: string;
  service_type: string | null;
  occurred_at: string;
};

export async function listCallsForTenant(tenantId: string, limit = 100): Promise<CallRow[]> {
  const { data, error } = await supabase
    .from("arya_calls")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getCallById(id: string): Promise<CallRow | undefined> {
  const { data, error } = await supabase.from("arya_calls").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export async function createCall(input: Omit<CallRow, "id">): Promise<string> {
  const id = newId("call");
  const { error } = await supabase.from("arya_calls").insert({ id, ...input });
  if (error) throw error;
  return id;
}

export async function updateCall(id: string, input: Omit<CallRow, "id">) {
  const { error } = await supabase.from("arya_calls").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteCall(id: string) {
  const { error } = await supabase.from("arya_calls").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Appointments ----------

export type AppointmentRow = {
  id: string;
  tenant_id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  service_type: string;
  technician: string | null;
  scheduled_at: string;
  status: string;
  value_usd: number | null;
};

export async function listAppointmentsForTenant(tenantId: string, limit = 100): Promise<AppointmentRow[]> {
  const { data, error } = await supabase
    .from("arya_appointments")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("scheduled_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getAppointmentById(id: string): Promise<AppointmentRow | undefined> {
  const { data, error } = await supabase.from("arya_appointments").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export async function createAppointment(input: Omit<AppointmentRow, "id">): Promise<string> {
  const id = newId("appt");
  const { error } = await supabase.from("arya_appointments").insert({ id, ...input });
  if (error) throw error;
  return id;
}

export async function updateAppointment(id: string, input: Omit<AppointmentRow, "id">) {
  const { error } = await supabase.from("arya_appointments").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from("arya_appointments").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Chats ----------

export type ChatRow = {
  id: string;
  tenant_id: string;
  channel: string;
  customer_name: string;
  phone: string;
  agent_name: string;
  status: string;
  tag: string | null;
  last_message: string | null;
  started_at: string;
};

export async function listChatsForTenant(tenantId: string, limit = 100): Promise<ChatRow[]> {
  const { data, error } = await supabase
    .from("arya_chats")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getChatById(id: string): Promise<ChatRow | undefined> {
  const { data, error } = await supabase.from("arya_chats").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export async function createChat(input: Omit<ChatRow, "id">): Promise<string> {
  const id = newId("chat");
  const { error } = await supabase.from("arya_chats").insert({ id, ...input });
  if (error) throw error;
  return id;
}

export async function updateChat(id: string, input: Omit<ChatRow, "id">) {
  const { error } = await supabase.from("arya_chats").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteChat(id: string) {
  const { error } = await supabase.from("arya_chats").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Retention contacts ----------

export type RetentionRow = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  last_service: string | null;
  equipment: string | null;
  notes: string | null;
};

export async function listRetentionForTenant(tenantId: string, limit = 100): Promise<RetentionRow[]> {
  const { data, error } = await supabase
    .from("arya_retention_contacts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getRetentionById(id: string): Promise<RetentionRow | undefined> {
  const { data, error } = await supabase
    .from("arya_retention_contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export async function createRetention(input: Omit<RetentionRow, "id">): Promise<string> {
  const id = newId("ret");
  const { error } = await supabase.from("arya_retention_contacts").insert({ id, ...input });
  if (error) throw error;
  return id;
}

export async function updateRetention(id: string, input: Omit<RetentionRow, "id">) {
  const { error } = await supabase.from("arya_retention_contacts").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteRetention(id: string) {
  const { error } = await supabase.from("arya_retention_contacts").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Users ----------

export type UserRow = {
  id: string;
  email: string;
  role: "admin" | "contractor";
  tenant_id: string | null;
  created_at: string;
};

export async function listUsers(): Promise<(UserRow & { tenant_name: string | null })[]> {
  const [{ data: users, error: usersErr }, tenants] = await Promise.all([
    supabase
      .from("arya_users")
      .select("id,email,role,tenant_id,created_at")
      .order("created_at", { ascending: false }),
    (async () => {
      const { data, error } = await supabase.from("arya_tenants").select("id,name");
      if (error) throw error;
      return data ?? [];
    })(),
  ]);
  if (usersErr) throw usersErr;

  const tenantNameById = new Map(tenants.map((t) => [t.id, t.name]));
  return (users ?? []).map((u) => ({
    ...u,
    tenant_name: u.tenant_id ? tenantNameById.get(u.tenant_id) ?? null : null,
  }));
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("arya_users")
    .select("id,email,password_hash,role,tenant_id")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  role: "admin" | "contractor";
  tenantId: string | null;
}): Promise<string> {
  const id = newId("usr");
  const { error } = await supabase.from("arya_users").insert({
    id,
    email: input.email,
    password_hash: input.passwordHash,
    role: input.role,
    tenant_id: input.tenantId,
  });
  if (error) throw error;
  return id;
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from("arya_users").delete().eq("id", id);
  if (error) throw error;
}
