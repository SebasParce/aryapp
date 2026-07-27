import Link from "next/link";
import type { Chat } from "@/lib/queries";
import { IconMessageCircle, IconMessageSquare } from "./icons";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, string> = {
  resuelto: "bg-emerald-50 text-emerald-700",
  pendiente: "bg-amber-50 text-amber-700",
};

export default function ChatsTable({
  chats,
  tenantSlug,
}: {
  chats: Chat[];
  tenantSlug?: string;
}) {
  const hrefFor = (id: string) =>
    `/chats/${id}${tenantSlug ? `?tenant=${tenantSlug}` : ""}`;

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-arya-border flex items-center justify-between">
        <span className="text-sm font-medium text-arya-ink">Chats y SMS</span>
        <span className="text-xs text-arya-muted">{chats.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Canal</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Cliente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Agente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Motivo</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Último mensaje</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Fecha</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Estado</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted w-8"></th>
            </tr>
          </thead>
          <tbody>
            {chats.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-arya-muted text-sm">
                  Aún no hay chats ni SMS registrados.
                </td>
              </tr>
            )}
            {chats.map((c) => (
              <tr
                key={c.id}
                className="border-b border-arya-border last:border-0 hover:bg-slate-50 transition-colors group"
              >
                <td className="px-4 py-2.5">
                  <Link href={hrefFor(c.id)} className="inline-flex items-center gap-1.5 text-slate-600">
                    {c.channel === "sms" ? (
                      <IconMessageSquare className="w-4 h-4 text-arya-teal" />
                    ) : (
                      <IconMessageCircle className="w-4 h-4 text-arya-teal" />
                    )}
                    {c.channel === "sms" ? "SMS" : "Chat"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-arya-ink">
                  <Link href={hrefFor(c.id)} className="block font-medium group-hover:text-arya-teal">
                    {c.customer_name}
                    <span className="block text-xs font-normal text-slate-400">{c.phone}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <Link href={hrefFor(c.id)} className="block">
                    {c.agent_name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <Link href={hrefFor(c.id)} className="block">
                    {c.tag ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500 max-w-[240px]">
                  <Link href={hrefFor(c.id)} className="block truncate">
                    {c.last_message ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  <Link href={hrefFor(c.id)} className="block">
                    {formatDateTime(c.started_at)}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={hrefFor(c.id)} className="block">
                    <span className={`badge ${statusStyles[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {c.status}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={hrefFor(c.id)}
                    className="text-slate-300 group-hover:text-arya-teal"
                    aria-label="Ver detalle"
                  >
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
