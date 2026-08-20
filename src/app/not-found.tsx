import Link from "next/link";
import css from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={`container ${css.page}`}>
      <svg className={css.icon} aria-hidden="true" focusable="false">
        <use href="/sprite.svg#icon-Genericalert-circle" />
      </svg>

      <h1 className={css.title}>404 — Page not found</h1>
      <p className={css.description}>
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>

      <Link href="/" className={css.link}>
        Back to home
      </Link>
    </div>
  );
}
