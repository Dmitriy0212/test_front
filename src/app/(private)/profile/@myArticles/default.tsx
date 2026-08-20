"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

import ArticlesEmptyState from "@/components/ArticlesEmptyState/ArticlesEmptyState";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import EditArticleButton from "@/components/EditArticleButton/EditArticleButton";
import Loader from "@/components/Loader/Loader";
import Pagination from "@/components/Pagination/Pagination";
import { getSavedArticles, getUserArticles } from "@/lib/api/clientApi";
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

export default function MyArticlesTab() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const [page, setPage] = useState(1);
  const [savedArticleIdsOverride, setSavedArticleIdsOverride] =
    useState<SavedArticleIdsOverride | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pendingScrollPageRef = useRef<number | null>(null);

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", currentUserId],
    queryFn: getSavedArticles,
    enabled: Boolean(currentUserId),
  });

  const { data, error, isError, isFetching, isPending } = useQuery({
    queryKey: ["myArticles", currentUserId, page],
    queryFn: () => getUserArticles(currentUserId as string, { page, perPage: ARTICLES_PER_PAGE }),
    enabled: Boolean(currentUserId),
  });

  const articles = data?.articles ?? [];
  const totalPages = data?.totalPages ?? 0;
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

  const handleGuestSaveAttempt = () => {
    toast.error("Please log in to save articles");
  };

  const handleEdit = (articleId: string) => {
    router.push(`/articles/${articleId}/edit`);
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
    <div className={css.section} ref={sectionRef} aria-busy={isFetching}>
      <ArticlesList
        articles={articles}
        authorNames={authorNames}
        savedArticleIds={savedArticleIds}
        onGuestClick={handleGuestSaveAttempt}
        onSavedArticlesChange={handleSavedArticlesChange}
        renderAction={(article) => (
          <EditArticleButton
            articleTitle={article.title}
            onClick={() => handleEdit(article._id)}
          />
        )}
      />

      <Pagination pageCount={totalPages} currentPage={page} onPageChange={handlePageChange} />
    </div>
  );
}
