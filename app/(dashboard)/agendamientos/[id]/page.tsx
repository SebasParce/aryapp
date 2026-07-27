import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AiSummaryCard from "@/components/AiSummaryCard";
import CustomerCard from "@/components/CustomerCard";
import {
  getAppointmentDetail,
  getCustomerHistory,
  listTenants,
} from "@/lib/queries";
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  confirmada: "bg-emerald-50 text-emerald-700",
  pendiente: "bg-amber-50 text-amber-700",
  cancelada: "bg-rose-50 text-rose-700",
};

const priorityStyles: Record<string, string> = {
  alta: "bg-rose-50 text-rose-700",
  media: "bg-amber-50 text-amber-700",
  baja: "bg-slate-100 text-slate-600",
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-arya-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm text-arya-ink">{value ?? "—"}</span>
    </div>
  );
}

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenant?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  const appt = await getAppointmentDetail(id);
  if (!appt) notFound();

  if (session.role === "contractor" && appt.tenant_id !== session.tenantId) {
    redirect("/");
  }

  const tenants = await listTenants();
  const tenant = tenants.find((t) => t.id === appt.tenant_id);
  const history = await getCustomerHistory(appt.tenant_id, appt.phone);

  const scheduled = new Date(appt.scheduled_at);
  const isPast = scheduled.getTime() < Date.now();
  const qs = sp.tenant ? `?tenant=${sp.tenant}` : "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/agendamientos${qs}`}
          className="text-xs text-arya-muted hover:text-arya-ink inline-flex items-center gap-1 mb-2"
        >
          ← Volver a agendamientos
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-arya-ink">{appt.customer_name}</h1>
          <span className={`badge ${statusStyles[appt.status] ?? "bg-slate-100 text-slate-600"}`}>
            {appt.status}
          </span>
          {appt.priority && (
            <span className={`badge ${priorityStyles[appt.priority] ?? "bg-slate-100 text-slate-600"}`}>
              Prioridad {appt.priority}
            </span>
          )}
          {isPast && <span className="badge bg-slate-100 text-slate-500">Completada</span>}
        </div>

        <p className="text-sm text-arya-muted mt-1">
          {tenant?.name} · {appt.service_type} ·{" "}
          {scheduled.toLocaleString("es-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
          <div className="card p-4 flex flex-col gap-4">
            <span className="text-sm font-medium text-arya-ink">Detalle del servicio</span>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Servicio" value={appt.service_type} />
              <Field label="Técnico asignado" value={appt.technician} />
              <Field
                label="Duración estimada"
                value={appt.duration_min ? `${appt.duration_min} min` : null}
              />
              <Field label="Equipo" value={appt.equipment} />
              <Field
                label="Valor"
                value={appt.value_usd ? `$${appt.value_usd.toLocaleString()}` : null}
              />
              <Field
                label="Origen"
                value={
                  appt.source_channel === "llamada"
                    ? "Llamada entrante"
                    : appt.source_channel === "chat"
                      ? "Chat web"
                      : appt.source_channel === "sms"
                        ? "SMS"
                        : null
                }
              />
            </div>

            <div className="border-t border-arya-border pt-4">
              <p className="text-[11px] font-medium text-arya-muted uppercase tracking-wide mb-1">
                Problema reportado
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {appt.problem_summary ?? "Sin detalle registrado."}
              </p>
            </div>

            <div className="border-t border-arya-border pt-4">
              <p className="text-[11px] font-medium text-arya-muted uppercase tracking-wide mb-1">
                Dirección de servicio
              </p>
              <p className="text-sm text-slate-700">{appt.address ?? "—"}</p>
            </div>
          </div>

          {appt.technician_notes && (
            <div className="card p-4">
              <span className="text-sm font-medium text-arya-ink">Notas del técnico</span>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">
                {appt.technician_notes}
              </p>
            </div>
          )}

          {appt.source_call_id && (
            <div className="card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-sm font-medium text-arya-ink">Llamada que originó la cita</span>
                <p className="text-xs text-arya-muted mt-0.5">
                  Escucha la grabación y lee la transcripción completa.
                </p>
              </div>
              <Link
                href={`/llamadas/${appt.source_call_id}${qs}`}
                className="text-sm font-medium text-arya-blue hover:underline shrink-0"
              >
                Ver llamada →
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <AiSummaryCard
            summary={appt.ai_summary}
            nextStep={appt.ai_next_step}
            sentiment={null}
          />
          <CustomerCard
            name={appt.customer_name}
            phone={appt.phone}
            email={appt.customer_email}
            address={appt.address}
            history={history}
          />
        </div>
      </div>
    </div>
  );
}
