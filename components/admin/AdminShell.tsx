"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/tenants", label: "Contratistas" },
  { href: "/admin/calls", label: "Llamadas" },
  { href: "/admin/chats", label: "Chats" },
  { href: "/admin/appointments", label: "Agendamientos" },
  { href: "/admin/retention", label: "Retención" },
  { href: "/admin/users", label: "Usuarios" },
];

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 shrink-0 bg-white border-r border-arya-border flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-arya-border">
          <Logo className="h-7" />
          <span className="text-[11px] font-medium text-arya-muted bg-slate-100 px-1.5 py-0.5 rounded">
            admin
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-arya-blue-light text-arya-blue font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-arya-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="h-px bg-arya-border my-2" />
          <Link
            href="/"
            className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-arya-ink"
          >
            ← Ver dashboards
          </Link>
        </nav>

        <div className="px-5 py-3 border-t border-arya-border flex items-center justify-between gap-2">
          <span className="text-[11px] text-arya-muted truncate">{email}</span>
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
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
