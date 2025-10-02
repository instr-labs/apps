import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.GATEWAY_URL;
  if (!base) return NextResponse.json({ message: "GATEWAY_URL is not configured", data: null, errors: null }, { status: 500 });
  const url = base.replace(/\/$/, "") + "/images/instructions";
  const cookie = req.headers.get("cookie") ?? "";
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const upstream = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookie, Origin: origin },
    cache: "no-store",
  });

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8" },
  });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}

export async function POST(req: NextRequest) {
  const base = process.env.GATEWAY_URL;
  if (!base) return NextResponse.json({ message: "GATEWAY_URL is not configured", data: null, errors: null }, { status: 500 });
  const url = base.replace(/\/$/, "") + "/images/instructions";
  const cookie = req.headers.get("cookie") ?? "";
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const body = await req.text();

  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie, Origin: origin },
    body,
  });

  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8" },
  });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);
  return res;
}
