import { supabase } from "./db";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  trade: string;
  city: string;
};

export async function listTenants(): Promise<Tenant[]> {
  const { data, error } = await supabase
    .from("arya_tenants")
    .select("id,name,slug,trade,city")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTenantBySlug(slug: string): Promise<Tenant | undefined> {
  const { data, error } = await supabase
    .from("arya_tenants")
    .select("id,name,slug,trade,city")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ?? undefined;
}

export type Metrics = {
  minutesTalked: number;
  callsInbound: number;
  callsOutbound: number;
  jobsBooked: number;
  conversionRate: number;
  callsPrevInbound: number;
  callsPrevOutbound: number;
};

type CallAggRow = {
  direction: string;
  duration_sec: number;
  outcome: string;
  occurred_at: string;
};

export async function getMetrics(tenantId: string): Promise<Metrics> {
  const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const cutoff60 = new Date(Date.now() - 60 * 86400000).toISOString();

  const { data, error } = await supabase
    .from("arya_calls")
    .select("direction,duration_sec,outcome,occurred_at")
    .eq("tenant_id", tenantId)
    .gte("occurred_at", cutoff60);
  if (error) throw error;

  const rows = (data ?? []) as CallAggRow[];
  const current = rows.filter((r) => r.occurred_at >= cutoff30);
  const previous = rows.filter((r) => r.occurred_at < cutoff30);

  const total = current.length;
  const agendado = current.filter((r) => r.outcome === "agendado").length;

  return {
    minutesTalked: Math.round(current.reduce((s, r) => s + r.duration_sec, 0) / 60),
    callsInbound: current.filter((r) => r.direction === "inbound").length,
    callsOutbound: current.filter((r) => r.direction === "outbound").length,
    jobsBooked: agendado,
    conversionRate: total > 0 ? Math.round((agendado / total) * 100) : 0,
    callsPrevInbound: previous.filter((r) => r.direction === "inbound").length,
    callsPrevOutbound: previous.filter((r) => r.direction === "outbound").length,
  };
}

export type Appointment = {
  id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  service_type: string;
  technician: string | null;
  scheduled_at: string;
  status: string;
  value_usd: number | null;
};

export async function getUpcomingAppointments(tenantId: string, limit = 10): Promise<Appointment[]> {
  const cutoff = new Date(Date.now() - 86400000).toISOString();
  const { data, error } = await supabase
    .from("arya_appointments")
    .select("id,customer_name,phone,address,service_type,technician,scheduled_at,status,value_usd")
    .eq("tenant_id", tenantId)
    .gte("scheduled_at", cutoff)
    .order("scheduled_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getPastAppointments(tenantId: string, limit = 10): Promise<Appointment[]> {
  const cutoff = new Date(Date.now() - 86400000).toISOString();
  const { data, error } = await supabase
    .from("arya_appointments")
    .select("id,customer_name,phone,address,service_type,technician,scheduled_at,status,value_usd")
    .eq("tenant_id", tenantId)
    .lt("scheduled_at", cutoff)
    .order("scheduled_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export type AppointmentStats = {
  jobsBooked30d: number;
  valueCaptured30d: number;
  upcomingCount: number;
  avgTicket: number;
};

export async function getAppointmentStats(tenantId: string): Promise<AppointmentStats> {
  const cutoffMinus30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const cutoffMinus1 = new Date(Date.now() - 86400000).toISOString();

  const { data, error } = await supabase
    .from("arya_appointments")
    .select("scheduled_at,value_usd")
    .eq("tenant_id", tenantId)
    .gte("scheduled_at", cutoffMinus30);
  if (error) throw error;

  const rows = data ?? [];
  const recent = rows.filter((r) => r.scheduled_at < cutoffMinus1);
  const upcoming = rows.filter((r) => r.scheduled_at >= cutoffMinus1);

  const jobsBooked30d = recent.length;
  const valueCaptured30d = recent.reduce((s, r) => s + (r.value_usd ?? 0), 0);

  return {
    jobsBooked30d,
    valueCaptured30d,
    upcomingCount: upcoming.length,
    avgTicket: jobsBooked30d > 0 ? Math.round(valueCaptured30d / jobsBooked30d) : 0,
  };
}

export type RecentCall = {
  id: string;
  direction: string;
  customer_name: string;
  agent_name: string;
  duration_sec: number;
  outcome: string;
  service_type: string | null;
  occurred_at: string;
};

export async function getRecentCalls(tenantId: string, limit = 8): Promise<RecentCall[]> {
  const { data, error } = await supabase
    .from("arya_calls")
    .select("id,direction,customer_name,agent_name,duration_sec,outcome,service_type,occurred_at")
    .eq("tenant_id", tenantId)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getCallsByDirection(
  tenantId: string,
  direction: "inbound" | "outbound",
  limit = 50
): Promise<RecentCall[]> {
  const { data, error } = await supabase
    .from("arya_calls")
    .select("id,direction,customer_name,agent_name,duration_sec,outcome,service_type,occurred_at")
    .eq("tenant_id", tenantId)
    .eq("direction", direction)
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export type DirectionStats = {
  count: number;
  prevCount: number;
  avgDurationSec: number;
  bookedRate: number;
  totalMinutes: number;
};

export async function getDirectionStats(
  tenantId: string,
  direction: "inbound" | "outbound"
): Promise<DirectionStats> {
  const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const cutoff60 = new Date(Date.now() - 60 * 86400000).toISOString();

  const { data, error } = await supabase
    .from("arya_calls")
    .select("duration_sec,outcome,occurred_at")
    .eq("tenant_id", tenantId)
    .eq("direction", direction)
    .gte("occurred_at", cutoff60);
  if (error) throw error;

  const rows = data ?? [];
  const current = rows.filter((r) => r.occurred_at >= cutoff30);
  const previous = rows.filter((r) => r.occurred_at < cutoff30);
  const count = current.length;
  const booked = current.filter((r) => r.outcome === "agendado").length;

  return {
    count,
    prevCount: previous.length,
    avgDurationSec: count > 0 ? Math.round(current.reduce((s, r) => s + r.duration_sec, 0) / count) : 0,
    bookedRate: count > 0 ? Math.round((booked / count) * 100) : 0,
    totalMinutes: Math.round(current.reduce((s, r) => s + r.duration_sec, 0) / 60),
  };
}

export type Chat = {
  id: string;
  channel: string;
  customer_name: string;
  phone: string;
  agent_name: string;
  status: string;
  tag: string | null;
  last_message: string | null;
  started_at: string;
};

export async function getChats(tenantId: string, limit = 50): Promise<Chat[]> {
  const { data, error } = await supabase
    .from("arya_chats")
    .select("id,channel,customer_name,phone,agent_name,status,tag,last_message,started_at")
    .eq("tenant_id", tenantId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export type ChatStats = {
  resolved: number;
  pending: number;
  smsCount: number;
  chatCount: number;
  resolutionRate: number;
};

export async function getChatStats(tenantId: string): Promise<ChatStats> {
  const cutoff30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data, error } = await supabase
    .from("arya_chats")
    .select("channel,status")
    .eq("tenant_id", tenantId)
    .gte("started_at", cutoff30);
  if (error) throw error;

  const rows = data ?? [];
  const resolved = rows.filter((r) => r.status === "resuelto").length;
  const total = rows.length;

  return {
    resolved,
    pending: rows.filter((r) => r.status === "pendiente").length,
    smsCount: rows.filter((r) => r.channel === "sms").length,
    chatCount: rows.filter((r) => r.channel === "chat").length,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
  };
}

export type RetentionContact = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  last_service: string | null;
  equipment: string | null;
  notes: string | null;
};

export async function getRetentionContacts(tenantId: string, limit = 12): Promise<RetentionContact[]> {
  const { data, error } = await supabase
    .from("arya_retention_contacts")
    .select("id,name,phone,email,address,last_service,equipment,notes")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function countRetentionContacts(tenantId: string): Promise<number> {
  const { count, error } = await supabase
    .from("arya_retention_contacts")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId);
  if (error) throw error;
  return count ?? 0;
}
