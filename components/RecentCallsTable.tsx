import type { RecentCall } from "@/lib/queries";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const outcomeStyles: Record<string, string> = {
  agendado: "bg-emerald-50 text-emerald-700",
  llamar_despues: "bg-amber-50 text-amber-700",
  no_interesado: "bg-slate-100 text-slate-600",
  numero_equivocado: "bg-rose-50 text-rose-700",
};

const outcomeLabels: Record<string, string> = {
  agendado: "Agendado",
  llamar_despues: "Llamar después",
  no_interesado: "No interesado",
  numero_equivocado: "Número equivocado",
};

export default function RecentCallsTable({
  calls,
  title = "Llamadas recientes",
}: {
  calls: RecentCall[];
  title?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-arya-border flex items-center justify-between">
        <span className="text-sm font-medium text-arya-ink">{title}</span>
        <span className="text-xs text-arya-muted">{calls.length} llamadas</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Cliente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Tipo</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Agente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Fecha</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Duración</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Outcome</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{c.customer_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.service_type ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.agent_name}</td>
                <td className="px-4 py-2.5 text-slate-500">{formatDateTime(c.occurred_at)}</td>
                <td className="px-4 py-2.5 text-slate-500 tabular-nums">{formatDuration(c.duration_sec)}</td>
                <td className="px-4 py-2.5">
                  <span className={`badge ${outcomeStyles[c.outcome] ?? "bg-slate-100 text-slate-600"}`}>
                    {outcomeLabels[c.outcome] ?? c.outcome}
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
