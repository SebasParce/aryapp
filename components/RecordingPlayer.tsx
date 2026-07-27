"use client";

import { useEffect, useRef, useState } from "react";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Reproductor de la grabación. En el demo no hay archivos de audio reales,
 * así que simula la reproducción sobre la duración real de la llamada.
 */
export default function RecordingPlayer({
  durationSec,
  agentName,
}: {
  durationSec: number;
  agentName: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setPos((p) => {
          if (p + speed >= durationSec) {
            setPlaying(false);
            return durationSec;
          }
          return p + speed;
        });
      }, 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, speed, durationSec]);

  // Barras de la onda: deterministas para que no cambien entre renders.
  const bars = Array.from({ length: 72 }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    return 0.25 + Math.abs(seed - Math.floor(seed)) * 0.75;
  });
  const progress = durationSec > 0 ? pos / durationSec : 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-arya-ink">Grabación de la llamada</span>
        <span className="text-xs text-arya-muted">Atendida por {agentName}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (pos >= durationSec) setPos(0);
            setPlaying((p) => !p);
          }}
          className="w-10 h-10 shrink-0 rounded-full bg-arya-blue text-white flex items-center justify-center hover:bg-blue-700 cursor-pointer"
          aria-label={playing ? "Pausar" : "Reproducir"}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 ml-0.5" fill="currentColor">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          )}
        </button>

        <div
          className="flex-1 flex items-center gap-[2px] h-10 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setPos(Math.max(0, Math.min(durationSec, ratio * durationSec)));
          }}
        >
          {bars.map((h, i) => (
            <span
              key={i}
              className={`flex-1 rounded-full transition-colors ${
                i / bars.length <= progress ? "bg-arya-blue" : "bg-slate-200"
              }`}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>

        <span className="text-xs text-arya-muted tabular-nums shrink-0 w-20 text-right">
          {fmt(pos)} / {fmt(durationSec)}
        </span>

        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
          className="text-xs font-medium text-arya-muted hover:text-arya-ink border border-arya-border rounded-md px-2 py-1 cursor-pointer shrink-0"
        >
          {speed}x
        </button>
      </div>

      <p className="text-[11px] text-arya-muted mt-3">
        Demo: el audio real se conecta desde el proveedor de telefonía (JustCall) en producción.
      </p>
    </div>
  );
}
