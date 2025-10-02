import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for streaming

export async function GET(req: NextRequest) {
  const base = process.env.NOTIFICATION_URL;
  const url = `${base}/sse`;

  req.headers.set("Connection", "keep-alive");
  req.headers.set("Cache-Control", "no-cache, no-transform");
  req.headers.set("Accept", "text/event-stream");

  return await fetch(url, {
    method: "GET",
    headers: req.headers,
    signal: req.signal,
    redirect: "follow",
    cache: "no-store",
  });
}
