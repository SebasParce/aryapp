import { redirect } from "next/navigation";
import MetricCard from "@/components/MetricCard";
import RecentCallsTable from "@/components/RecentCallsTable";
import { listTenants, getMetrics, getCallsByDirection } from "@/lib/queries";
import { getSession } from "@/lib/auth-server";
import { resolveActiveTenant } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

export default async function ResumenPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const tenants = await listTenants();

  if (tenants.length === 0) {
    return (
      <p className="text-arya-muted text-sm">
        No hay contratistas cargados todavía. Corre <code className="mx-1">npm run db:seed</code>.
      </p>
    );
  }

  const activeTenant = resolveActiveTenant(session, tenants, params.tenant);
  const metrics = await getMetrics(activeTenant.id);
  const inboundCalls = await getCallsByDirection(activeTenant.id, "inbound", 50);

  const inboundDelta = metrics.callsInbound - metrics.callsPrevInbound;
  const outboundDelta = metrics.callsOutbound - metrics.callsPrevOutbound;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Resumen · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">Últimos 30 días</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Minutos hablados" value={metrics.minutesTalked.toLocaleString()} sublabel="voz total" />
        <MetricCard
          label="Llamadas recibidas"
          value={metrics.callsInbound.toString()}
          sublabel={inboundDelta >= 0 ? `+${inboundDelta} vs. anterior` : `${inboundDelta} vs. anterior`}
          tone="success"
        />
        <MetricCard
          label="Llamadas hechas"
          value={metrics.callsOutbound.toString()}
          sublabel={outboundDelta >= 0 ? `+${outboundDelta} vs. anterior` : `${outboundDelta} vs. anterior`}
          tone="success"
        />
        <MetricCard
          label="Llamadas → cita"
          value={`${metrics.conversionRate}%`}
          sublabel="tasa de conversión"
          tone="info"
        />
        <MetricCard label="Jobs agendados" value={metrics.jobsBooked.toString()} sublabel="últimos 30 días" tone="info" />
      </div>

      <RecentCallsTable calls={inboundCalls} title="Llamadas recibidas" />
    </div>
  );
}
