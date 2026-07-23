import { redirect } from "next/navigation";
import RetentionUploader from "@/components/RetentionUploader";
import { listTenants, getRetentionContacts, countRetentionContacts } from "@/lib/queries";
import { getSession } from "@/lib/auth-server";
import { resolveActiveTenant } from "@/lib/tenant-scope";

export const dynamic = "force-dynamic";

export default async function BaseDeDatosPage({
  searchParams,
}: {
  searchParams: Promise<{ tenant?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const tenants = await listTenants();
  if (tenants.length === 0) return null;

  const activeTenant = resolveActiveTenant(session, tenants, params.tenant);
  const contacts = await getRetentionContacts(activeTenant.id, 50);
  const total = await countRetentionContacts(activeTenant.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-arya-ink">Base de datos · {activeTenant.name}</h1>
        <p className="text-sm text-arya-muted">
          Clientes inactivos para llamadas proactivas de retención
        </p>
      </div>

      <RetentionUploader
        tenantSlug={activeTenant.slug}
        contacts={contacts}
        totalCount={total}
      />
    </div>
  );
}
