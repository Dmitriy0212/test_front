"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { addSavedArticle, removeSavedArticle } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";
import css from "./ButtonAddToBookmarks.module.css";

export type BookmarkButtonVariant = "icon" | "wide";

export interface ButtonAddToBookmarksProps {
  articleId: string;
  isSaved: boolean;
  variant?: BookmarkButtonVariant;
  onGuestClick: () => void;
  onSavedArticlesChange: (savedArticleIds: string[]) => void;
}

const FALLBACK_ERROR_MESSAGE = "Unable to update saved articles";
type ApiErrorResponse = { error?: string; message?: string };

/**
 * @example
 * <ButtonAddToBookmarks
 *   articleId={article.id}
 *   isSaved={savedArticleIds.includes(article.id)}
 *   variant="icon"
 *   onGuestClick={() => setIsErrorSaveOpen(true)}
 *   onSavedArticlesChange={setSavedArticleIds}
 * />
 */
export default function ButtonAddToBookmarks({
  articleId,
  isSaved,
  variant = "icon",
  onGuestClick,
  onSavedArticlesChange,
}: ButtonAddToBookmarksProps) {
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({
    mutationFn: () => (isSaved ? removeSavedArticle(articleId) : addSavedArticle(articleId)),
    onSuccess: ({ savedArticles }) => {
      onSavedArticlesChange(savedArticles);
    },
    onError: (error) => {
      const message = isAxiosError<ApiErrorResponse>(error)
        ? (error.response?.data.error ?? error.response?.data.message ?? FALLBACK_ERROR_MESSAGE)
        : error instanceof Error
          ? error.message
          : FALLBACK_ERROR_MESSAGE;

      toast.error(message);
    },
  });

  const handleClick = () => {
    if (!user) {
      onGuestClick();
      return;
    }

    mutation.mutate();
  };

  const isPending = mutation.isPending;
  const visibleLabel = isPending
    ? isSaved
      ? "Removing..."
      : "Saving..."
    : isSaved
      ? "Unsave"
      : "Save";
  const accessibleLabel = isPending
    ? isSaved
      ? "Removing article from bookmarks"
      : "Saving article to bookmarks"
    : isSaved
      ? "Remove article from bookmarks"
      : "Add article to bookmarks";

  return (
    <button
      type="button"
      className={css.button}
      data-variant={variant}
      data-saved={isSaved}
      data-state={isPending ? "loading" : "idle"}
      aria-label={accessibleLabel}
      aria-pressed={isSaved}
      aria-busy={isPending}
      disabled={isPending}
      onClick={handleClick}
    >
      {variant === "wide" && <span className={css.label}>{visibleLabel}</span>}

      <svg className={css.icon} aria-hidden="true" focusable="false">
        <use href="/sprite.svg#icon-Genericbookmark-alternative" />
      </svg>
    </button>
  );
}
