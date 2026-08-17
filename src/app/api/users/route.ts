import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

const ALLOWED_SORT_FIELDS = ["createdAt", "articlesAmount"] as const;
const ALLOWED_ORDER = ["asc", "desc"] as const;

type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type Order = (typeof ALLOWED_ORDER)[number];

function isValidSortBy(value: string | null): value is SortField {
  return value !== null && ALLOWED_SORT_FIELDS.includes(value as SortField);
}

function isValidOrder(value: string | null): value is Order {
  return value !== null && ALLOWED_ORDER.includes(value as Order);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawSortBy = searchParams.get("sortBy");
  const rawOrder = searchParams.get("order");

  if (rawSortBy !== null && !isValidSortBy(rawSortBy)) {
    return NextResponse.json(
      { message: `Invalid sortBy value. Allowed: ${ALLOWED_SORT_FIELDS.join(", ")}` },
      { status: 400 }
    );
  }

  if (rawOrder !== null && !isValidOrder(rawOrder)) {
    return NextResponse.json(
      { message: `Invalid order value. Allowed: ${ALLOWED_ORDER.join(", ")}` },
      { status: 400 }
    );
  }

  return proxyRequest(request, "/users");
}
