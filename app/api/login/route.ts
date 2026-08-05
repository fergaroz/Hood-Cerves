import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const sitePassword = process.env.SITE_PASSWORD;
  const authToken = process.env.SITE_AUTH_TOKEN;

  if (!sitePassword || !authToken) {
    return NextResponse.json(
      { error: "La contraseña no está configurada en el servidor" },
      { status: 500 }
    );
  }

  if (password !== sitePassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("hood_auth", authToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return res;
}
