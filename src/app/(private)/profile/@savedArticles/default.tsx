"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import ArticlesEmptyState from "@/components/ArticlesEmptyState/ArticlesEmptyState";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import Loader from "@/components/Loader/Loader";
import Pagination from "@/components/Pagination/Pagination";
import { getSavedArticles, getUserInfo } from "@/lib/api/clientApi";
import { useCurrentUserId } from "../useCurrentUserId";
import type { Article } from "@/types/article";
import css from "./default.module.css";

const ARTICLES_PER_PAGE = 12;

type ApiErrorResponse = { error?: string; message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.error ?? error.response?.data.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

async function fetchSavedArticlesWithAuthors(): Promise<{
  articles: Article[];
  authorNames: Record<string, string>;
}> {
  const articles = await getSavedArticles();

  const embeddedAuthorEntries = articles.flatMap((article) =>
    article.ownerId === null || typeof article.ownerId === "string"
      ? []
      : ([[article.ownerId._id, article.ownerId.name]] as const),
  );
  const ownerIdsToResolve = [
    ...new Set(
      articles.flatMap((article) => (typeof article.ownerId === "string" ? [article.ownerId] : [])),
    ),
  ];
  const fetchedAuthorEntries = await Promise.all(
    ownerIdsToResolve.map(async (ownerId) => {
      try {
        const author = await getUserInfo(ownerId);
        return [ownerId, author.name] as const;
      } catch {
        return [ownerId, "Unknown author"] as const;
      }
    }),
  );

  return {
    articles,
    authorNames: Object.fromEntries([...embeddedAuthorEntries, ...fetchedAuthorEntries]),
  };
}

export default function SavedArticlesTab() {
  const currentUserId = useCurrentUserId();

  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);
  const [removedArticleIds, setRemovedArticleIds] = useState<Set<string>>(new Set());
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);
  const firstNewArticleRef = useRef<HTMLLIElement>(null);

  const { data, error, isError, isPending } = useQuery({
    queryKey: ["saved-articles-full", currentUserId],
    queryFn: fetchSavedArticlesWithAuthors,
    enabled: Boolean(currentUserId),
  });

  const allArticles = useMemo(
    () => (data?.articles ?? []).filter((article) => !removedArticleIds.has(article._id)),
    [data?.articles, removedArticleIds],
  );
  const articles = useMemo(() => allArticles.slice(0, visibleCount), [allArticles, visibleCount]);
  const hasMore = visibleCount < allArticles.length;

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

  const handleLoadMore = () => {
    const previousCount = articles.length;
    const nextCount = Math.min(visibleCount + ARTICLES_PER_PAGE, allArticles.length);
    const firstNewArticle = allArticles[previousCount];

    setVisibleCount(nextCount);

    if (firstNewArticle) {
      setScrollTargetId(firstNewArticle._id);
    }
  };

  const handleGuestSaveAttempt = () => {
    toast.error("Please log in to save articles");
  };

  // На цій вкладці всі показані статті за визначенням "збережені", тож коли юзер
  // прибирає закладку прямо тут — статтю варто одразу прибрати зі списку.
  const handleSavedArticlesChange = (articleIds: string[]) => {
    const stillSavedIds = new Set(articleIds);
    setRemovedArticleIds((previous) => {
      const next = new Set(previous);
      allArticles.forEach((article) => {
        if (!stillSavedIds.has(article._id)) {
          next.add(article._id);
        }
      });
      return next;
    });
  };

  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error, "Couldn't load saved articles. Please try again later."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  if (isPending) {
    return <Loader />;
  }

  if (isError && allArticles.length === 0) {
    return (
      <p className={css.error} role="alert">
        {getErrorMessage(error, "Couldn't load saved articles. Please try again later.")}
      </p>
    );
  }

  if (allArticles.length === 0) {
    return (
      <ArticlesEmptyState
        description="Save your first article"
        actionLabel="Go to articles"
        actionHref="/articles"
      />
    );
  }

  return (
    <div className={css.section}>
      <ArticlesList
        articles={articles}
        authorNames={data?.authorNames ?? {}}
        savedArticleIds={allArticles.map((article) => article._id)}
        onGuestClick={handleGuestSaveAttempt}
        onSavedArticlesChange={handleSavedArticlesChange}
        scrollTargetId={scrollTargetId}
        scrollTargetRef={firstNewArticleRef}
      />

      <Pagination hasMore={hasMore} isLoading={false} onLoadMore={handleLoadMore} />
    </div>
  );
}
