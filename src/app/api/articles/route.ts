import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/articles");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "/articles");
}
