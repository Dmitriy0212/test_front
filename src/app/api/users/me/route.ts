import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function PATCH(request: NextRequest) {
  const body = await request.clone().json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  return proxyRequest(request, "/users/me");
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/users/me");
}
