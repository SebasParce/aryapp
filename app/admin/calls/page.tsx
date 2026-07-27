import Link from "next/link";
import { listTenants } from "@/lib/queries";
import { listCallsForTenant } from "@/lib/admin-queries";
import { createCallAction, deleteCallAction } from "@/app/admin/actions";
import AdminTenantPicker from "@/components/admin/AdminTenantPicker";

export const dynamic = "force-dynamic";

function formatDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminCallsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenants = await listTenants();
  if (tenants.length === 0) {
    return <p className="text-sm text-arya-muted">Primero crea un contratista.</p>;
  }
  const activeTenant = tenants.find((t) => t.id === params.tenant) ?? tenants[0];
  const calls = await listCallsForTenant(activeTenant.id, 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-arya-ink">Llamadas</h1>
          <p className="text-sm text-arya-muted">{activeTenant.name}</p>
        </div>
        <AdminTenantPicker tenants={tenants} activeId={activeTenant.id} />
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-arya-ink mb-3">Nueva llamada</p>
        <form action={createCallAction} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="hidden" name="tenant_id" value={activeTenant.id} />
          <select name="direction" required className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
          <input name="customer_name" placeholder="Cliente" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="phone" placeholder="Phone" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="agent_name" placeholder="Agent" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="duration_sec" type="number" placeholder="Duration (sec)" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <select name="outcome" required className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="booked">Booked</option>
            <option value="follow_up">Follow up</option>
            <option value="not_interested">Not interested</option>
            <option value="wrong_number">Wrong number</option>
          </select>
          <input name="service_type" placeholder="Tipo de servicio" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="occurred_at" type="datetime-local" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="bg-arya-teal text-white text-sm font-medium py-2 rounded-lg hover:bg-arya-teal-dark cursor-pointer">
            Create
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Customer</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Direction</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Agent</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Outcome</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Date</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-arya-muted text-sm">Sin llamadas.</td>
              </tr>
            )}
            {calls.map((c) => (
              <tr key={c.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{c.customer_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.direction === "inbound" ? "Entrante" : "Saliente"}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.agent_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.outcome}</td>
                <td className="px-4 py-2.5 text-slate-500">{formatDateTimeLocal(c.occurred_at).replace("T", " ")}</td>
                <td className="px-4 py-2.5 flex items-center gap-3">
                  <Link href={`/admin/calls/${c.id}/edit`} className="text-arya-teal text-xs hover:underline">Edit</Link>
                  <form action={deleteCallAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="tenant_id" value={activeTenant.id} />
                    <button type="submit" className="text-rose-600 text-xs hover:underline cursor-pointer">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
