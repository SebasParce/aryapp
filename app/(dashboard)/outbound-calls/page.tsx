import { redirect } from "next/navigation";
import MetricCard from "@/components/MetricCard";
import RecentCallsTable from "@/components/RecentCallsTable";
import { listTenants, getCallsByDirection, getDirectionStats } from "@/lib/queries";
import { getSession } from "@/lib/auth-server";
import { resolveActiveTenant } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

export default async function LlamadasHechasPage({
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
  const stats = await getDirectionStats(activeTenant.id, "outbound");
  const calls = await getCallsByDirection(activeTenant.id, "outbound", 50);
  const delta = stats.count - stats.prevCount;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Outbound calls · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">Outbound retention and follow-up calls — last 30 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Outbound calls"
          value={stats.count.toString()}
          sublabel={delta >= 0 ? `+${delta} vs. anterior` : `${delta} vs. anterior`}
          tone="success"
        />
        <MetricCard label="Minutes talked" value={stats.totalMinutes.toLocaleString()} sublabel="voz saliente" />
        <MetricCard
          label="Average duration"
          value={`${Math.floor(stats.avgDurationSec / 60)}:${String(stats.avgDurationSec % 60).padStart(2, "0")}`}
          sublabel="por llamada"
        />
        <MetricCard label="Tasa de agendado" value={`${stats.bookedRate}%`} sublabel="terminan en cita" tone="info" />
      </div>

      <RecentCallsTable
        calls={calls}
        title="Outbound calls"
        tenantSlug={activeTenant.slug}
        from="outbound"
      />
    </div>
  );
}
