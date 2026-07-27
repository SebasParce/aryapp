function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-arya-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm text-arya-ink break-words">{value ?? "—"}</span>
    </div>
  );
}

export default function CustomerCard({
  name,
  phone,
  email,
  address,
  history,
}: {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  history?: { calls: number; chats: number; appointments: number; lastAppointment: string | null };
}) {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <span className="text-sm font-medium text-arya-ink">Datos del cliente</span>

      <Row label="Nombre" value={name} />
      <Row label="Teléfono" value={phone} />
      <Row label="Correo" value={email} />
      <Row label="Dirección de servicio" value={address} />

      {history && (
        <div className="border-t border-arya-border pt-3">
          <p className="text-[11px] font-medium text-arya-muted uppercase tracking-wide mb-2">
            Historial con este cliente
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-semibold text-arya-ink">{history.calls}</p>
              <p className="text-[11px] text-arya-muted">llamadas</p>
            </div>
            <div>
              <p className="text-base font-semibold text-arya-ink">{history.chats}</p>
              <p className="text-[11px] text-arya-muted">chats</p>
            </div>
            <div>
              <p className="text-base font-semibold text-arya-ink">{history.appointments}</p>
              <p className="text-[11px] text-arya-muted">citas</p>
            </div>
          </div>
          {history.lastAppointment && (
            <p className="text-[11px] text-arya-muted mt-2 text-center">
              Última cita:{" "}
              {new Date(history.lastAppointment).toLocaleDateString("es-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
