"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { useCurrentUserId } from "./useCurrentUserId";
import { useProfileTab } from "./ProfileTabContext";
import { fetchSavedArticlesWithAuthors, savedArticlesQueryKey } from "./savedArticlesQuery";
import css from "@/components/AuthorInfo/AuthorInfo.module.css";

type ProfileAuthorHeaderProps = {
  name: string;
  avatarUrl: string | null;
  myArticlesCount: number;
};

export default function ProfileAuthorHeader({
  name,
  avatarUrl,
  myArticlesCount,
}: ProfileAuthorHeaderProps) {
  const { activeTab } = useProfileTab();
  const currentUserId = useCurrentUserId();

  const { data } = useQuery({
    queryKey: savedArticlesQueryKey(currentUserId),
    queryFn: fetchSavedArticlesWithAuthors,
    enabled: Boolean(currentUserId),
  });

  const savedArticlesCount = data?.articles.length ?? 0;
  const articlesAmount = activeTab === "myArticles" ? myArticlesCount : savedArticlesCount;

  return (
    <section className={css.authorInfo}>
      <div className={css.avatarWrapper}>
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} width={96} height={96} className={css.avatar} />
        ) : (
          <div className={css.avatarPlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={css.authorDetails}>
        <h1 className={css.name}>{name}</h1>
        <p className={css.articlesAmount}>
          {articlesAmount} {articlesAmount === 1 ? "article" : "articles"}
        </p>
      </div>
    </section>
  );
}