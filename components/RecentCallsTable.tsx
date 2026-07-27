import Link from "next/link";
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
  tenantSlug,
  from,
}: {
  calls: RecentCall[];
  title?: string;
  tenantSlug?: string;
  from?: "recibidas" | "hechas";
}) {
  const hrefFor = (id: string) => {
    const qs = new URLSearchParams();
    if (tenantSlug) qs.set("tenant", tenantSlug);
    if (from) qs.set("from", from);
    const q = qs.toString();
    return `/llamadas/${id}${q ? `?${q}` : ""}`;
  };

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
              <th className="px-4 py-2 font-normal text-xs text-arya-muted w-8"></th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr
                key={c.id}
                className="border-b border-arya-border last:border-0 hover:bg-slate-50 transition-colors group"
              >
                <td className="px-4 py-2.5 text-arya-ink">
                  <Link href={hrefFor(c.id)} className="block font-medium group-hover:text-arya-teal">
                    {c.customer_name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <Link href={hrefFor(c.id)} className="block">
                    {c.service_type ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <Link href={hrefFor(c.id)} className="block">
                    {c.agent_name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  <Link href={hrefFor(c.id)} className="block">
                    {formatDateTime(c.occurred_at)}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500 tabular-nums">
                  <Link href={hrefFor(c.id)} className="block">
                    {formatDuration(c.duration_sec)}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={hrefFor(c.id)} className="block">
                    <span className={`badge ${outcomeStyles[c.outcome] ?? "bg-slate-100 text-slate-600"}`}>
                      {outcomeLabels[c.outcome] ?? c.outcome}
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
