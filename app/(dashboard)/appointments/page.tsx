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
        <h1 className="text-xl font-semibold text-arya-ink">Appointments · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">Jobs booked from calls — last 30 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Jobs booked" value={stats.jobsBooked30d.toString()} sublabel="last 30 days" tone="success" />
        <MetricCard
          label="Value captured"
          value={`$${stats.valueCaptured30d.toLocaleString()}`}
          sublabel="last 30 days"
          tone="success"
        />
        <MetricCard label="Average ticket" value={`$${stats.avgTicket.toLocaleString()}`} sublabel="per job" />
        <MetricCard label="Upcoming appointments" value={stats.upcomingCount.toString()} sublabel="on the calendar" tone="info" />
      </div>

      <AppointmentsTable appointments={upcoming} tenantSlug={activeTenant.slug} />
      <AppointmentsTable
        appointments={past}
        title="Recent appointments"
        emptyLabel="No history yet."
        tenantSlug={activeTenant.slug}
      />
    </div>
  );
}
