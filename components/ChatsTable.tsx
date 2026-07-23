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

export default function ChatsTable({ chats }: { chats: Chat[] }) {
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
            </tr>
          </thead>
          <tbody>
            {chats.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-arya-muted text-sm">
                  Aún no hay chats ni SMS registrados.
                </td>
              </tr>
            )}
            {chats.map((c) => (
              <tr key={c.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    {c.channel === "sms" ? (
                      <IconMessageSquare className="w-4 h-4 text-arya-blue" />
                    ) : (
                      <IconMessageCircle className="w-4 h-4 text-arya-blue" />
                    )}
                    {c.channel === "sms" ? "SMS" : "Chat"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-arya-ink">
                  {c.customer_name}
                  <div className="text-xs text-slate-400">{c.phone}</div>
                </td>
                <td className="px-4 py-2.5 text-slate-600">{c.agent_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.tag ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-500 max-w-[240px] truncate">
                  {c.last_message ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{formatDateTime(c.started_at)}</td>
                <td className="px-4 py-2.5">
                  <span className={`badge ${statusStyles[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
