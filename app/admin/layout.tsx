import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
