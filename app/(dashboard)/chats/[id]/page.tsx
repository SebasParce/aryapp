import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TranscriptView from "@/components/TranscriptView";
import AiSummaryCard from "@/components/AiSummaryCard";
import CustomerCard from "@/components/CustomerCard";
import {
  getChatDetail,
  getCustomerHistory,
  parseTranscript,
  listTenants,
} from "@/lib/queries";
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  resolved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
};

export default async function ChatDetailPage({
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

  const chat = await getChatDetail(id);
  if (!chat) notFound();

  if (session.role === "contractor" && chat.tenant_id !== session.tenantId) {
    redirect("/");
  }

  const tenants = await listTenants();
  const tenant = tenants.find((t) => t.id === chat.tenant_id);
  const history = await getCustomerHistory(chat.tenant_id, chat.phone);
  const lines = parseTranscript(chat.transcript);

  const started = new Date(chat.started_at);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/chats${sp.tenant ? `?tenant=${sp.tenant}` : ""}`}
          className="text-xs text-arya-muted hover:text-arya-ink inline-flex items-center gap-1 mb-2"
        >
          ← Back to chats
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-arya-ink">{chat.customer_name}</h1>
          <span className={`badge ${statusStyles[chat.status] ?? "bg-slate-100 text-slate-600"}`}>
            {chat.status}
          </span>
          <span className="badge bg-slate-100 text-slate-600">
            {chat.channel === "sms" ? "SMS" : "Web chat"}
          </span>
        </div>

        <p className="text-sm text-arya-muted mt-1">
          {tenant?.name} · {chat.tag ?? "Unclassified"} ·{" "}
          {started.toLocaleString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-w-0">
          <TranscriptView
            lines={lines}
            agentName={chat.agent_name}
            customerName={chat.customer_name}
          />
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <AiSummaryCard
            summary={chat.ai_summary}
            nextStep={chat.ai_next_step}
            sentiment={chat.sentiment}
          />
          <CustomerCard
            name={chat.customer_name}
            phone={chat.phone}
            email={chat.customer_email}
            address={chat.customer_address}
            history={history}
          />
        </div>
      </div>
    </div>
  );
}
