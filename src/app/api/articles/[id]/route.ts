import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

type Context = { params: Promise<{ id: string }> };

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!OBJECT_ID.test(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  return proxyRequest(request, `/articles/${id}`);
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!OBJECT_ID.test(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const formData = await request.clone().formData().catch(() => null);

  if (!formData) {
    return NextResponse.json(
      { message: "Invalid or missing form data" },
      { status: 400 }
    );
  }

  const title = formData.get("title");
  const article = formData.get("article");

 if (title !== null && typeof title === "string" && title.trim() === "") {
    return NextResponse.json(
      { message: "Title cannot be empty" },
      { status: 400 }
    );
 }
  
  if (article !== null && typeof article === "string" && article.trim() === "") {
    return NextResponse.json(
      { message: "Article cannot be empty" },
      { status: 400 }
    );
  }

  return proxyRequest(request, `/articles/${id}`);
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;

  if (!OBJECT_ID.test(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  return proxyRequest(request, `/articles/${id}`);
}
