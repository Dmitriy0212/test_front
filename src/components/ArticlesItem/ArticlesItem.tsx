"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ButtonAddToBookmarks from "@/components/ButtonAddToBookmarks/ButtonAddToBookmarks";
import type { Article } from "@/types/article";
import css from "./ArticlesItem.module.css";

export interface ArticlesItemProps {
  article: Article;
  authorName: string;
  isSaved: boolean;
  onGuestClick: () => void;
  onSavedArticlesChange: (savedArticleIds: string[]) => void;
  action?: ReactNode;
}

export default function ArticlesItem({
  article,
  authorName,
  isSaved,
  onGuestClick,
  onSavedArticlesChange,
  action,
}: ArticlesItemProps) {
  return (
    <article className={css.card}>
      <div className={css.imageWrapper}>
        <Image
          src={article.img}
          alt={article.title}
          fill
          sizes="(max-width: 767px) 337px, (max-width: 1439px) 316px, 368px"
          className={css.image}
        />
      </div>

      <div className={css.content}>
        <p className={css.author}>{authorName}</p>
        <h3 className={css.title}>{article.title}</h3>
        <p className={css.description}>{article.desc}</p>
      </div>

      <div className={css.actions}>
        <Link
          href={`/articles/${article._id}`}
          className={css.learnMore}
          aria-label={`Learn more about ${article.title}`}
        >
          Learn more
        </Link>

        {action ?? (
          <ButtonAddToBookmarks
            articleId={article._id}
            isSaved={isSaved}
            variant="icon"
            onGuestClick={onGuestClick}
            onSavedArticlesChange={onSavedArticlesChange}
          />
        )}
      </div>
    </article>
  );
}
