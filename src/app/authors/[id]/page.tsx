import { notFound } from "next/navigation";
import { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { ARTICLES_PER_PAGE } from "./constants";
import { getUserInfo, getUserArticles } from "@/lib/api/serverApi";
import { getCurrentUserServer } from "./getCurrentUserServer";
import getQueryClient from "@/lib/api/getQueryClient";
import AuthorInfo from "@/components/AuthorInfo/AuthorInfo";
import AuthorArticlesSection from "./AuthorArticlesSection";
import css from "./page.module.css";

type AuthorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getUserOrNotFound(id: string) {
  try {
    return await getUserInfo(id);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserOrNotFound(id);

  const title = `${user.name} — Harmoniq`;
  const description = `${user.name}'s public profile on Harmoniq: ${user.articlesAmount} published articles.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params;

  const user = await getUserOrNotFound(id);

  const queryClient = getQueryClient();

  // Гідруємо кеш під ключем ["me"] поточним відвідувачем (може бути null
  // для гостя — це нормально, не помилка). Раніше AuthorArticlesSection
  // брав currentUserId з Zustand-стору (useAuthStore), який заповнюється
  // асинхронно, через що запит на збережені статті взагалі не робився
  // одразу при вході на сторінку, і кнопка Save завжди показувала "не
  // збережено" навіть для вже збережених статей. Детальніше в коментарі
  // src/hooks/useCurrentUser.ts.
  const currentUser = await getCurrentUserServer();
  queryClient.setQueryData(["me"], currentUser);

  // Якщо prefetch не вдався (наприклад, бекенд тимчасово недоступний), не валимо
  // всю сторінку: клієнтський useInfiniteQuery в AuthorArticlesSection повторить
  // запит сам і покаже toast з помилкою.
  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["authorArticles", id],
      queryFn: () => getUserArticles(id, { page: 1, perPage: ARTICLES_PER_PAGE }),
      initialPageParam: 1,
    });
  } catch {
    // ігноруємо навмисно
  }

  return (
    <div className={css.page}>
      <div className="container">
        <AuthorInfo user={user} />

        <HydrationBoundary state={dehydrate(queryClient)}>
          <AuthorArticlesSection authorId={id} authorName={user.name} />
        </HydrationBoundary>
      </div>
    </div>
  );
}
