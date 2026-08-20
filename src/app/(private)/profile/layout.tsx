import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import EditNicknameButton from "./EditNicknameButton";
import ProfileAuthorHeader from "./ProfileAuthorHeader";
import { ProfileTabProvider } from "./ProfileTabContext";
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

  queryClient.setQueryData(["me"], currentUser);

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ["myArticles", currentUser.id],
      queryFn: () => getUserArticles(currentUser.id, { page: 1, perPage: ARTICLES_PER_PAGE }),
      initialPageParam: 1,
    });
  } catch {
  }

  return (
    <div className={css.page}>
      <div className="container">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProfileTabProvider>
            <div className={css.authorRow}>
              <ProfileAuthorHeader
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                myArticlesCount={profile.articlesAmount}
              />
              <EditNicknameButton />
            </div>

            <ProfileTabsClient myArticles={myArticles} savedArticles={savedArticles}>
              {children}
            </ProfileTabsClient>
          </ProfileTabProvider>
        </HydrationBoundary>
      </div>
    </div>
  );
}