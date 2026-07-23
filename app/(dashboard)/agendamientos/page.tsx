import { redirect } from "next/navigation";
import MetricCard from "@/components/MetricCard";
import AppointmentsTable from "@/components/AppointmentsTable";
import {
  listTenants,
  getUpcomingAppointments,
  getPastAppointments,
  getAppointmentStats,
} from "@/lib/queries";
import { getSession } from "@/lib/auth-server";
import { resolveActiveTenant } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

export default async function AgendamientosPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const tenants = await listTenants();
  if (tenants.length === 0) return null;

  const activeTenant = resolveActiveTenant(session, tenants, params.tenant);
  const stats = await getAppointmentStats(activeTenant.id);
  const upcoming = await getUpcomingAppointments(activeTenant.id, 20);
  const past = await getPastAppointments(activeTenant.id, 15);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Agendamientos · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">Jobs agendados desde llamadas — últimos 30 días</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Jobs agendados" value={stats.jobsBooked30d.toString()} sublabel="últimos 30 días" tone="success" />
        <MetricCard
          label="Valor capturado"
          value={`$${stats.valueCaptured30d.toLocaleString()}`}
          sublabel="últimos 30 días"
          tone="success"
        />
        <MetricCard label="Ticket promedio" value={`$${stats.avgTicket.toLocaleString()}`} sublabel="por job" />
        <MetricCard label="Próximas citas" value={stats.upcomingCount.toString()} sublabel="en agenda" tone="info" />
      </div>

      <AppointmentsTable appointments={upcoming} />
      <AppointmentsTable appointments={past} title="Agendamientos recientes" emptyLabel="Aún no hay historial." />
    </div>
  );
}
