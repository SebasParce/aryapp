import { notFound } from "next/navigation";
import { getChatById } from "@/lib/admin-queries";
import { listTenants } from "@/lib/queries";
import { updateChatAction, deleteChatAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chat = await getChatById(id);
  if (!chat) notFound();
  const tenants = await listTenants();
  const updateWithId = updateChatAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-arya-ink">Editar chat/SMS</h1>

      <form action={updateWithId} className="card p-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-600">Contratista</label>
          <select name="tenant_id" defaultValue={chat.tenant_id} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Canal</label>
          <select name="channel" defaultValue={chat.channel} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="chat">Chat</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Cliente</label>
          <input name="customer_name" defaultValue={chat.customer_name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Teléfono</label>
          <input name="phone" defaultValue={chat.phone} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Agente</label>
          <input name="agent_name" defaultValue={chat.agent_name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Estado</label>
          <select name="status" defaultValue={chat.status} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="resuelto">Resuelto</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Motivo</label>
          <input name="tag" defaultValue={chat.tag ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-600">Último mensaje</label>
          <input name="last_message" defaultValue={chat.last_message ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-600">Fecha/hora</label>
          <input name="started_at" type="datetime-local" defaultValue={toLocalInput(chat.started_at)} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="col-span-2 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
          Guardar cambios
        </button>
      </form>

      <form action={deleteChatAction} className="card p-4 flex items-center justify-between">
        <p className="text-sm font-medium text-rose-600">Eliminar chat</p>
        <input type="hidden" name="id" value={chat.id} />
        <input type="hidden" name="tenant_id" value={chat.tenant_id} />
        <button type="submit" className="bg-rose-50 text-rose-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-100 cursor-pointer">
          Eliminar
        </button>
      </form>
    </div>
  );
}
