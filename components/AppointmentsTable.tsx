import type { Appointment } from "@/lib/queries";

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
  confirmada: "bg-emerald-50 text-emerald-700",
  pendiente: "bg-amber-50 text-amber-700",
  cancelada: "bg-rose-50 text-rose-700",
};

export default function AppointmentsTable({
  appointments,
  title = "Próximos agendamientos",
  emptyLabel = "No hay agendamientos próximos.",
}: {
  appointments: Appointment[];
  title?: string;
  emptyLabel?: string;
}) {
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
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Cliente</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Servicio</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Técnico</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Fecha</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Estado</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Valor</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-arya-muted text-sm">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {appointments.map((a) => (
              <tr key={a.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{a.customer_name}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.service_type}</td>
                <td className="px-4 py-2.5 text-slate-600">{a.technician ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-500">{formatDateTime(a.scheduled_at)}</td>
                <td className="px-4 py-2.5">
                  <span className={`badge ${statusStyles[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  {a.value_usd ? `$${a.value_usd.toLocaleString()}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
