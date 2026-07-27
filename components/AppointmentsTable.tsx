import Link from "next/link";
import type { Appointment } from "@/lib/queries";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-rose-50 text-rose-700",
};

export default function AppointmentsTable({
  appointments,
  title = "Upcoming appointments",
  emptyLabel = "No upcoming appointments.",
  tenantSlug,
}: {
  appointments: Appointment[];
  title?: string;
  emptyLabel?: string;
  tenantSlug?: string;
}) {
  const hrefFor = (id: string) =>
    `/appointments/${id}${tenantSlug ? `?tenant=${tenantSlug}` : ""}`;

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-arya-border flex items-center justify-between">
        <span className="text-sm font-medium text-arya-ink">{title}</span>
        <span className="text-xs text-arya-muted">{appointments.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Customer</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Service</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Technician</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Date</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Status</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Value</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted w-8"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-arya-muted text-sm">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {appointments.map((a) => (
              <tr
                key={a.id}
                className="border-b border-arya-border last:border-0 hover:bg-slate-50 transition-colors group"
              >
                <td className="px-4 py-2.5 text-arya-ink">
                  <Link href={hrefFor(a.id)} className="block font-medium group-hover:text-arya-teal">
                    {a.customer_name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <Link href={hrefFor(a.id)} className="block">
                    {a.service_type}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  <Link href={hrefFor(a.id)} className="block">
                    {a.technician ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  <Link href={hrefFor(a.id)} className="block">
                    {formatDateTime(a.scheduled_at)}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <Link href={hrefFor(a.id)} className="block">
                    <span className={`badge ${statusStyles[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {a.status}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  <Link href={hrefFor(a.id)} className="block">
                    {a.value_usd ? `$${a.value_usd.toLocaleString()}` : "—"}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={hrefFor(a.id)}
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
