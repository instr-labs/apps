import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const missing: string[] = [];
  if (!process.env.GATEWAY_URL) missing.push("GATEWAY_URL");
  if (!process.env.NOTIFICATION_URL) missing.push("NOTIFICATION_URL");

  if (missing.length) {
    const body = JSON.stringify({
      message: `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} not configured`,
      data: null,
      errors: null,
    });
    return new NextResponse(body, {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const requestHeaders = new Headers(req.headers);
  const origin = new URL(req.url).origin;
  requestHeaders.set("Origin", origin);
  requestHeaders.set("Content-Type", "application/json");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
