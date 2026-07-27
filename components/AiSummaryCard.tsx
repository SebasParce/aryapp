const sentimentStyles: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700 border-emerald-100",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  negative: "bg-rose-50 text-rose-700 border-rose-100",
};

export default function AiSummaryCard({
  summary,
  nextStep,
  sentiment,
}: {
  summary: string | null;
  nextStep: string | null;
  sentiment: string | null;
}) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-arya-ink">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-arya-teal" fill="currentColor">
            <path d="M12 2l1.9 5.6L19.5 9l-4.4 3.4 1.4 5.6L12 15l-4.5 3 1.4-5.6L4.5 9l5.6-1.4z" />
          </svg>
          AI summary
        </span>
        {sentiment && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${
              sentimentStyles[sentiment] ?? sentimentStyles.neutral
            }`}
          >
            {sentiment}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">
        {summary ?? "No summary available."}
      </p>

      {nextStep && (
        <div className="border-t border-arya-border pt-3">
          <p className="text-[11px] font-medium text-arya-muted uppercase tracking-wide mb-1">
            Suggested next step
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{nextStep}</p>
        </div>
      )}
    </div>
  );
}
