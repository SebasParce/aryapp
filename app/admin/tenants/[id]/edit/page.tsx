import { notFound } from "next/navigation";
import { getTenantById } from "@/lib/admin-queries";
import { updateTenantAction, deleteTenantAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  const updateWithId = updateTenantAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Editar contratista</h1>
        <p className="text-sm text-arya-muted">{tenant.name}</p>
      </div>

      <form action={updateWithId} className="card p-4 flex flex-col gap-3">
        <div>
          <label className="text-xs text-slate-600">Nombre</label>
          <input name="name" defaultValue={tenant.name} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Slug</label>
          <input name="slug" defaultValue={tenant.slug} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Rubro</label>
          <input name="trade" defaultValue={tenant.trade} required className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-600">Ciudad</label>
          <input name="city" defaultValue={tenant.city} className="w-full border border-arya-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
          Guardar cambios
        </button>
      </form>

      <form action={deleteTenantAction} className="card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-rose-600">Eliminar contratista</p>
          <p className="text-xs text-arya-muted">Borra también sus llamadas, chats, agendamientos y retención.</p>
        </div>
        <input type="hidden" name="id" value={tenant.id} />
        <button type="submit" className="bg-rose-50 text-rose-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-100 cursor-pointer">
          Eliminar
        </button>
      </form>
    </div>
  );
}
