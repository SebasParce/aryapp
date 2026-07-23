import { listTenants } from "@/lib/queries";
import { listUsers } from "@/lib/admin-queries";
import { createUserAction, deleteUserAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const tenants = await listTenants();
  const users = await listUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Usuarios</h1>
        <p className="text-sm text-arya-muted">Logins de acceso al panel admin y a cada dashboard de contratista</p>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-arya-ink mb-3">Nuevo usuario</p>
        <form action={createUserAction} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input name="email" type="email" placeholder="Correo" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="password" type="password" placeholder="Contraseña" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <select name="role" required className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="contractor">Contratista</option>
            <option value="admin">Admin</option>
          </select>
          <select name="tenant_id" className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="">— (solo si es contratista)</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button type="submit" className="col-span-2 md:col-span-4 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            Crear usuario
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Correo</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Rol</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Contratista</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{u.email}</td>
                <td className="px-4 py-2.5">
                  <span className={`badge ${u.role === "admin" ? "bg-arya-blue-soft text-arya-blue" : "bg-slate-100 text-slate-600"}`}>
                    {u.role === "admin" ? "Admin" : "Contratista"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{u.tenant_name ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={u.id} />
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
