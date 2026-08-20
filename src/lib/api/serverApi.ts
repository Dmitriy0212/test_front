import { cookies } from "next/headers";

import type { User } from "@/types/user";
import type { Article, ArticlesListResponse, Category } from "@/types/article";
import api from "./api";
async function authHeaders() {
  const cookieStore = await cookies();
  // cookieStore.toString() серіалізує ще й атрибути кожної cookie (Path тощо),
  // а не тільки name=value — бекенд це поки терпить випадково, але краще не покладатись
  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return { Cookie: cookie };
}

// --- users ---

export async function getUserInfo(id: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`, { headers: await authHeaders() });
  return data;
}

type UserArticlesResponse = {
  data: ArticlesListResponse & { hasNextPage: boolean; hasPreviousPage: boolean };
};

export async function getUserArticles(
  id: string,
  params: { page?: number; perPage?: number } = {},
): Promise<UserArticlesResponse["data"]> {
  const { data } = await api.get<UserArticlesResponse>(`/users/${id}/articles`, {
    params,
    headers: await authHeaders(),
  });
  return data.data;
}

export async function getSavedArticles(): Promise<Article[]> {
  const { data } = await api.get<Article[]>("/users/me/saved", { headers: await authHeaders() });
  return data;
}

// --- articles ---

export async function getArticles(
  params: { page?: number; perPage?: number } = {},
): Promise<ArticlesListResponse> {
  const { data } = await api.get<ArticlesListResponse>("/articles", {
    params,
    headers: await authHeaders(),
  });
  return data;
}

export async function getArticlesFiltered(
  params: {
    page?: number;
    perPage?: number;
    category?: Category;
    search?: string;
    sortBy?: "createdAt" | "date" | "rate" | "title";
    order?: "asc" | "desc";
  } = {},
): Promise<ArticlesListResponse> {
  const { data } = await api.get<ArticlesListResponse>("/articles/filter", {
    params,
    headers: await authHeaders(),
  });
  return data;
}

export async function getArticleById(id: string): Promise<Article> {
  const { data } = await api.get<{ article: Article }>(`/articles/${id}`, {
    headers: await authHeaders(),
  });
  return data.article;
}

// --- categories ---

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories", { headers: await authHeaders() });
  return data;
}

// --- session (для proxy.ts) ---

export async function refreshSession() {
  return api.post("/auth/refresh", null, { headers: await authHeaders() });
}

export async function logoutServer() {
  return api.post("/auth/logout", null, { headers: await authHeaders() });
}
