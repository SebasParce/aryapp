// Parser de CSV minimalista (sin dependencias externas), soporta campos
// entre comillas con comas y comillas escapadas ("").

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        pushField();
      } else if (char === "\n") {
        pushRow();
      } else {
        field += char;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const HEADER_ALIASES: Record<string, string> = {
  nombre: "name",
  name: "name",
  telefono: "phone",
  "teléfono": "phone",
  phone: "phone",
  email: "email",
  correo: "email",
  direccion: "address",
  "dirección": "address",
  address: "address",
  ultimo_servicio: "last_service",
  "último_servicio": "last_service",
  "ultimo servicio": "last_service",
  last_service: "last_service",
  equipo: "equipment",
  equipment: "equipment",
  notas: "notes",
  notes: "notes",
};

export type ParsedRetentionRow = {
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  last_service: string | null;
  equipment: string | null;
  notes: string | null;
};

export function mapRetentionCsv(rows: string[][]): {
  contacts: ParsedRetentionRow[];
  skipped: number;
} {
  if (rows.length === 0) return { contacts: [], skipped: 0 };

  const header = rows[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase());
  const contacts: ParsedRetentionRow[] = [];
  let skipped = 0;

  for (const raw of rows.slice(1)) {
    const record: Record<string, string> = {};
    header.forEach((key, idx) => {
      record[key] = (raw[idx] ?? "").trim();
    });

    if (!record.name || !record.phone) {
      skipped++;
      continue;
    }

    contacts.push({
      name: record.name,
      phone: record.phone,
      email: record.email || null,
      address: record.address || null,
      last_service: record.last_service || null,
      equipment: record.equipment || null,
      notes: record.notes || null,
    });
  }

  return { contacts, skipped };
}
