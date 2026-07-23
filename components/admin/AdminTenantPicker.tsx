"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Tenant } from "@/lib/queries";

export default function AdminTenantPicker({
  tenants,
  activeId,
}: {
  tenants: Tenant[];
  activeId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={activeId}
      onChange={(e) => router.push(`${pathname}?tenant=${e.target.value}`)}
      className="bg-white border border-arya-border rounded-lg px-3 py-1.5 text-sm font-medium text-arya-ink focus:outline-none focus:ring-2 focus:ring-arya-blue/40 cursor-pointer"
    >
      {tenants.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
