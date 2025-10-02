import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const base = process.env.GATEWAY_URL!;
  const url = `${base}/auth/logout`;

  const bodyString = await req.text();

  return await fetch(url, {
    method: "POST",
    headers: req.headers,
    body: bodyString,
  });
}
