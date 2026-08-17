import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import AuthorInfo from "@/components/AuthorInfo/AuthorInfo";
import EditNicknameButton from "./EditNicknameButton";
import getQueryClient from "@/lib/api/getQueryClient";
import { getUserArticles, getUserInfo } from "@/lib/api/serverApi";
import { getCurrentUserServer } from "./getCurrentUserServer";
import ProfileTabsClient from "./ProfileTabsClient";
import css from "./layout.module.css";

const ARTICLES_PER_PAGE = 12;

type ProfileLayoutProps = {
  children: ReactNode;
  myArticles: ReactNode;
  savedArticles: ReactNode;
};

// Наша частина по ТЗ ProfilePage: шапка (AuthorInfo, перевикористана з
// AuthorPage), захист від гостей і prefetch дефолтного табу (My Articles),
// щоб не порушувати вимогу базового ТЗ про prefetch для пагінованих списків.
//
// Захист від гостей зроблений на сервері (redirect() до рендеру), а не через
// клієнтський useAuthStore — це надійніше: не залежить від того, чи встиг
// persist-стан Zustand синхронізуватись, і коректно спрацьовує навіть якщо
// сесія протухла між заходами (на відміну від застарілого isAuthenticated
// у сторі, з яким ми стикались раніше).
export default async function ProfileLayout({
  children,
  myArticles,
  savedArticles,
}: ProfileLayoutProps) {
  const currentUser = await getCurrentUserServer();

  if (!currentUser) {
    redirect("/login");
  }

  const profile = await getUserInfo(currentUser.id);

  const queryClient = getQueryClient();

  // Гідруємо кеш під ключем ["me"] уже нормалізованим currentUser (без
  // додаткового запиту на бекенд — дані вже маємо). Клієнтські таби читають
  // саме цей ключ (useCurrentUserId → useCurrentUser) замість Zustand-стору,
  // який заповнюється асинхронно і був причиною вічного спінера (детальніше
  // в коментарі useCurrentUserId.ts).
  queryClient.setQueryData(["me"], currentUser);

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["myArticles", currentUser.id],
      queryFn: () => getUserArticles(currentUser.id, { page: 1, perPage: ARTICLES_PER_PAGE }),
      initialPageParam: 1,
    });
  } catch {
    // ігноруємо навмисно: клієнтський useInfiniteQuery в @myArticles повторить запит сам
  }

  return (
    <div className={css.page}>
      <div className="container">
        <div className={css.authorRow}>
          <AuthorInfo user={profile} />
          <EditNicknameButton />
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProfileTabsClient myArticles={myArticles} savedArticles={savedArticles}>
            {children}
          </ProfileTabsClient>
        </HydrationBoundary>
      </div>
    </div>
  );
}
