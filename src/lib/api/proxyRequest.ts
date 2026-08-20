import { NextRequest, NextResponse } from "next/server";

// Сервер-only: NEXT_PUBLIC_ інлайнило б це в клієнтський бандл
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function proxyRequest(request: NextRequest, backendPath: string) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json({ message: "API URL is not configured" }, { status: 500 });
    }

    const targetUrl = new URL(`${BACKEND_URL}/api${backendPath}${request.nextUrl.search}`);

    // Browser → Backend
    const headers = new Headers(request.headers);

    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("Cookie", cookie);
    }

    const outgoingRequest = new Request(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      // @ts-expect-error Next.js/TypeScript
      duplex: "half",
    });

    const response = await fetch(outgoingRequest);

    // Backend → Browser
    const responseHeaders = new Headers(response.headers);

    // ВАЖНО:
    // Next.js fetch может автоматически распаковать gzip/br.
    // Поэтому нельзя передавать браузеру старые заголовки
    // сжатого ответа.
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    // Передаём cookies от backend браузеру
    const setCookies = response.headers.getSetCookie();

    responseHeaders.delete("set-cookie");

    for (const setCookie of setCookies) {
      responseHeaders.append("set-cookie", setCookie);
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);

    return NextResponse.json({ message: "Backend unreachable" }, { status: 502 });
  }
}
