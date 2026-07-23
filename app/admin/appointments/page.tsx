import Link from "next/link";
import { listTenants } from "@/lib/queries";
import { listAppointmentsForTenant } from "@/lib/admin-queries";
import { createAppointmentAction, deleteAppointmentAction } from "@/app/admin/actions";
import AdminTenantPicker from "@/components/admin/AdminTenantPicker";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenants = await listTenants();
  if (tenants.length === 0) return <p className="text-sm text-arya-muted">Primero crea un contratista.</p>;
  const activeTenant = tenants.find((t) => t.id === params.tenant) ?? tenants[0];
  const appointments = await listAppointmentsForTenant(activeTenant.id, 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-arya-ink">Agendamientos</h1>
          <p className="text-sm text-arya-muted">{activeTenant.name}</p>
        </div>
        <AdminTenantPicker tenants={tenants} activeId={activeTenant.id} />
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-arya-ink mb-3">Nuevo agendamiento</p>
        <form action={createAppointmentAction} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="hidden" name="tenant_id" value={activeTenant.id} />
          <input name="customer_name" placeholder="Cliente" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="phone" placeholder="Teléfono" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="address" placeholder="Dirección" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="service_type" placeholder="Servicio" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="technician" placeholder="Técnico" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <select name="status" required className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="confirmada">Confirmada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <input name="value_usd" type="number" placeholder="Valor USD" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="scheduled_at" type="datetime-local" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="col-span-2 md:col-span-4 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            Crear
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Cliente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Servicio</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Estado</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Fecha</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Valor</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-arya-muted text-sm">Sin agendamientos.</td></tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{a.customer_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.service_type}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.status}</td>
                <td className="px-4 py-2.5 text-slate-500">{fmt(a.scheduled_at)}</td>
                <td className="px-4 py-2.5 text-slate-500">{a.value_usd ? `$${a.value_usd}` : "—"}</td>
                <td className="px-4 py-2.5 flex items-center gap-3">
                  <Link href={`/admin/appointments/${a.id}/edit`} className="text-arya-blue text-xs hover:underline">Editar</Link>
                  <form action={deleteAppointmentAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="tenant_id" value={activeTenant.id} />
                    <button type="submit" className="text-rose-600 text-xs hover:underline cursor-pointer">Eliminar</button>
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
