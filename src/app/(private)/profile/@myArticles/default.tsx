"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import ArticlesEmptyState from "@/components/ArticlesEmptyState/ArticlesEmptyState";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import EditArticleButton from "@/components/EditArticleButton/EditArticleButton";
import Loader from "@/components/Loader/Loader";
import Pagination from "@/components/Pagination/Pagination";
import { getSavedArticles, getUserArticles } from "@/lib/api/clientApi";
import type { Article } from "@/types/article";
import { useCurrentUser } from "../useCurrentUserId";
import css from "./default.module.css";

const ARTICLES_PER_PAGE = 12;

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

export default function MyArticlesTab() {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const [savedArticleIdsOverride, setSavedArticleIdsOverride] =
    useState<SavedArticleIdsOverride | null>(null);
  const [scrollTargetId, setScrollTargetId] = useState<string | null>(null);
  const firstNewArticleRef = useRef<HTMLLIElement>(null);

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", currentUserId],
    queryFn: getSavedArticles,
    enabled: Boolean(currentUserId),
  });

  const { data, error, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["myArticles", currentUserId],
      queryFn: ({ pageParam }) =>
        getUserArticles(currentUserId as string, { page: pageParam, perPage: ARTICLES_PER_PAGE }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
      enabled: Boolean(currentUserId),
    });

  const articles = useMemo(() => getUniqueArticles(data?.pages ?? []), [data?.pages]);
  const authorNames = useMemo(
    () => (currentUser && currentUserId ? { [currentUserId]: currentUser.name } : {}),
    [currentUser, currentUserId],
  );

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

  // На "My Articles" замінюємо стандартну bookmark-кнопку на EditArticleButton —
  // юзер не має "зберігати в закладки" власні статті, натомість редагує їх.
  // Заглушка: сторінки/форми редагування статті ще не існує в жодній гілці
  // (не наша зона відповідальності і не входить у поточний фідбек тімліда
  // по /profile), тож onClick поки що просто повідомляє про майбутню фічу,
  // а не веде на неперевірений/неіснуючий маршрут. Замінити на router.push
  // до реального шляху, коли сторінка редагування буде готова й змержена.
  const handleEdit = () => {
    toast("Editing articles is coming soon");
  };

  const handleSavedArticlesChange = (articleIds: string[]) => {
    if (currentUserId) {
      setSavedArticleIdsOverride({ userId: currentUserId, articleIds });
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(getErrorMessage(error, "Couldn't load your articles. Please try again later."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  if (isPending) {
    return <Loader />;
  }

  if (isError && articles.length === 0) {
    return (
      <p className={css.error} role="alert">
        {getErrorMessage(error, "Couldn't load your articles. Please try again later.")}
      </p>
    );
  }

  if (articles.length === 0) {
    return <ArticlesEmptyState description="Write your first article" />;
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
        renderAction={(article) => (
          <EditArticleButton
            articleTitle={article.title}
            onClick={handleEdit}
          />
        )}
      />

      <Pagination
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
