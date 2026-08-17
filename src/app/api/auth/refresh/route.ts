import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function POST(request: NextRequest) {
  return proxyRequest(request, "/auth/refresh");
}
