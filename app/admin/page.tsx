import Link from "next/link";
import { listTenants } from "@/lib/queries";
import { getTenantCounts, type TenantCounts } from "@/lib/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const tenants = await listTenants();
  const countsList = await Promise.all(tenants.map((t) => getTenantCounts(t.id)));
  const countsByTenant = new Map<string, TenantCounts>(
    tenants.map((t, i) => [t.id, countsList[i]])
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-arya-ink">Panel admin</h1>
          <p className="text-sm text-arya-muted">
            Datos que alimentan cada dashboard de contratista
          </p>
        </div>
        <Link
          href="/admin/tenants"
          className="bg-arya-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Gestionar contratistas
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-arya-border">
          <span className="text-sm font-medium text-arya-ink">Contratistas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-arya-border text-left">
                <th className="px-4 py-2 font-normal text-xs text-arya-muted">Nombre</th>
                <th className="px-4 py-2 font-normal text-xs text-arya-muted">Rubro</th>
                <th className="px-4 py-2 font-normal text-xs text-arya-muted">Llamadas</th>
                <th className="px-4 py-2 font-normal text-xs text-arya-muted">Chats</th>
                <th className="px-4 py-2 font-normal text-xs text-arya-muted">Agendamientos</th>
                <th className="px-4 py-2 font-normal text-xs text-arya-muted">Retención</th>
                <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-arya-muted text-sm">
                    Aún no hay contratistas. Crea el primero.
                  </td>
                </tr>
              )}
              {tenants.map((t) => {
                const counts = countsByTenant.get(t.id)!;
                return (
                  <tr key={t.id} className="border-b border-arya-border last:border-0">
                    <td className="px-4 py-2.5 text-arya-ink">{t.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{t.trade}</td>
                    <td className="px-4 py-2.5 text-slate-500">{counts.calls}</td>
                    <td className="px-4 py-2.5 text-slate-500">{counts.chats}</td>
                    <td className="px-4 py-2.5 text-slate-500">{counts.appointments}</td>
                    <td className="px-4 py-2.5 text-slate-500">{counts.retention}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/tenants/${t.id}/edit`} className="text-arya-blue text-xs hover:underline">
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
