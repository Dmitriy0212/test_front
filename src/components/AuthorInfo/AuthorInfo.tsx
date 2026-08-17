import Image from "next/image";
import type { User } from "@/types/user";
import css from "./AuthorInfo.module.css";

type AuthorInfoProps = {
  user: User;
};

export default function AuthorInfo({ user }: AuthorInfoProps) {
  const { name, avatarUrl, articlesAmount } = user;

  return (
    <section className={css.authorInfo}>
      <div className={css.avatarWrapper}>
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} width={96} height={96} className={css.avatar} />
        ) : (
          <div className={css.avatarPlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={css.authorDetails}>
        <h1 className={css.name}>{name}</h1>
        <p className={css.articlesAmount}>
          {articlesAmount} {articlesAmount === 1 ? "article" : "articles"}
        </p>
      </div>
    </section>
  );
}
