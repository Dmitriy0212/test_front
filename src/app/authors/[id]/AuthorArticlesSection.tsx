"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { ARTICLES_PER_PAGE } from "./constants";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import Pagination from "@/components/Pagination/Pagination";
import { getSavedArticles, getUserArticles } from "@/lib/api/clientApi";
import { useCurrentUserId } from "@/hooks/useCurrentUser";
import type { Article } from "@/types/article";
import css from "./AuthorArticlesSection.module.css";

type AuthorArticlesSectionProps = {
  authorId: string;
  authorName: string;
};

type SavedArticleIdsOverride = {
  userId: string;
  articleIds: string[];
};

type ApiErrorResponse = { error?: string; message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.error ?? error.response?.data.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

function getUniqueArticles(pages: { articles: Article[] }[]): Article[] {
  const articlesById = new Map<string, Article>();
  pages.forEach((page) => {
    page.articles.forEach((article) => articlesById.set(article._id, article));
  });
  return [...articlesById.values()];
}


export default function AuthorArticlesSection({
  authorId,
  authorName,
}: AuthorArticlesSectionProps) {
  const [savedArticleIdsOverride, setSavedArticleIdsOverride] =
    useState<SavedArticleIdsOverride | null>(null);
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);
  const firstNewArticleRef = useRef<HTMLLIElement>(null);

  // Раніше: useAuthStore((state) => state.user?.id) — бекенд реально
  // повертає "_id", а не "id", тому currentUserId завжди був undefined,
  // запит на збережені статті ніколи не робився, і кнопка Save завжди
  // показувала "не збережено" навіть для вже збережених статей. Детальніше
  // в коментарі src/hooks/useCurrentUser.ts.
  const currentUserId = useCurrentUserId();

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", currentUserId],
    queryFn: getSavedArticles,
    enabled: Boolean(currentUserId),
  });

  const { data, error, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["authorArticles", authorId],
      queryFn: ({ pageParam }) =>
        getUserArticles(authorId, { page: pageParam, perPage: ARTICLES_PER_PAGE }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    });

  const articles = useMemo(() => getUniqueArticles(data?.pages ?? []), [data?.pages]);
  const authorNames = useMemo(() => ({ [authorId]: authorName }), [authorId, authorName]);

  const savedArticleIds = useMemo(() => {
    if (!currentUserId) {
      return [];
    }

    if (savedArticleIdsOverride?.userId === currentUserId) {
      return savedArticleIdsOverride.articleIds;
    }

    return savedArticles?.map((article) => article._id) ?? [];
  }, [currentUserId, savedArticleIdsOverride, savedArticles]);

  useEffect(() => {
    if (!scrollTargetId || !firstNewArticleRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    firstNewArticleRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    setScrollTargetId(null);
  }, [scrollTargetId]);

  const handleLoadMore = async () => {
    const previousArticleIds = new Set(articles.map((article) => article._id));
    const result = await fetchNextPage();

    if (result.isError) {
      return;
    }

    const updatedArticles = getUniqueArticles(result.data?.pages ?? []);
    const firstNewArticle = updatedArticles.find((article) => !previousArticleIds.has(article._id));

    if (firstNewArticle) {
      setScrollTargetId(firstNewArticle._id);
    }
  };

  const handleGuestSaveAttempt = () => {
    toast.error("Please log in to save articles");
  };

  const handleSavedArticlesChange = (articleIds: string[]) => {
    if (currentUserId) {
      setSavedArticleIdsOverride({ userId: currentUserId, articleIds });
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error, "Couldn't load articles. Please try again later."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  if (isPending) {
    return (
      <p className={css.message} role="status">
        Loading articles...
      </p>
    );
  }

  if (isError && articles.length === 0) {
    return (
      <p className={css.error} role="alert">
        {getErrorMessage(error, "Couldn't load articles. Please try again later.")}
      </p>
    );
  }

  return (
    <div className={css.section}>
      <ArticlesList
        articles={articles}
        authorNames={authorNames}
        savedArticleIds={savedArticleIds}
        onGuestClick={handleGuestSaveAttempt}
        onSavedArticlesChange={handleSavedArticlesChange}
        scrollTargetId={scrollTargetId}
        scrollTargetRef={firstNewArticleRef}
      />

      <Pagination
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
