/**
 * Seed de datos dummy para Arya.
 * Corre con: npm run db:seed
 */
import "../lib/load-env";
import { supabase, newId } from "../lib/db";
import { hashPassword } from "../lib/password";

function daysAgo(n: number, hour = 9, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function daysFromNow(n: number, hour = 9, min = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPhone(): string {
  return `+1 (954) 555-${String(randInt(1000, 9999)).slice(0, 4)}`;
}

async function run() {
  console.log("Limpiando tablas...");
  // Borrar tenants basta: todo lo demás cuelga de tenant_id con ON DELETE CASCADE.
  const del = async (table: string) => {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) throw new Error(`Error limpiando ${table}: ${error.message}`);
  };
  await del("arya_users");
  await del("arya_tenants");

  const tenants = [
    { name: "Titan Marine Air", slug: "titan-marine-air", trade: "HVAC" },
    { name: "Air Pros USA", slug: "air-pros-usa", trade: "HVAC" },
    { name: "Lindstrom Air", slug: "lindstrom-air", trade: "HVAC / Eléctrico" },
  ];

  console.log("Creando contratistas...");
  const tenantIds: Record<string, string> = {};
  const tenantRows = tenants.map((t) => {
    const id = newId("ten");
    tenantIds[t.slug] = id;
    return { id, name: t.name, slug: t.slug, trade: t.trade, city: "South Florida" };
  });
  {
    const { error } = await supabase.from("arya_tenants").insert(tenantRows);
    if (error) throw new Error(`Error creando tenants: ${error.message}`);
  }

  console.log("Creando usuarios...");
  const ADMIN_PASSWORD = "arya-admin-2026";
  const CONTRACTOR_PASSWORD = "arya-2026";
  const credentials: { email: string; password: string; role: string }[] = [];

  const userRows = [
    {
      id: newId("usr"),
      email: "admin@arya.ai",
      password_hash: hashPassword(ADMIN_PASSWORD),
      role: "admin",
      tenant_id: null as string | null,
    },
    ...tenants.map((t) => ({
      id: newId("usr"),
      email: `${t.slug}@arya.ai`,
      password_hash: hashPassword(CONTRACTOR_PASSWORD),
      role: "contractor",
      tenant_id: tenantIds[t.slug],
    })),
  ];
  credentials.push({ email: "admin@arya.ai", password: ADMIN_PASSWORD, role: "admin" });
  for (const t of tenants) {
    credentials.push({
      email: `${t.slug}@arya.ai`,
      password: CONTRACTOR_PASSWORD,
      role: `contratista (${t.name})`,
    });
  }
  {
    const { error } = await supabase.from("arya_users").insert(userRows);
    if (error) throw new Error(`Error creando usuarios: ${error.message}`);
  }

  const agents = ["Sofia M.", "Carlos V.", "Diana R.", "Andrés P."];
  const serviceTypes = [
    "Emergencia A/C",
    "Mantenimiento",
    "Instalación nueva",
    "Cotización",
    "Reparación eléctrica",
    "Revisión de ductos",
  ];
  const outcomes = ["agendado", "agendado", "agendado", "llamar_despues", "no_interesado", "numero_equivocado"];
  const firstNames = [
    "Robert", "Patricia", "James", "Linda", "Michael", "Sandra", "David",
    "Laura", "Kevin", "Maria", "John", "Karen", "Steven", "Nancy", "Brian",
    "Jessica", "Mark", "Susan", "Paul", "Betty",
  ];
  const lastNames = [
    "Collins", "Mendez", "Whitaker", "Torres", "Ruiz", "Chen", "Gonzalez",
    "Smith", "Johnson", "Rodriguez", "Martinez", "Perez", "Lopez", "Diaz",
    "Fernandez", "Reyes", "Cruz", "Ortiz",
  ];
  const equipmentList = ["Trane 2 ton", "Carrier 3 ton", "Lennox 2.5 ton", "Goodman 4 ton", "Rheem 3.5 ton", "Amana 2 ton"];
  const chatTags = ["Cotización", "Emergencia A/C", "Reagendar cita", "Pregunta de factura", "Seguimiento de servicio", "Garantía"];
  const chatLastMessages = [
    "Perfecto, gracias por la ayuda.",
    "¿Pueden confirmarme la hora del técnico?",
    "Ya quedó agendado, muchas gracias.",
    "¿Cuánto cuesta el diagnóstico?",
    "Voy a esperar la llamada del técnico.",
    "Necesito reprogramar para otro día.",
  ];

  function randomName(): string {
    return `${pick(firstNames)} ${pick(lastNames)}`;
  }

  console.log("Generando llamadas, chats, agendamientos y retención por contratista...");

  const allCalls: Record<string, unknown>[] = [];
  const allAppts: Record<string, unknown>[] = [];
  const allChats: Record<string, unknown>[] = [];
  const allRetention: Record<string, unknown>[] = [];

  for (const t of tenants) {
    const tenantId = tenantIds[t.slug];

    const numCalls = randInt(38, 52);
    for (let i = 0; i < numCalls; i++) {
      allCalls.push({
        id: newId("call"),
        tenant_id: tenantId,
        direction: Math.random() < 0.75 ? "inbound" : "outbound",
        customer_name: randomName(),
        phone: randomPhone(),
        agent_name: pick(agents),
        duration_sec: randInt(90, 540),
        outcome: pick(outcomes),
        service_type: pick(serviceTypes),
        occurred_at: daysAgo(randInt(0, 29), randInt(7, 20), randInt(0, 59)),
      });
    }

    const numPast = randInt(10, 16);
    for (let i = 0; i < numPast; i++) {
      allAppts.push({
        id: newId("appt"),
        tenant_id: tenantId,
        customer_name: randomName(),
        phone: randomPhone(),
        address: `${randInt(100, 9999)} SW ${randInt(1, 99)}th Ave, Miami, FL`,
        service_type: pick(serviceTypes),
        technician: pick(["Mike R.", "Carlos M.", "Ana T.", "Luis F."]),
        scheduled_at: daysAgo(randInt(1, 25), randInt(8, 17)),
        status: "confirmada",
        value_usd: randInt(120, 2400),
      });
    }
    const numUpcoming = randInt(6, 11);
    for (let i = 0; i < numUpcoming; i++) {
      allAppts.push({
        id: newId("appt"),
        tenant_id: tenantId,
        customer_name: randomName(),
        phone: randomPhone(),
        address: `${randInt(100, 9999)} NW ${randInt(1, 99)}th St, Miami, FL`,
        service_type: pick(serviceTypes),
        technician: pick(["Mike R.", "Carlos M.", "Ana T.", "Luis F."]),
        scheduled_at: daysFromNow(randInt(0, 10), randInt(8, 17)),
        status: pick(["confirmada", "confirmada", "pendiente"]),
        value_usd: randInt(120, 2400),
      });
    }

    const numChats = randInt(20, 32);
    for (let i = 0; i < numChats; i++) {
      allChats.push({
        id: newId("chat"),
        tenant_id: tenantId,
        channel: Math.random() < 0.6 ? "chat" : "sms",
        customer_name: randomName(),
        phone: randomPhone(),
        agent_name: pick(agents),
        status: Math.random() < 0.78 ? "resuelto" : "pendiente",
        tag: pick(chatTags),
        last_message: pick(chatLastMessages),
        started_at: daysAgo(randInt(0, 29), randInt(7, 21), randInt(0, 59)),
      });
    }

    const numRetention = randInt(9, 14);
    for (let i = 0; i < numRetention; i++) {
      allRetention.push({
        id: newId("ret"),
        tenant_id: tenantId,
        name: randomName(),
        phone: randomPhone(),
        email: Math.random() < 0.7 ? `${pick(["cliente", "contacto"])}${randInt(1, 999)}@gmail.com` : null,
        address: `${randInt(100, 9999)} SW ${randInt(1, 99)}th Ave, Miami, FL`,
        last_service: daysAgo(randInt(150, 420)).slice(0, 10),
        equipment: pick(equipmentList),
        notes: pick([
          "Pidió cotización de mantenimiento anual y no volvió a llamar.",
          "Mencionó que el equipo suena raro al encender.",
          "Cliente de temporada, vuelve a Miami en invierno.",
          null,
          null,
        ]),
      });
    }
  }

  console.log(`Insertando ${allCalls.length} llamadas...`);
  {
    const { error } = await supabase.from("arya_calls").insert(allCalls);
    if (error) throw new Error(`Error insertando calls: ${error.message}`);
  }
  console.log(`Insertando ${allAppts.length} agendamientos...`);
  {
    const { error } = await supabase.from("arya_appointments").insert(allAppts);
    if (error) throw new Error(`Error insertando appointments: ${error.message}`);
  }
  console.log(`Insertando ${allChats.length} chats/sms...`);
  {
    const { error } = await supabase.from("arya_chats").insert(allChats);
    if (error) throw new Error(`Error insertando chats: ${error.message}`);
  }
  console.log(`Insertando ${allRetention.length} contactos de retención...`);
  {
    const { error } = await supabase.from("arya_retention_contacts").insert(allRetention);
    if (error) throw new Error(`Error insertando retention: ${error.message}`);
  }

  console.log(`\nListo. ${tenants.length} tenants sembrados en Supabase (proyecto fitness-tracker, tablas arya_*).`);
  console.log("\nCredenciales de acceso:");
  for (const c of credentials) {
    console.log(`  ${c.email}  /  ${c.password}   (${c.role})`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
