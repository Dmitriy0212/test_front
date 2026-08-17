import Link from "next/link";
import css from "./ArticlesEmptyState.module.css";

type ArticlesEmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function ArticlesEmptyState({
  title = "Nothing found.",
  description = "Be the first, who create an article",
  actionLabel = "Create an article",
  actionHref = "/articles/create",
}: ArticlesEmptyStateProps) {
  return (
    <div className={css.emptyState} role="status">
      <svg className={css.icon} aria-hidden="true" focusable="false">
        <use href="/sprite.svg#icon-Genericalert-circle" />
      </svg>

      <div className={css.copy}>
        <p className={css.title}>{title}</p>
        <p className={css.description}>{description}</p>
      </div>

      <Link href={actionHref} className={css.link}>
        {actionLabel}
      </Link>
    </div>
  );
}
