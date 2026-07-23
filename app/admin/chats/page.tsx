import Link from "next/link";
import { listTenants } from "@/lib/queries";
import { listChatsForTenant } from "@/lib/admin-queries";
import { createChatAction, deleteChatAction } from "@/app/admin/actions";
import AdminTenantPicker from "@/components/admin/AdminTenantPicker";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const params = await searchParams;
  const tenants = await listTenants();
  if (tenants.length === 0) return <p className="text-sm text-arya-muted">Primero crea un contratista.</p>;
  const activeTenant = tenants.find((t) => t.id === params.tenant) ?? tenants[0];
  const chats = await listChatsForTenant(activeTenant.id, 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-arya-ink">Chats y SMS</h1>
          <p className="text-sm text-arya-muted">{activeTenant.name}</p>
        </div>
        <AdminTenantPicker tenants={tenants} activeId={activeTenant.id} />
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium text-arya-ink mb-3">Nuevo chat/SMS</p>
        <form action={createChatAction} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input type="hidden" name="tenant_id" value={activeTenant.id} />
          <select name="channel" required className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="chat">Chat</option>
            <option value="sms">SMS</option>
          </select>
          <input name="customer_name" placeholder="Cliente" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="phone" placeholder="Teléfono" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="agent_name" placeholder="Agente" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <select name="status" required className="border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="resuelto">Resuelto</option>
            <option value="pendiente">Pendiente</option>
          </select>
          <input name="tag" placeholder="Motivo" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="last_message" placeholder="Último mensaje" className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <input name="started_at" type="datetime-local" required className="border border-arya-border rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="col-span-2 md:col-span-4 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            Crear
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Canal</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Cliente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Estado</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Fecha</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted"></th>
            </tr>
          </thead>
          <tbody>
            {chats.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-arya-muted text-sm">Sin chats.</td></tr>
            )}
            {chats.map((c) => (
              <tr key={c.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-slate-600">{c.channel === "sms" ? "SMS" : "Chat"}</td>
                <td className="px-4 py-2.5 text-arya-ink">{c.customer_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.status}</td>
                <td className="px-4 py-2.5 text-slate-500">{fmt(c.started_at)}</td>
                <td className="px-4 py-2.5 flex items-center gap-3">
                  <Link href={`/admin/chats/${c.id}/edit`} className="text-arya-blue text-xs hover:underline">Editar</Link>
                  <form action={deleteChatAction}>
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
