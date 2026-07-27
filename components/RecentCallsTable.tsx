import Link from "next/link";
import type { RecentCall } from "@/lib/queries";

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const outcomeStyles: Record<string, string> = {
  booked: "bg-emerald-50 text-emerald-700",
  follow_up: "bg-amber-50 text-amber-700",
  not_interested: "bg-slate-100 text-slate-600",
  wrong_number: "bg-rose-50 text-rose-700",
  unclassified: "bg-slate-100 text-slate-500",
};

const outcomeLabels: Record<string, string> = {
  booked: "Booked",
  follow_up: "Follow up",
  not_interested: "Not interested",
  wrong_number: "Wrong number",
  unclassified: "Unclassified",
};

export default function RecentCallsTable({
  calls,
  title = "Recent calls",
  tenantSlug,
  from,
}: {
  calls: RecentCall[];
  title?: string;
  tenantSlug?: string;
  from?: "inbound" | "outbound";
}) {
  const hrefFor = (id: string) => {
    const qs = new URLSearchParams();
    if (tenantSlug) qs.set("tenant", tenantSlug);
    if (from) qs.set("from", from);
    const q = qs.toString();
    return `/calls/${id}${q ? `?${q}` : ""}`;
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-arya-border flex items-center justify-between">
        <span className="text-sm font-medium text-arya-ink">{title}</span>
        <span className="text-xs text-arya-muted">{calls.length} calls</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Customer</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Type</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Agent</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Date</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Duration</th>
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
                    aria-label="View detail"
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
