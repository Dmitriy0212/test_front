"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ComponentType, Ref } from "react";
import { useMemo, useState } from "react";
import ArticlesList from "@/components/ArticlesList/ArticlesList";
import Loader from "@/components/Loader/Loader";
import ModalErrorSave from "@/components/ModalErrorSave/ModalErrorSave";
import { getArticlesFiltered, getSavedArticles, getUserInfo } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import type { Article } from "@/types/article";
import css from "./PopularArticles.module.css";

const POPULAR_ARTICLES_LIMIT = 4;
const BACKEND_MIN_PAGE_SIZE = 5;
const FALLBACK_ERROR_MESSAGE = "We could not load popular articles. Please try again.";

type PopularArticlesResponse = {
  articles: Article[];
  authorNames: Record<string, string>;
};

type PopulatedArticleOwner = {
  _id: string;
  name?: string;
  avatarUrl?: string;
};

type PopularArticleApi = Omit<Article, "ownerId"> & {
  ownerId: string | PopulatedArticleOwner | null;
};

type PopularArticlesApiResponse = {
  articles: PopularArticleApi[];
};

type SavedArticleIdsOverride = {
  userId: string;
  articleIds: string[];
};

interface ArticlesListIntegrationProps {
  articles: Article[];
  authorNames: Record<string, string>;
  savedArticleIds: string[];
  onGuestClick: () => void;
  onSavedArticlesChange: (savedArticleIds: string[]) => void;
  scrollTargetId: string | null;
  scrollTargetRef: Ref<HTMLLIElement>;
}

interface ModalErrorSaveIntegrationProps {
  onClose: () => void;
}

const IntegratedArticlesList = ArticlesList as ComponentType<ArticlesListIntegrationProps>;
const IntegratedModalErrorSave = ModalErrorSave as ComponentType<ModalErrorSaveIntegrationProps>;

async function fetchPopularArticles(): Promise<PopularArticlesResponse> {
  const response = (await getArticlesFiltered({
    page: 1,
    perPage: BACKEND_MIN_PAGE_SIZE,
    category: "popular",
  })) as unknown as PopularArticlesApiResponse;
  const apiArticles = response.articles.slice(0, POPULAR_ARTICLES_LIMIT);
  const embeddedAuthorEntries = apiArticles.flatMap((article) => {
    const owner = article.ownerId;

    return typeof owner === "object" && owner?.name ? [[owner._id, owner.name] as const] : [];
  });
  const embeddedAuthorNames = Object.fromEntries(embeddedAuthorEntries);
  const articles = apiArticles.map((article) => ({
    ...article,
    ownerId: typeof article.ownerId === "string" ? article.ownerId : (article.ownerId?._id ?? ""),
  }));
  const ownerIds = [
    ...new Set(
      articles
        .map((article) => article.ownerId)
        .filter((ownerId) => ownerId && !embeddedAuthorNames[ownerId]),
    ),
  ];
  const authorEntries = await Promise.all(
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
    articles,
    authorNames: Object.fromEntries([...embeddedAuthorEntries, ...authorEntries]),
  };
}

export default function PopularArticles() {
  const [savedArticleIdsOverride, setSavedArticleIdsOverride] =
    useState<SavedArticleIdsOverride | null>(null);
  const [isErrorSaveOpen, setIsErrorSaveOpen] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", userId],
    queryFn: getSavedArticles,
    enabled: Boolean(userId),
  });

  const { data, error, isError, isFetching, isPending } = useQuery({
    queryKey: ["articles", "popular", "homepage"],
    queryFn: fetchPopularArticles,
  });

  const savedArticleIds = useMemo(() => {
    if (!userId) {
      return [];
    }

    if (savedArticleIdsOverride?.userId === userId) {
      return savedArticleIdsOverride.articleIds;
    }

    return savedArticles?.map((article) => article._id) ?? [];
  }, [savedArticleIdsOverride, savedArticles, userId]);

  const handleSavedArticlesChange = (articleIds: string[]) => {
    if (userId) {
      setSavedArticleIdsOverride({ userId, articleIds });
    }
  };

  const handleGuestSaveAttempt = () => setIsErrorSaveOpen(true);

  const errorMessage = error instanceof Error ? error.message : FALLBACK_ERROR_MESSAGE;

  return (
    <section
      id="popular-articles"
      className={css.section}
      aria-labelledby="popular-articles-title"
      aria-busy={isFetching}
    >
      <div className={`container ${css.container}`}>
        <div className={css.headingRow}>
          <h2 id="popular-articles-title" className={css.title}>
            Popular Articles
          </h2>

          <Link href="/articles" className={css.allArticlesLink}>
            <span>Go to all Articles</span>
            <span className={css.linkIcon} aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 15 15" focusable="false">
                <use href="/sprite.svg#icon-Genericarrow-up-right" />
              </svg>
            </span>
          </Link>
        </div>

        {isPending && (
          <div className={css.loader} role="status" aria-label="Loading popular articles">
            <Loader />
          </div>
        )}

        {isError && (
          <p className={css.error} role="alert">
            {errorMessage}
          </p>
        )}

        {!isPending && !isError && (
          <div className={css.listWrapper}>
            <IntegratedArticlesList
              articles={data?.articles ?? []}
              authorNames={data?.authorNames ?? {}}
              savedArticleIds={savedArticleIds}
              onGuestClick={handleGuestSaveAttempt}
              onSavedArticlesChange={handleSavedArticlesChange}
              scrollTargetId={null}
              scrollTargetRef={null}
            />
          </div>
        )}
      </div>

      {isErrorSaveOpen && <IntegratedModalErrorSave onClose={() => setIsErrorSaveOpen(false)} />}
    </section>
  );
}
