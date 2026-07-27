import Logo from "@/components/Logo";

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
        <form
          action="/api/auth/login"
          method="POST"
          className="card p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-center mb-2">
            <Logo className="h-10" />
          </div>

          <div>
            <h1 className="text-base font-semibold text-arya-ink">Sign in</h1>
            <p className="text-sm text-arya-muted">Enter your email and password.</p>
          </div>

          {params.error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              Incorrect email or password.
            </p>
          )}

          <input type="hidden" name="next" value={params.next ?? "/"} />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input
              type="email"
              name="email"
              required
              autoFocus
              className="border border-arya-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-arya-teal/40"
              placeholder="you@company.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Password</label>
            <input
              type="password"
              name="password"
              required
              className="border border-arya-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-arya-teal/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="bg-arya-teal text-white text-sm font-medium py-2 rounded-lg hover:bg-arya-teal-dark cursor-pointer"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
