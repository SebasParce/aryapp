import { NextResponse } from "next/server";

const SAMPLE_CSV = `nombre,telefono,email,direccion,ultimo_servicio,equipo,notas
Michael Torres,+1 (954) 555-0142,michael.torres@example.com,"1234 SW 67th Ave, Miami, FL",2025-12-10,Trane 2 ton,Pidió cotización de mantenimiento anual
Sandra Ruiz,+1 (954) 555-0198,sandra.ruiz@example.com,"555 NW 12th St, Fort Lauderdale, FL",2026-01-15,Carrier 1.5 ton,
David Chen,+1 (954) 555-0177,,"890 SW 40th Ave, Hollywood, FL",2026-02-02,Lennox 2.5 ton,Cliente de temporada
`;

export async function GET() {
  return new NextResponse(SAMPLE_CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arya-base-retencion-ejemplo.csv"',
    },
  });
}
