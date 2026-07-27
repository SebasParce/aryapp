import { notFound } from "next/navigation";
import { getCallById } from "@/lib/admin-queries";
import { listTenants } from "@/lib/queries";
import { updateCallAction, deleteCallAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const call = await getCallById(id);
  if (!call) notFound();
  const tenants = await listTenants();

  const updateWithId = updateCallAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-arya-ink">Edit llamada</h1>

      <form action={updateWithId} className="card p-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-600">Contratista</label>
          <select name="tenant_id" defaultValue={call.tenant_id} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Direction</label>
          <select name="direction" defaultValue={call.direction} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Customer</label>
          <input name="customer_name" defaultValue={call.customer_name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Phone</label>
          <input name="phone" defaultValue={call.phone} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Agent</label>
          <input name="agent_name" defaultValue={call.agent_name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Duration (sec)</label>
          <input name="duration_sec" type="number" defaultValue={call.duration_sec} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Outcome</label>
          <select name="outcome" defaultValue={call.outcome} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="booked">Booked</option>
            <option value="follow_up">Follow up</option>
            <option value="not_interested">Not interested</option>
            <option value="wrong_number">Wrong number</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Tipo de servicio</label>
          <input name="service_type" defaultValue={call.service_type ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-600">Fecha/hora</label>
          <input name="occurred_at" type="datetime-local" defaultValue={toLocalInput(call.occurred_at)} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="col-span-2 bg-arya-teal text-white text-sm font-medium py-2 rounded-lg hover:bg-arya-teal-dark cursor-pointer">
          Save cambios
        </button>
      </form>

      <form action={deleteCallAction} className="card p-4 flex items-center justify-between">
        <p className="text-sm font-medium text-rose-600">Delete llamada</p>
        <input type="hidden" name="id" value={call.id} />
        <input type="hidden" name="tenant_id" value={call.tenant_id} />
        <button type="submit" className="bg-rose-50 text-rose-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-100 cursor-pointer">
          Delete
        </button>
      </form>
    </div>
  );
}
