import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ResponseCookie, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

export async function POST(req: NextRequest) {
  const base = process.env.GATEWAY_URL!;

  const url = `${base}/auth/login`;
  const bodyString = await req.text();

  const upstream = await fetch(url, {
    method: "POST",
    headers: req.headers,
    body: bodyString,
  });

  const reqSetCookie = new ResponseCookies(upstream.headers);
  const storeCookie = await cookies();
  storeCookie.set(reqSetCookie.get("AccessToken") as ResponseCookie);
  storeCookie.set(reqSetCookie.get("RefreshToken") as ResponseCookie);

  return upstream;
}
