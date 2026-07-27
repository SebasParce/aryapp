import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import RecordingPlayer from "@/components/RecordingPlayer";
import TranscriptView from "@/components/TranscriptView";
import AiSummaryCard from "@/components/AiSummaryCard";
import CustomerCard from "@/components/CustomerCard";
import {
  getCallDetail,
  getCustomerHistory,
  parseTranscript,
  listTenants,
} from "@/lib/queries";
import { getSession } from "@/lib/auth-server";
import { getRecordingUrl } from "@/lib/recordings";

export const dynamic = "force-dynamic";

const outcomeStyles: Record<string, string> = {
  booked: "bg-emerald-50 text-emerald-700",
  follow_up: "bg-amber-50 text-amber-700",
  not_interested: "bg-slate-100 text-slate-600",
  wrong_number: "bg-slate-100 text-slate-500",
  unclassified: "bg-slate-100 text-slate-500",
};

const outcomeLabels: Record<string, string> = {
  booked: "Booked",
  follow_up: "Follow up",
  not_interested: "Not interested",
  wrong_number: "Wrong number",
  unclassified: "Unclassified",
};

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default async function CallDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenant?: string; from?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  const call = await getCallDetail(id);
  if (!call) notFound();

  // Un contratista solo puede ver llamadas de su propio tenant.
  if (session.role === "contractor" && call.tenant_id !== session.tenantId) {
    redirect("/");
  }

  const tenants = await listTenants();
  const tenant = tenants.find((t) => t.id === call.tenant_id);
  const history = await getCustomerHistory(call.tenant_id, call.phone, call.id);
  const lines = parseTranscript(call.transcript);
  const recordingUrl = await getRecordingUrl(call.recording_path);

  const backHref =
    sp.from === "outbound"
      ? `/outbound-calls${sp.tenant ? `?tenant=${sp.tenant}` : ""}`
      : `/${sp.tenant ? `?tenant=${sp.tenant}` : ""}`;

  const occurred = new Date(call.occurred_at);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={backHref}
          className="text-xs text-arya-muted hover:text-arya-ink inline-flex items-center gap-1 mb-2"
        >
          ← Back to {sp.from === "outbound" ? "outbound calls" : "inbound calls"}
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-arya-ink">{call.customer_name}</h1>
          <span
            className={`badge ${outcomeStyles[call.outcome] ?? "bg-slate-100 text-slate-600"}`}
          >
            {outcomeLabels[call.outcome] ?? call.outcome}
          </span>
          <span className="badge bg-slate-100 text-slate-600">
            {call.direction === "inbound" ? "Entrante" : "Saliente"}
          </span>
        </div>

        <p className="text-sm text-arya-muted mt-1">
          {tenant?.name} · {call.service_type ?? "Unclassified"} ·{" "}
          {occurred.toLocaleString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          · {fmtDuration(call.duration_sec)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
          <RecordingPlayer
            durationSec={call.duration_sec}
            agentName={call.agent_name}
            src={recordingUrl}
          />
          <TranscriptView
            lines={lines}
            agentName={call.agent_name}
            customerName={call.customer_name}
          />
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <AiSummaryCard
            summary={call.ai_summary}
            nextStep={call.ai_next_step}
            sentiment={call.sentiment}
          />
          <CustomerCard
            name={call.customer_name}
            phone={call.phone}
            email={call.customer_email}
            address={call.customer_address}
            history={history}
          />
        </div>
      </div>
    </div>
  );
}
