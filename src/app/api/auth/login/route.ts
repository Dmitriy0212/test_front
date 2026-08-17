import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function POST(request: NextRequest) {
  const body = await request
    .clone()
    .json()
    .catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }
  return proxyRequest(request, "/auth/login");
}
