import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

// Categories — фіксований список, кешуємо на годину
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/categories");
}