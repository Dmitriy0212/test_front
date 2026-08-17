import type { ReactNode, Ref } from "react";
import ArticlesItem from "@/components/ArticlesItem/ArticlesItem";
import type { Article } from "@/types/article";
import css from "./ArticlesList.module.css";

interface ArticlesListProps {
  articles: Article[];
  authorNames: Record<string, string>;
  savedArticleIds: string[];
  onGuestClick: () => void;
  onSavedArticlesChange: (savedArticleIds: string[]) => void;
  scrollTargetId: string | null;
  scrollTargetRef: Ref<HTMLLIElement>;
  // Опціонально: дозволяє викликачу підмінити стандартну кнопку закладки
  // (ButtonAddToBookmarks) на щось інше per-article — наприклад,
  // EditArticleButton на /profile у табі "My Articles". ArticlesItem вже
  // підтримує проп action; якщо не передати renderAction, поведінка
  // лишається такою ж, як і раніше (bookmark-кнопка за замовчуванням).
  renderAction?: (article: Article) => ReactNode;
}

export default function ArticlesList({
  articles,
  authorNames,
  savedArticleIds,
  onGuestClick,
  onSavedArticlesChange,
  scrollTargetId,
  scrollTargetRef,
  renderAction,
}: ArticlesListProps) {
  if (articles.length === 0) {
    return <p className={css.empty}>No articles found.</p>;
  }

  return (
    <ul className={css.list}>
      {articles.map((article) => {
        const ownerId =
          typeof article.ownerId === "string" ? article.ownerId : article.ownerId?._id;
        const embeddedAuthorName =
          article.ownerId && typeof article.ownerId !== "string" ? article.ownerId.name : undefined;

        return (
          <li
            key={article._id}
            ref={article._id === scrollTargetId ? scrollTargetRef : undefined}
            className={css.item}
          >
            <ArticlesItem
              article={article}
              authorName={
                (ownerId ? authorNames[ownerId] : undefined) ??
                embeddedAuthorName ??
                "Unknown author"
              }
              isSaved={savedArticleIds.includes(article._id)}
              onGuestClick={onGuestClick}
              onSavedArticlesChange={onSavedArticlesChange}
              action={renderAction?.(article)}
            />
          </li>
        );
      })}
    </ul>
  );
}
