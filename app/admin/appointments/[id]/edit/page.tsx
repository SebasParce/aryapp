import { notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/admin-queries";
import { listTenants } from "@/lib/queries";
import { updateAppointmentAction, deleteAppointmentAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appt = await getAppointmentById(id);
  if (!appt) notFound();
  const tenants = await listTenants();
  const updateWithId = updateAppointmentAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-arya-ink">Editar agendamiento</h1>

      <form action={updateWithId} className="card p-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-600">Contratista</label>
          <select name="tenant_id" defaultValue={appt.tenant_id} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Cliente</label>
          <input name="customer_name" defaultValue={appt.customer_name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Teléfono</label>
          <input name="phone" defaultValue={appt.phone} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Dirección</label>
          <input name="address" defaultValue={appt.address ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Servicio</label>
          <input name="service_type" defaultValue={appt.service_type} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Técnico</label>
          <input name="technician" defaultValue={appt.technician ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Estado</label>
          <select name="status" defaultValue={appt.status} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            <option value="confirmada">Confirmada</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Valor USD</label>
          <input name="value_usd" type="number" defaultValue={appt.value_usd ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-600">Fecha/hora</label>
          <input name="scheduled_at" type="datetime-local" defaultValue={toLocalInput(appt.scheduled_at)} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="col-span-2 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
          Guardar cambios
        </button>
      </form>

      <form action={deleteAppointmentAction} className="card p-4 flex items-center justify-between">
        <p className="text-sm font-medium text-rose-600">Eliminar agendamiento</p>
        <input type="hidden" name="id" value={appt.id} />
        <input type="hidden" name="tenant_id" value={appt.tenant_id} />
        <button type="submit" className="bg-rose-50 text-rose-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-100 cursor-pointer">
          Eliminar
        </button>
      </form>
    </div>
  );
}
