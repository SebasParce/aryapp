# Arya — App real (con login y panel admin)

Next.js 15 (App Router) + base de datos propia en SQLite (sin Prisma,
sin servicios externos — usa `node:sqlite`, incluido en Node 22+).
Autenticación propia (email + contraseña, sesión en cookie firmada,
sin librerías externas de auth).

## Requisitos

- Node.js **22.5 o superior** (usa el módulo nativo `node:sqlite`).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — te va a pedir login.

## Credenciales de prueba

Generadas por el seed (`npm run db:seed`):

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@arya.ai` | `arya-admin-2026` | Admin (panel admin) |
| `titan-marine-air@arya.ai` | `arya-2026` | Contratista — Titan Marine Air |
| `air-pros-usa@arya.ai` | `arya-2026` | Contratista — Air Pros USA |
| `lindstrom-air@arya.ai` | `arya-2026` | Contratista — Lindstrom Air |

**Cambia estas contraseñas antes de usar esto en producción real** —
son solo para desarrollo/demo.

## Regenerar los datos dummy

```bash
npm run db:seed
```

Borra y vuelve a poblar `data/arya.db`: tenants, usuarios, llamadas,
chats/SMS, agendamientos y contactos de retención. Imprime las
credenciales al final.

## Roles y qué ve cada uno

- **Contratista**: entra y ve *solo* su propio dashboard — no hay
  selector de tenant, y aunque intente forzar `?tenant=otro` en la URL
  el servidor lo ignora (queda fijo a su cuenta). Puede navegar Resumen,
  Llamadas hechas, Chats, Agendamientos y Cargar base de datos (CSV de
  retención).
- **Admin**: ve el mismo dashboard pero con selector de contratista (para
  poder revisar cualquiera), más un enlace a **Panel admin** (`/admin`)
  donde carga y edita todos los datos que alimentan cada dashboard:
  contratistas, llamadas, chats/SMS, agendamientos, retención y usuarios
  (crear logins nuevos por contratista).

## Estructura

- `db/schema.sql` — schema SQL a mano (tenants, calls, appointments,
  chats, retention_contacts, users).
- `db/seed.ts` — datos dummy + usuarios de prueba.
- `lib/db.ts` — conexión a SQLite y helpers de consulta genéricos.
- `lib/queries.ts` — queries de negocio del dashboard del contratista.
- `lib/admin-queries.ts` — CRUD usado por el panel admin.
- `lib/password.ts` — hash/verificación de contraseñas (`node:crypto`
  scrypt, sin bcrypt).
- `lib/session.ts` — cookie de sesión firmada con Web Crypto (funciona
  igual en Node y en el Edge Runtime del middleware).
- `lib/auth-server.ts` — `getSession()` para Server Components.
- `lib/tenant-scope.ts` — resuelve qué tenant ve cada usuario según su
  rol (clave para que un contratista no vea datos de otro).
- `middleware.ts` — protege todas las rutas; sin sesión redirige a
  `/login`; si no eres admin, bloquea `/admin`.
- `app/login/` + `app/api/auth/` — login/logout.
- `app/(dashboard)/` — Resumen, Llamadas hechas, Chats, Agendamientos,
  Cargar base de datos (dashboard del contratista).
- `app/admin/` — panel admin (su propio layout/sidebar), con CRUD
  completo para cada entidad.

## Siguientes pasos

- Integración real con la API de JustCall en lugar de datos dummy.
- Si más adelante quieres Postgres real (Supabase u otro), el cambio es
  acotado: la forma de las tablas en `db/schema.sql` se traduce casi
  directo, y solo hay que reemplazar `lib/db.ts` por un cliente Postgres
  (el resto del código no cambia).
- Recuperación de contraseña / cambio de contraseña propio (hoy solo el
  admin puede crear usuarios, no hay "olvidé mi contraseña").
