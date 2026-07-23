export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="w-8 h-8 rounded-lg bg-arya-blue text-white flex items-center justify-center text-base font-semibold">
            A
          </span>
          <span className="text-xl font-semibold text-arya-ink tracking-tight">Arya</span>
        </div>

        <form
          action="/api/auth/login"
          method="POST"
          className="card p-6 flex flex-col gap-4"
        >
          <div>
            <h1 className="text-base font-semibold text-arya-ink">Iniciar sesión</h1>
            <p className="text-sm text-arya-muted">Entra con tu correo y contraseña.</p>
          </div>

          {params.error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              Correo o contraseña incorrectos.
            </p>
          )}

          <input type="hidden" name="next" value={params.next ?? "/"} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Correo</label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="border border-arya-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-arya-blue/40"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              className="border border-arya-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-arya-blue/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="bg-arya-blue text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
