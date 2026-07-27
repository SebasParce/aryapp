import type { SessionPayload } from "./session";
import type { Tenant } from "./queries";

// A contractor always sees their own tenant (?tenant= in the URL is ignored
// even if tampered with). An admin can switch between all of them via ?tenant=.
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
