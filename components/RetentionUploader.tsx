"use client";

import { useActionState, useRef } from "react";
import { uploadRetentionCsv, type UploadResult } from "@/app/actions";
import type { RetentionContact } from "@/lib/queries";

const initialState: UploadResult | null = null;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function RetentionUploader({
  tenantSlug,
  contacts,
  totalCount,
}: {
  tenantSlug: string;
  contacts: RetentionContact[];
  totalCount: number;
}) {
  const [state, formAction, isPending] = useActionState(uploadRetentionCsv, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-arya-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-arya-ink">Base de retención</span>
          <span className="badge bg-arya-blue-soft text-arya-blue">{totalCount} contactos</span>
        </div>
        <a
          href="/api/retention/sample"
          className="text-xs text-arya-blue hover:underline flex items-center gap-1"
        >
          Descargar CSV de ejemplo
        </a>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <p className="text-xs text-arya-muted">
          Sube el CSV con clientes inactivos para llamadas proactivas de retención. Columnas
          esperadas: <span className="font-mono">nombre, telefono, email, direccion, ultimo_servicio, equipo, notas</span>.
        </p>

        <form
          ref={formRef}
          action={async (formData) => {
            await formAction(formData);
            formRef.current?.reset();
          }}
          className="flex items-center gap-2 flex-wrap"
        >
          <input type="hidden" name="tenantSlug" value={tenantSlug} />
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="text-sm text-arya-ink file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-arya-border file:bg-arya-blue-light file:text-arya-blue file:text-sm file:font-medium file:cursor-pointer cursor-pointer"
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-arya-blue text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Subiendo..." : "Subir CSV"}
          </button>
        </form>

        {state && (
          <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {state.message}
          </p>
        )}
      </div>

      <div className="overflow-x-auto border-t border-arya-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arya-border text-left">
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Nombre</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Teléfono</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Último servicio</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Equipo</th>
              <th className="px-4 py-2 font-normal text-xs text-arya-muted">Notas</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-arya-muted text-sm">
                  Aún no hay contactos de retención cargados.
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-arya-border last:border-0">
                <td className="px-4 py-2.5 text-arya-ink">{c.name}</td>
                <td className="px-4 py-2.5 text-slate-500">{c.phone}</td>
                <td className="px-4 py-2.5 text-slate-500">{formatDate(c.last_service)}</td>
                <td className="px-4 py-2.5 text-slate-600">{c.equipment ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-500 max-w-[220px] truncate">{c.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
