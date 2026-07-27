import type { TranscriptLine } from "@/lib/queries";

export default function TranscriptView({
  lines,
  agentName,
  customerName,
}: {
  lines: TranscriptLine[];
  agentName: string;
  customerName: string;
}) {
  if (lines.length === 0) {
    return (
      <div className="card p-4">
        <p className="text-sm text-arya-muted">No transcript available.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-arya-border flex items-center justify-between">
        <span className="text-sm font-medium text-arya-ink">Transcript</span>
        <span className="text-xs text-arya-muted">{lines.length} turns</span>
      </div>

      <div className="p-4 flex flex-col gap-4 max-h-[520px] overflow-y-auto">
        {lines.map((line, i) => {
          const isAgent = line.speaker === "agent";
          return (
            <div key={i} className="flex gap-3">
              <span className="text-[11px] text-slate-400 tabular-nums pt-0.5 w-11 shrink-0">
                {line.t}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-[11px] font-medium mb-0.5 ${
                    isAgent ? "text-arya-teal" : "text-slate-500"
                  }`}
                >
                  {isAgent ? agentName : customerName}
                </p>
                <p
                  className={`text-sm leading-relaxed rounded-lg px-3 py-2 ${
                    isAgent
                      ? "bg-arya-teal-light text-arya-ink"
                      : "bg-slate-50 text-slate-700 border border-arya-border"
                  }`}
                >
                  {line.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
