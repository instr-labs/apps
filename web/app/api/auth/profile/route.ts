import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.GATEWAY_URL;
  if (!base) return NextResponse.json({ message: "GATEWAY_URL is not configured", data: null, errors: null }, { status: 500 });

  const url = base.replace(/\/$/, "") + "/auth/profile";
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const upstream = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Origin: origin },
    cache: "no-store",
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8" },
  });
}
