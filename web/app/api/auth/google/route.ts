import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.GATEWAY_URL;
  if (!base) return NextResponse.json({ message: "GATEWAY_URL is not configured", data: null, errors: null }, { status: 500 });

  const target = base.replace(/\/$/, "") + "/auth/google";
  // Use 307 to preserve method, though browser will follow as GET
  return NextResponse.redirect(target, { status: 307 });
}
