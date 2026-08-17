import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";
import { refreshSession } from "@/lib/api/serverApi";

// /photo — крок завантаження аватара ПІСЛЯ реєстрації: бекенд уже ставить сесійні
// cookie в /auth/register, тобто на цій сторінці юзер завжди авторизований
const PRIVATE_ROUTES = ["/profile", "/articles/create", "/photo"];
const PUBLIC_ONLY_ROUTES = ["/login", "/register"];

function applySessionCookies(response: NextResponse, setCookieHeaders: string[]) {
  for (const cookieStr of setCookieHeaders) {
    const { name, value, maxAge, path, httpOnly, secure, sameSite } = parseSetCookie(cookieStr);
    if (value === undefined) continue;
    response.cookies.set(name, value, { maxAge, path, httpOnly, secure, sameSite });
  }
}

// Рендер цього самого запиту (Server Component → serverApi → cookies() з next/headers)
// інакше й далі бачив би стару сесію, яку бекенд у /auth/refresh уже видалив
function buildRefreshedCookieHeader(request: NextRequest, setCookieHeaders: string[]) {
  const cookieMap = new Map<string, string>();
  for (const { name, value } of request.cookies.getAll()) {
    cookieMap.set(name, value);
  }
  for (const cookieStr of setCookieHeaders) {
    const { name, value } = parseSetCookie(cookieStr);
    if (value !== undefined) cookieMap.set(name, value);
  }

  return Array.from(cookieMap, ([name, value]) => `${name}=${value}`).join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const sessionId = cookieStore.get("sessionId")?.value;

  const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route));

  let isAuthenticated = Boolean(accessToken);

  // accessToken живе лише 15 хв (див. services/session.js) — якщо він протух,
  // але сесія (refreshToken + sessionId) ще жива, тихо оновлюємо її до рендеру сторінки
  if (!isAuthenticated && refreshToken && sessionId) {
    try {
      const refreshResponse = await refreshSession();
      const setCookieHeaders = refreshResponse.headers["set-cookie"];

      if (setCookieHeaders) {
        isAuthenticated = true;

        if (isPublicOnlyRoute) {
          const response = NextResponse.redirect(new URL("/", request.url));
          applySessionCookies(response, setCookieHeaders);
          return response;
        }

        // Не редірект — сторінка рендериться прямо зараз, тож і вхідні заголовки
        // запиту мають нести вже оновлену сесію, інакше serverApi зловить 401
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("cookie", buildRefreshedCookieHeader(request, setCookieHeaders));
        const response = NextResponse.next({ request: { headers: requestHeaders } });
        applySessionCookies(response, setCookieHeaders);
        return response;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  if (isAuthenticated) {
    return isPublicOnlyRoute
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (isPrivateRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/articles/create", "/login", "/register", "/photo"],
};
