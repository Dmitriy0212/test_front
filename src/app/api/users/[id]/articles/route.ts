import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

type Context = { params: Promise<{ id: string }> };

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!OBJECT_ID.test(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  return proxyRequest(request, `/users/${id}/articles`);
}
