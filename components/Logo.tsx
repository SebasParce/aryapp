export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bkt-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DCE3FB" />
          <stop offset="45%" stopColor="#8E9EF0" />
          <stop offset="100%" stopColor="#4C6EF5" />
        </linearGradient>
        <linearGradient id="bkt-tail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8FD3F4" />
          <stop offset="100%" stopColor="#4C6EF5" />
        </linearGradient>
      </defs>

      {/* cola / swoosh inferior derecho */}
      <path
        d="M23 27 L34 27 L34 38 C 34 38.5 33.4 39 32.6 38.6 L23 33.5 Z"
        fill="url(#bkt-tail)"
        opacity="0.9"
      />

      {/* cuadrado redondeado principal */}
      <rect x="1" y="1" width="32" height="32" rx="9" fill="url(#bkt-bg)" />

      {/* capas apiladas estilo "B" / cubo */}
      <g opacity="0.95">
        <path d="M9 11 L21 11 L15 17 L9 17 Z" fill="#FFFFFF" opacity="0.55" />
        <path d="M9 17.5 L18 17.5 L12 23.5 L9 23.5 Z" fill="#FFFFFF" opacity="0.75" />
        <path d="M9 24 L15 24 L9 30 Z" fill="#FFFFFF" opacity="0.95" />
        <path d="M15 17 L21 11 L25 15 L19 21 Z" fill="#FFFFFF" opacity="0.4" />
        <path d="M12 23.5 L18 17.5 L22 21.5 L16 27.5 Z" fill="#FFFFFF" opacity="0.6" />
      </g>
    </svg>
  );
}

export default function Logo({
  className = "h-8",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoIcon className={className} />
      {showWordmark && (
        <span className="inline-flex items-baseline font-bold tracking-tight leading-none">
          <span className="text-slate-800" style={{ fontSize: "1.15em" }}>
            Buckets
          </span>
          <span
            className="bg-clip-text text-transparent"
            style={{
              fontSize: "1.15em",
              backgroundImage: "linear-gradient(90deg, #4C6EF5, #7C6EF2)",
            }}
          >
            Ai
          </span>
        </span>
      )}
    </span>
  );
}
