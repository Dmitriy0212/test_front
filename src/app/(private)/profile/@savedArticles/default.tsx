"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import ArticlesEmptyState from "@/components/ArticlesEmptyState/ArticlesEmptyState";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import Loader from "@/components/Loader/Loader";
import Pagination from "@/components/Pagination/Pagination";
import { useCurrentUserId } from "../useCurrentUserId";
import {
  fetchSavedArticlesWithAuthors,
  savedArticlesQueryKey,
  type SavedArticlesWithAuthors,
} from "../savedArticlesQuery";
import css from "./default.module.css";

const ARTICLES_PER_PAGE = 12;

type ApiErrorResponse = { error?: string; message?: string };

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data.error ?? error.response?.data.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function SavedArticlesTab() {
  const currentUserId = useCurrentUserId();
  const queryClient = useQueryClient();
  const queryKey = savedArticlesQueryKey(currentUserId);

  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pendingScrollPageRef = useRef<number | null>(null);

  const { data, error, isError, isPending } = useQuery({
    queryKey,
    queryFn: fetchSavedArticlesWithAuthors,
    enabled: Boolean(currentUserId),
  });

  const allArticles = useMemo(() => data?.articles ?? [], [data?.articles]);
  const totalPages = Math.max(1, Math.ceil(allArticles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const articles = useMemo(
    () =>
      allArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE),
    [allArticles, currentPage],
  );

  // Scroll only after React has re-rendered with the new (usually shorter)
  // slice, otherwise scrollIntoView targets a scroll height computed from the
  // still-old list and can undershoot once the shorter page renders in.
  useEffect(() => {
    if (pendingScrollPageRef.current === null || pendingScrollPageRef.current !== currentPage) {
      return;
    }

    pendingScrollPageRef.current = null;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [currentPage]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === currentPage) {
      return;
    }

    pendingScrollPageRef.current = nextPage;
    setPage(nextPage);
  };

  const handleGuestSaveAttempt = () => {
    toast.error("Please log in to save articles");
  };

  const handleSavedArticlesChange = (articleIds: string[]) => {
    const stillSavedIds = new Set(articleIds);

    queryClient.setQueryData<SavedArticlesWithAuthors>(queryKey, (previous) =>
      previous
        ? { ...previous, articles: previous.articles.filter((a) => stillSavedIds.has(a._id)) }
        : previous,
    );
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
    <div className={css.section} ref={sectionRef}>
      <ArticlesList
        articles={articles}
        authorNames={data?.authorNames ?? {}}
        savedArticleIds={allArticles.map((article) => article._id)}
        onGuestClick={handleGuestSaveAttempt}
        onSavedArticlesChange={handleSavedArticlesChange}
      />

      <Pagination pageCount={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}
