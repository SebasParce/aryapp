import { redirect } from "next/navigation";
import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import { getSession } from "@/lib/auth-server";
import { listTenants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const allTenants = await listTenants();
  const tenants =
    session.role === "contractor"
      ? allTenants.filter((t) => t.id === session.tenantId)
      : allTenants;

  return (
    <Suspense>
      <AppShell tenants={tenants} user={{ email: session.email, role: session.role }}>
        {children}
      </AppShell>
    </Suspense>
  );
}
