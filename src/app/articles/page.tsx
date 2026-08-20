"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import ArticleFilter, { type ArticlesFilterValue } from "@/components/ArticleFilter/ArticleFilter";
import ArticlesEmptyState from "@/components/ArticlesEmptyState/ArticlesEmptyState";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import ModalErrorSave from "@/components/ModalErrorSave/ModalErrorSave";
import Pagination from "@/components/Pagination/Pagination";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import {
  getArticles,
  getArticlesFiltered,
  getSavedArticles,
  getUserInfo,
} from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { Article, ArticlesListResponse } from "@/types/article";
import css from "./page.module.css";

const ARTICLES_PER_PAGE = 12;
const FALLBACK_ERROR_MESSAGE = "We could not load the articles. Please try again.";

type ArticlesPageResponse = ArticlesListResponse & {
  authorNames: Record<string, string>;
};

type SavedArticleIdsOverride = {
  userId: string;
  articleIds: string[];
};

type ModalErrorSaveIntegrationProps = {
  onClose: () => void;
};

const IntegratedModalErrorSave = ModalErrorSave as ComponentType<ModalErrorSaveIntegrationProps>;

async function fetchArticlesPage(
  page: number,
  filter: ArticlesFilterValue,
): Promise<ArticlesPageResponse> {
  const response =
    filter === "popular"
      ? await getArticlesFiltered({ page, perPage: ARTICLES_PER_PAGE, category: "popular" })
      : await getArticles({ page, perPage: ARTICLES_PER_PAGE });

  const embeddedAuthorEntries = response.articles.flatMap((article) =>
    article.ownerId === null || typeof article.ownerId === "string"
      ? []
      : ([[article.ownerId._id, article.ownerId.name]] as const),
  );
  const ownerIds = [
    ...new Set(
      response.articles.flatMap((article) =>
        typeof article.ownerId === "string" ? [article.ownerId] : [],
      ),
    ),
  ];
  const fetchedAuthorEntries = await Promise.all(
    ownerIds.map(async (ownerId) => {
      try {
        const author = await getUserInfo(ownerId);
        return [ownerId, author.name] as const;
      } catch {
        return [ownerId, "Unknown author"] as const;
      }
    }),
  );

  return {
    ...response,
    authorNames: Object.fromEntries([...embeddedAuthorEntries, ...fetchedAuthorEntries]),
  };
}

export default function ArticlesPage() {
  const [filter, setFilter] = useState<ArticlesFilterValue>("popular");
  const [page, setPage] = useState(1);
  const [savedArticleIdsOverride, setSavedArticleIdsOverride] =
    useState<SavedArticleIdsOverride | null>(null);
  const [isErrorSaveOpen, setIsErrorSaveOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const pendingScrollPageRef = useRef<number | null>(null);
  const userId = useAuthStore((state) => state.user?.id);

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", userId],
    queryFn: getSavedArticles,
    enabled: Boolean(userId),
  });

  const { data, error, isError, isFetching, isPending, isPlaceholderData } = useQuery({
    queryKey: ["articles", filter, page],
    queryFn: () => fetchArticlesPage(page, filter),
    placeholderData: keepPreviousData,
  });

  const articles: Article[] = data?.articles ?? [];
  const authorNames = data?.authorNames ?? {};
  const totalArticles = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const isArticlesCountLoading = isPending || isPlaceholderData;
  const savedArticleIds = useMemo(() => {
    if (!userId) {
      return [];
    }

    if (savedArticleIdsOverride?.userId === userId) {
      return savedArticleIdsOverride.articleIds;
    }

    return savedArticles?.map((article) => article._id) ?? [];
  }, [savedArticleIdsOverride, savedArticles, userId]);

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

  const handleFilterChange = (nextFilter: ArticlesFilterValue) => {
    if (nextFilter === filter) {
      return;
    }

    setFilter(nextFilter);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    pendingScrollPageRef.current = nextPage;
    setPage(nextPage);
  };

  const handleGuestSaveAttempt = () => setIsErrorSaveOpen(true);

  const handleSavedArticlesChange = (articleIds: string[]) => {
    if (userId) {
      setSavedArticleIdsOverride({ userId, articleIds });
    }
  };

  const hasInitialError = isError && articles.length === 0;
  const errorMessage = error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE;

  return (
    <div className={css.page}>
      <section
        ref={sectionRef}
        className={`container ${css.container}`}
        aria-labelledby="articles-title"
        aria-busy={isFetching}
      >
        <SectionTitle id="articles-title" as="h1">
          Articles
        </SectionTitle>

        <div className={css.toolbar}>
          <p className={css.count} aria-live="polite">
            {isArticlesCountLoading ? null : `${totalArticles} articles`}
          </p>

          <ArticleFilter value={filter} disabled={isFetching} onChange={handleFilterChange} />
        </div>

        {isPending && (
          <p className={css.message} role="status">
            Loading articles...
          </p>
        )}

        {hasInitialError && (
          <p className={css.error} role="alert">
            {errorMessage}
          </p>
        )}

        {!isPending && !hasInitialError && (
          <>
            {articles.length === 0 ? (
              <ArticlesEmptyState />
            ) : (
              <>
                <ArticlesList
                  articles={articles}
                  authorNames={authorNames}
                  savedArticleIds={savedArticleIds}
                  onGuestClick={handleGuestSaveAttempt}
                  onSavedArticlesChange={handleSavedArticlesChange}
                />

                <Pagination
                  pageCount={totalPages}
                  currentPage={page}
                  onPageChange={handlePageChange}
                />
              </>
            )}

            {isError && articles.length > 0 && (
              <p className={css.error} role="alert">
                {errorMessage}
              </p>
            )}
          </>
        )}

        {isPlaceholderData && (
          <span className={css.visuallyHidden} role="status">
            Updating articles...
          </span>
        )}
      </section>

      {isErrorSaveOpen && <IntegratedModalErrorSave onClose={() => setIsErrorSaveOpen(false)} />}
    </div>
  );
}
