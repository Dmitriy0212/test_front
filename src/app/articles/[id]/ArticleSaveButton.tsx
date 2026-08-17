"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import ButtonAddToBookmarks from "@/components/ButtonAddToBookmarks/ButtonAddToBookmarks";
import ModalErrorSave from "@/components/ModalErrorSave/ModalErrorSave";
import { useCurrentUserId } from "@/hooks/useCurrentUser";
import { getSavedArticles } from "@/lib/api/clientApi";

type ArticleSaveButtonProps = {
  articleId: string;
};

type SavedState = {
  userId?: string;
  articleIds: string[];
};

export default function ArticleSaveButton({
  articleId,
}: ArticleSaveButtonProps) {
  const userId = useCurrentUserId();

  const [savedState, setSavedState] = useState<SavedState>({
    userId: undefined,
    articleIds: [],
  });

  const [isErrorSaveOpen, setIsErrorSaveOpen] = useState(false);

  const { data: savedArticles } = useQuery({
    queryKey: ["saved-articles", userId],
    queryFn: getSavedArticles,
    enabled: Boolean(userId),
  });

  const savedArticleIds =
    userId && savedState.userId === userId
      ? savedState.articleIds
      : userId
        ? (savedArticles?.map((article) => article._id) ?? [])
        : [];

  const handleSavedArticlesChange = (articleIds: string[]) => {
    if (!userId) {
      return;
    }

    setSavedState({
      userId,
      articleIds,
    });
  };

  return (
    <>
      <ButtonAddToBookmarks
        articleId={articleId}
        isSaved={savedArticleIds.includes(articleId)}
        variant="wide"
        onGuestClick={() => setIsErrorSaveOpen(true)}
        onSavedArticlesChange={handleSavedArticlesChange}
      />

      {isErrorSaveOpen && (
        <ModalErrorSave
          onClose={() => setIsErrorSaveOpen(false)}
        />
      )}
    </>
  );
}