import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string, fileId: string } }) {
  const base = process.env.GATEWAY_URL;
  if (!base) return new Response("GATEWAY_URL is not configured", { status: 500 });
  const { id, fileId } = params;
  const url = base.replace(/\/$/, "") + `/images/instructions/${id}/details/${fileId}`;
  const cookie = req.headers.get("cookie") ?? "";
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  const upstream = await fetch(url, {
    method: "GET",
    headers: { Cookie: cookie, Origin: origin },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => upstream.statusText);
    return new Response(text || "Upstream error", { status: upstream.status || 502 });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  headers.set("Content-Type", contentType);
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) headers.append("set-cookie", setCookie);

  return new Response(upstream.body, { status: 200, headers });
}
