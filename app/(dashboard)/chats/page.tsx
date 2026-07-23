import { redirect } from "next/navigation";
import MetricCard from "@/components/MetricCard";
import ChatsTable from "@/components/ChatsTable";
import { listTenants, getChatStats, getChats } from "@/lib/queries";
import { getSession } from "@/lib/auth-server";
import { resolveActiveTenant } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

export default async function ChatsPage({
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
  const stats = await getChatStats(activeTenant.id);
  const chats = await getChats(activeTenant.id, 50);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Chats · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">Conversaciones de chat y SMS — últimos 30 días</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Chats resueltos" value={stats.resolved.toString()} sublabel="últimos 30 días" tone="success" />
        <MetricCard label="Chats pendientes" value={stats.pending.toString()} sublabel="por atender" />
        <MetricCard label="SMS enviados" value={stats.smsCount.toString()} sublabel="últimos 30 días" tone="info" />
        <MetricCard label="Tasa de resolución" value={`${stats.resolutionRate}%`} sublabel="chats + sms" tone="info" />
      </div>

      <ChatsTable chats={chats} />
    </div>
  );
}
