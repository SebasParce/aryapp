"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { Tenant } from "@/lib/queries";
import Logo from "./Logo";
import {
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconMessageCircle,
  IconCalendar,
  IconDatabase,
} from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Resumen", icon: IconPhoneIncoming },
  { href: "/llamadas-hechas", label: "Llamadas hechas", icon: IconPhoneOutgoing },
  { href: "/chats", label: "Chats", icon: IconMessageCircle },
  { href: "/agendamientos", label: "Agendamientos", icon: IconCalendar },
  { href: "/base-de-datos", label: "Cargar base de datos", icon: IconDatabase },
];

type ShellUser = {
  email: string;
  role: "admin" | "contractor";
};

export default function AppShell({
  tenants,
  user,
  children,
}: {
  tenants: Tenant[];
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin = user.role === "admin";

  const activeSlug = isAdmin
    ? searchParams.get("tenant") || tenants[0]?.slug || ""
    : tenants[0]?.slug ?? "";
  const activeTenant = tenants.find((t) => t.slug === activeSlug) ?? tenants[0];

  const withTenant = (href: string) => {
    if (!isAdmin || !activeSlug) return href;
    return `${href}${href.includes("?") ? "&" : "?"}tenant=${activeSlug}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 shrink-0 bg-white border-r border-arya-border flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-arya-border">
          <Logo className="h-7" />
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={withTenant(item.href)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-arya-blue-light text-arya-blue font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-arya-ink"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="h-px bg-arya-border my-2" />
              <Link
                href="/admin"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-arya-blue-light text-arya-blue font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-arya-ink"
                }`}
              >
                <span className="w-4 h-4 shrink-0 flex items-center justify-center text-xs">⚙</span>
                Panel admin
              </Link>
            </>
          )}
        </nav>

        {activeTenant && (
          <div className="px-5 py-4 border-t border-arya-border">
            <p className="text-xs font-medium text-arya-ink truncate">{activeTenant.name}</p>
            <p className="text-[11px] text-arya-muted">
              {activeTenant.trade} · {activeTenant.city}
            </p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-arya-border flex items-center justify-between gap-2">
          <span className="text-[11px] text-arya-muted truncate">{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-[11px] text-arya-muted hover:text-arya-ink underline cursor-pointer shrink-0"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-arya-border flex items-center justify-between px-6 shrink-0">
          <p className="text-sm text-arya-muted">
            {NAV_ITEMS.find((i) => i.href === pathname)?.label ?? ""}
          </p>
          {isAdmin ? (
            <select
              value={activeSlug}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("tenant", e.target.value);
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="bg-white border border-arya-border rounded-lg px-3 py-1.5 text-sm font-medium text-arya-ink focus:outline-none focus:ring-2 focus:ring-arya-blue/40 cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium text-arya-ink">{activeTenant?.name}</span>
          )}
        </header>

        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
