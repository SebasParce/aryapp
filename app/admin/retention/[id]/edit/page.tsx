import { notFound } from "next/navigation";
import { getRetentionById } from "@/lib/admin-queries";
import { listTenants } from "@/lib/queries";
import { updateRetentionAction, deleteRetentionAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditRetentionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getRetentionById(id);
  if (!contact) notFound();
  const tenants = await listTenants();
  const updateWithId = updateRetentionAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-arya-ink">Editar contacto de retención</h1>

      <form action={updateWithId} className="card p-4 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-600">Contratista</label>
          <select name="tenant_id" defaultValue={contact.tenant_id} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm">
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Nombre</label>
          <input name="name" defaultValue={contact.name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Teléfono</label>
          <input name="phone" defaultValue={contact.phone} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Email</label>
          <input name="email" defaultValue={contact.email ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Dirección</label>
          <input name="address" defaultValue={contact.address ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Último servicio</label>
          <input name="last_service" type="date" defaultValue={contact.last_service ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Equipo</label>
          <input name="equipment" defaultValue={contact.equipment ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-600">Notas</label>
          <input name="notes" defaultValue={contact.notes ?? ""} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="col-span-2 bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
          Guardar cambios
        </button>
      </form>

      <form action={deleteRetentionAction} className="card p-4 flex items-center justify-between">
        <p className="text-sm font-medium text-rose-600">Eliminar contacto</p>
        <input type="hidden" name="id" value={contact.id} />
        <input type="hidden" name="tenant_id" value={contact.tenant_id} />
        <button type="submit" className="bg-rose-50 text-rose-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-100 cursor-pointer">
          Eliminar
        </button>
      </form>
    </div>
  );
}
