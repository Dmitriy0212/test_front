import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function PATCH(request: NextRequest) {
  const formData = await request.clone().formData().catch(() => null);
  if (!formData || !formData.get("avatar")) {
    return NextResponse.json({ message: "Avatar file is required" }, { status: 400 });
  }

  return proxyRequest(request, "/users/me/avatar");
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, "/users/me/avatar");
}
