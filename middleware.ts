import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";

// Protects the admin dashboard and the admin write API routes. The login
// page itself and the login API route are intentionally left open - the
// matcher below still catches /api/admin/login, so we explicitly skip it
// here rather than relying on the matcher alone.
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthed = await verifySessionToken(token);

  if (!isAuthed) {
    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/card/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/card/admin/dashboard/:path*", "/api/admin/:path*"],
};
