import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/lib/api/clientApi";
import type { AuthUser } from "@/types/user";

// Раніше різні клієнтські компоненти читали поточного юзера напряму з
// Zustand-стору (useAuthStore) — але user там заповнюється АСИНХРОННО
// (AuthProvider робить checkSession()/getMe() у useEffect вже після
// монтування, плюс сам Zustand persist рігідратується з localStorage теж
// не миттєво). Через це на першому рендері currentUserId завжди undefined,
// і будь-який запит з enabled: Boolean(currentUserId) або не стартує
// одразу, або (у гіршому випадку — на /profile) взагалі зависає в
// isPending назавжди.
//
// Фікс: читаємо React Query кеш під ключем ["me"], який серверний
// Server Component (page.tsx / layout.tsx) гідрує через HydrationBoundary
// одразу з правильним, нормалізованим (_id → id) юзером — без чекання на
// AuthProvider. Раніше цей хук існував окремо в src/app/(private)/profile/,
// тепер винесений сюди, у спільне місце, бо потрібен і на /profile,
// і на /authors/[id] (AuthorArticlesSection) — щоб не дублювати логіку
// в двох компонентах.
//
// ВАЖЛИВО: бекенд реально повертає ідентифікатор як "_id" (стандарт
// MongoDB), а тип AuthUser (types/user.ts, спільний) декларує поле "id" —
// це розбіжність типу й реального рантайму. Тому не довіряємо заявленому
// типу сліпо і підстраховуємось фолбеком на "_id".
async function fetchCurrentUser(): Promise<AuthUser> {
  const rawUser = await getMe();
  const rawUserWithMongoId = rawUser as AuthUser & { _id?: string };
  return { ...rawUser, id: rawUserWithMongoId.id ?? rawUserWithMongoId._id ?? "" };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    // За замовчуванням React Query ретраїть невдалий запит 3 рази. Для
    // перевірки автентифікації це шкідливо: гість на публічній сторінці
    // (наприклад /authors/[id]) отримає 401 від getMe(), і замість одного
    // тихого запиту буде 3 повторні спроби — кожна з яких ще й тригерить
    // axios-interceptor у browserApi.ts на спробу оновити токен (теж 401),
    // що в сумі перетворюється на цілий каскад мережевих запитів у консолі.
    // Повторний 401 нічого не змінить без дій самого юзера (логін), тож
    // ретраїти тут немає сенсу.
    retry: false,
  });
}

export function useCurrentUserId(): string | undefined {
  const { data } = useCurrentUser();
  return data?.id || undefined;
}
