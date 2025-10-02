import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.GATEWAY_URL!;
  const url = `${base}/auth/profile`;

  return await fetch(url, {
    method: "GET",
    headers: req.headers,
  });
}
