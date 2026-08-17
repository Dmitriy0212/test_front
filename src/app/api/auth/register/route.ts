import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function POST(request: NextRequest) {
  const body = await request
    .clone()
    .json()
    .catch(() => null);

  if (!body?.name || !body?.email || !body?.password) {
    return NextResponse.json(
      {
        message: "Name, email and password are required",
      },
      {
        status: 400,
      },
    );
  }

  return proxyRequest(request, "/auth/register");
}
