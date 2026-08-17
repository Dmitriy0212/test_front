import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/lib/api/clientApi";
import type { AuthUser } from "@/types/user";

// Раніше цей хук читав id з Zustand-стору (useAuthStore) — але user там
// заповнюється АСИНХРОННО (AuthProvider робить checkSession()/getMe() в
// useEffect вже після монтування, плюс сам Zustand persist рігідратується
// з localStorage теж не миттєво). Через це на першому рендері id завжди
// undefined → useInfiniteQuery з enabled: false → вічний isPending: true
// (вимкнений запит сам ніколи не виходить з pending) → вічний Loader.
// Найгірший випадок — після реєстрації, коли checkSession() падає через
// race condition і user лишається null назавжди.
//
// Фікс: замість Zustand читаємо React Query кеш під ключем ["me"], який
// layout.tsx (Server Component) уже гідрує через HydrationBoundary одразу
// з правильним, нормалізованим (_id → id) currentUser — без чекання на
// AuthProvider і без залежності від відомого бага id/_id (getCurrentUserServer
// вже усунув його на сервері).
async function fetchCurrentUser(): Promise<AuthUser> {
  const rawUser = await getMe();
  const rawUserWithMongoId = rawUser as AuthUser & { _id?: string };
  return { ...rawUser, id: rawUserWithMongoId.id ?? rawUserWithMongoId._id ?? "" };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
  });
}

export function useCurrentUserId(): string | undefined {
  const { data } = useCurrentUser();
  return data?.id || undefined;
}
