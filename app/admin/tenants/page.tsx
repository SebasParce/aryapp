import Link from "next/link";
import { listTenants } from "@/lib/queries";
import { createTenantAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  const tenants = await listTenants();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Contratistas</h1>
        <p className="text-sm text-arya-muted">Crea y edita los contratistas (tenants) de Arya</p>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-arya-ink mb-3">Nuevo contratista</p>
        <form action={createTenantAction} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input name="name" placeholder="Nombre" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="slug" placeholder="slug-unico" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="trade" placeholder="Rubro (HVAC, etc.)" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="city" placeholder="Ciudad" defaultValue="South Florida" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="col-span-2 md:col-span-4 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            Crear contratista
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Nombre</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Slug</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Rubro</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Ciudad</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{t.name}</td>
                <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-2.5 text-slate-600">{t.trade}</td>
                <td className="px-4 py-2.5 text-slate-600">{t.city}</td>
                <td className="px-4 py-2.5">
                  <Link href={`/admin/tenants/${t.id}/edit`} className="text-arya-blue text-xs hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
