import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/articles");
}

export async function POST(request: NextRequest) {
  const formData = await request.clone().formData().catch(() => null);
  
  if (!formData) {
    return NextResponse.json(
      { message: "Invalid or missing form data" },
      { status: 400 }
    );
  }

  const title = formData.get("title");
  const article = formData.get("article");
  const img = formData.get("img");

  if (!title || !article || !img) {
    return NextResponse.json(
      { message: "title, article, and img are required" },
      { status: 400 }
    );
  }

  return proxyRequest(request, "/articles");
}
