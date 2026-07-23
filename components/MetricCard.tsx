export default function MetricCard({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "success" | "info";
}) {
  const subColor =
    tone === "success"
      ? "text-emerald-600"
      : tone === "info"
      ? "text-arya-blue"
      : "text-arya-muted";

  return (
    <div className="card p-4">
      <p className="text-xs text-arya-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold text-arya-ink mb-1 tabular-nums">
        {value}
      </p>
      {sublabel && <p className={`text-xs ${subColor}`}>{sublabel}</p>}
    </div>
  );
}
