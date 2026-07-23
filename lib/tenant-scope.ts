import type { SessionPayload } from "./session";
import type { Tenant } from "./queries";

// Un contratista siempre ve su propio tenant (ignora ?tenant= aunque lo
// manipulen en la URL). Un admin puede navegar entre todos vía ?tenant=.
export function resolveActiveTenant(
  session: SessionPayload,
  tenants: Tenant[],
  requestedSlug?: string
): Tenant {
  if (session.role === "contractor") {
    return tenants.find((t) => t.id === session.tenantId) ?? tenants[0];
  }
  return tenants.find((t) => t.slug === requestedSlug) ?? tenants[0];
}
