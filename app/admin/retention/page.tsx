import Link from "next/link";
import { listTenants } from "@/lib/queries";
import { listRetentionForTenant } from "@/lib/admin-queries";
import { createRetentionAction, deleteRetentionAction } from "@/app/admin/actions";
import AdminTenantPicker from "@/components/admin/AdminTenantPicker";

export const dynamic = "force-dynamic";

export default async function AdminRetentionPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenants = await listTenants();
  if (tenants.length === 0) return <p className="text-sm text-arya-muted">Primero crea un contratista.</p>;
  const activeTenant = tenants.find((t) => t.id === params.tenant) ?? tenants[0];
  const contacts = await listRetentionForTenant(activeTenant.id, 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-arya-ink">Base de retención</h1>
          <p className="text-sm text-arya-muted">{activeTenant.name}</p>
        </div>
        <AdminTenantPicker tenants={tenants} activeId={activeTenant.id} />
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-arya-ink mb-3">Nuevo contacto</p>
        <form action={createRetentionAction} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="hidden" name="tenant_id" value={activeTenant.id} />
          <input name="name" placeholder="Nombre" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="phone" placeholder="Teléfono" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="email" placeholder="Email" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="address" placeholder="Dirección" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="last_service" type="date" placeholder="Último servicio" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="equipment" placeholder="Equipo" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="notes" placeholder="Notas" className="border border-arya-border rounded-lg px-3 py-2 text-sm col-span-2" />
          <button type="submit" className="col-span-2 md:col-span-4 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            Crear
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Nombre</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Teléfono</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Equipo</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-arya-muted text-sm">Sin contactos.</td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{c.name}</td>
                <td className="px-4 py-2.5 text-slate-500">{c.phone}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.equipment ?? "—"}</td>
                <td className="px-4 py-2.5 flex items-center gap-3">
                  <Link href={`/admin/retention/${c.id}/edit`} className="text-arya-blue text-xs hover:underline">Editar</Link>
                  <form action={deleteRetentionAction}>
                    <input type="hidden" name="id" value={c.id} />
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
