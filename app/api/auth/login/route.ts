import { NextResponse, type NextRequest } from "next/server";
import { getUserByEmail } from "@/lib/admin-queries";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const fail = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", "1");
    if (next && next !== "/login") url.searchParams.set("next", next);
    return NextResponse.redirect(url, { status: 303 });
  };

  if (!email || !password) return fail();

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) return fail();

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id,
  });

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next && next.startsWith("/") ? next : "/";
  redirectTo.search = "";

  const response = NextResponse.redirect(redirectTo, { status: 303 });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
