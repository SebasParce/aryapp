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
        No contractors loaded yet.
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
        <h1 className="text-xl font-semibold text-arya-ink">Overview · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Minutes talked" value={metrics.minutesTalked.toLocaleString()} sublabel="voz total" />
        <MetricCard
          label="Inbound calls"
          value={metrics.callsInbound.toString()}
          sublabel={inboundDelta >= 0 ? `+${inboundDelta} vs. anterior` : `${inboundDelta} vs. anterior`}
          tone="success"
        />
        <MetricCard
          label="Outbound calls"
          value={metrics.callsOutbound.toString()}
          sublabel={outboundDelta >= 0 ? `+${outboundDelta} vs. anterior` : `${outboundDelta} vs. anterior`}
          tone="success"
        />
        <MetricCard
          label="Llamadas → cita"
          value={`${metrics.conversionRate}%`}
          sublabel="conversion rate"
          tone="info"
        />
        <MetricCard label="Jobs booked" value={metrics.jobsBooked.toString()} sublabel="last 30 days" tone="info" />
      </div>

      <RecentCallsTable
        calls={inboundCalls}
        title="Inbound calls"
        tenantSlug={activeTenant.slug}
        from="inbound"
      />
    </div>
  );
}
