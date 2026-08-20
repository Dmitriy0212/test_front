import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/api/proxyRequest";

const ALLOWED_CATEGORIES = ["popular", "general"] as const;
const ALLOWED_SORT_FIELDS = ["createdAt", "date", "rate", "title"] as const;
const ALLOWED_ORDER = ["asc", "desc"] as const;

type Category = (typeof ALLOWED_CATEGORIES)[number];
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
type Order = (typeof ALLOWED_ORDER)[number];

function isValidCategory(value: string | null): value is Category {
  return value !== null && ALLOWED_CATEGORIES.includes(value as Category);
}

function isValidSortBy(value: string | null): value is SortField {
  return value !== null && ALLOWED_SORT_FIELDS.includes(value as SortField);
}

function isValidOrder(value: string | null): value is Order {
  return value !== null && ALLOWED_ORDER.includes(value as Order);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawCategory = searchParams.get("category");
  const rawSortBy = searchParams.get("sortBy");
  const rawOrder = searchParams.get("order");

  if (rawCategory !== null && !isValidCategory(rawCategory)) {
    return NextResponse.json(
      { message: `Invalid category value. Allowed: ${ALLOWED_CATEGORIES.join(", ")}` },
      { status: 400 },
    );
  }

  if (rawSortBy !== null && !isValidSortBy(rawSortBy)) {
    return NextResponse.json(
      { message: `Invalid sortBy value. Allowed: ${ALLOWED_SORT_FIELDS.join(", ")}` },
      { status: 400 },
    );
  }

  if (rawOrder !== null && !isValidOrder(rawOrder)) {
    return NextResponse.json(
      { message: `Invalid order value. Allowed: ${ALLOWED_ORDER.join(", ")}` },
      { status: 400 },
    );
  }

  return proxyRequest(request, "/articles/filter");
}
