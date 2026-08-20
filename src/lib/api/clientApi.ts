import api from "./browserApi";
import type { User, AuthUser, GetMeResponse } from "@/types/user";
import type {
  Article,
  ArticlesListResponse,
  Category,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "@/types/article";
import axios from "axios";

// --- auth ---

export type RegisterRequest = { name: string; email: string; password: string };
export type LoginRequest = { email: string; password: string };

export async function register(payload: RegisterRequest): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginRequest): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>("/auth/login", payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

// --- users ---

export async function getUserInfo(id: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}

export async function updateUser(payload: { name?: string }): Promise<AuthUser> {
  const { data } = await api.patch<{ data: AuthUser }>("/users/me", payload);
  return data.data;
}

export async function updateAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.patch<{ data: { avatarUrl: string } }>("/users/me/avatar", formData);
  return data.data;
}

export async function deleteAvatar(): Promise<{ avatarUrl: string }> {
  const { data } = await api.delete<{ data: { avatarUrl: string } }>("/users/me/avatar");
  return data.data;
}

export type GetUsersResponse = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  users: User[];
};

export async function getUsers(
  params: {
    page?: number;
    perPage?: number;
    sortBy?: "name" | "articlesAmount" | "createdAt" | "rating";
    order?: "asc" | "desc";
  } = {},
): Promise<GetUsersResponse> {
  const { data } = await api.get<GetUsersResponse>("/users", { params });
  return data;
}

type UserArticlesResponse = {
  status: number;
  message: string;
  data: ArticlesListResponse & { hasNextPage: boolean; hasPreviousPage: boolean };
};

export async function getUserArticles(
  id: string,
  params: { page?: number; perPage?: number } = {},
): Promise<UserArticlesResponse["data"]> {
  const { data } = await api.get<UserArticlesResponse>(`/users/${id}/articles`, { params });
  return data.data;
}

type SavedArticlesResponse = { savedArticles: Article[] };

export async function getSavedArticles(): Promise<Article[]> {
  const { data } = await api.get<SavedArticlesResponse>("/users/me/saved");
  return data.savedArticles;
}

export type SavedArticlesMutationResponse = { savedArticles: string[] };

export async function addSavedArticle(articleId: string): Promise<SavedArticlesMutationResponse> {
  const { data } = await api.post<SavedArticlesMutationResponse>(
    `/users/me/saved/${encodeURIComponent(articleId)}`,
  );
  return data;
}

export async function removeSavedArticle(
  articleId: string,
): Promise<SavedArticlesMutationResponse> {
  const { data } = await api.delete<SavedArticlesMutationResponse>(
    `/users/me/saved/${encodeURIComponent(articleId)}`,
  );
  return data;
}

// --- articles ---

export async function getArticles(
  params: { page?: number; perPage?: number } = {},
): Promise<ArticlesListResponse> {
  const { data } = await api.get<ArticlesListResponse>("/articles", { params });
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
  const { data } = await api.get<ArticlesListResponse>("/articles/filter", { params });
  return data;
}

export async function getArticleById(id: string): Promise<Article> {
  const { data } = await api.get<{ article: Article }>(`/articles/${id}`);
  return data.article;
}

export async function createArticle(payload: CreateArticleRequest): Promise<Article> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("article", payload.article);
  if (payload.category) formData.append("category", payload.category);
  formData.append("img", payload.img);

  const { data } = await api.post<{ data: Article }>("/articles", formData);
  return data.data;
}

export async function updateArticle(id: string, payload: UpdateArticleRequest): Promise<Article> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.desc !== undefined) formData.append("desc", payload.desc);
  if (payload.article !== undefined) formData.append("article", payload.article);
  if (payload.category !== undefined) formData.append("category", payload.category);
  if (payload.img !== undefined) formData.append("img", payload.img);

  const { data } = await api.patch<{ data: Article }>(`/articles/${id}`, formData);
  return data.data;
}

export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/articles/${id}`);
}

// --- categories ---

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories");
  return data;
}
//------------------------------------------------------------------------------
export const getMe = async (): Promise<AuthUser> => {
  const { data } = await api.get<GetMeResponse>("/users/me");

  return data.data.user;
};
export const checkSession = async (): Promise<boolean> => {
  try {
    const { data } = await api.get("/auth/session");

    return data.success === true;
  } catch (error: any) {
    return false;
  }
};
