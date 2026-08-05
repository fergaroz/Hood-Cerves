import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("hood_auth")?.value;

  if (token && process.env.SITE_AUTH_TOKEN && token === process.env.SITE_AUTH_TOKEN) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|api/login|api/cron|api/admin|manifest.json|icons/|logo.jpg|sw.js).*)",
  ],
};
