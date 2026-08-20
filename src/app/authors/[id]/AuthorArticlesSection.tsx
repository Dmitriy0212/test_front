"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import { ARTICLES_PER_PAGE } from "./constants";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import ModalErrorSave from "@/components/ModalErrorSave/ModalErrorSave";
import Pagination from "@/components/Pagination/Pagination";
import { getSavedArticles, getUserArticles } from "@/lib/api/clientApi";
import { useCurrentUserId } from "@/hooks/useCurrentUser";
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

export default function AuthorArticlesSection({
  authorId,
  authorName,
}: AuthorArticlesSectionProps) {
  const [page, setPage] = useState(1);
  const [savedArticleIdsOverride, setSavedArticleIdsOverride] =
    useState<SavedArticleIdsOverride | null>(null);
  const [isErrorSaveOpen, setIsErrorSaveOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pendingScrollPageRef = useRef<number | null>(null);

  const currentUserId = useCurrentUserId();

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", currentUserId],
    queryFn: getSavedArticles,
    enabled: Boolean(currentUserId),
  });

  const { data, error, isError, isFetching, isPending } = useQuery({
    queryKey: ["authorArticles", authorId, page],
    queryFn: () => getUserArticles(authorId, { page, perPage: ARTICLES_PER_PAGE }),
  });

  const articles = data?.articles ?? [];
  const totalPages = data?.totalPages ?? 0;
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

  // Scroll only once the requested page's data has actually landed (not while
  // `isFetching`), otherwise scrollIntoView targets a scroll height computed
  // from the still-old (usually longer) list and can undershoot after the
  // shorter page renders in.
  useEffect(() => {
    if (pendingScrollPageRef.current === null || pendingScrollPageRef.current !== page) {
      return;
    }

    if (isFetching) {
      return;
    }

    pendingScrollPageRef.current = null;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [page, isFetching]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    pendingScrollPageRef.current = nextPage;
    setPage(nextPage);
  };

  const handleGuestSaveAttempt = () => setIsErrorSaveOpen(true);

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
    <div className={css.section} ref={sectionRef} aria-busy={isFetching}>
      <ArticlesList
        articles={articles}
        authorNames={authorNames}
        savedArticleIds={savedArticleIds}
        onGuestClick={handleGuestSaveAttempt}
        onSavedArticlesChange={handleSavedArticlesChange}
      />

      <Pagination pageCount={totalPages} currentPage={page} onPageChange={handlePageChange} />

      {isErrorSaveOpen && <ModalErrorSave onClose={() => setIsErrorSaveOpen(false)} />}
    </div>
  );
}
