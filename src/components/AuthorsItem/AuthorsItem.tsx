import Image from "next/image";
import Link from "next/link";

import { type User } from "@/types/user";
import css from "./AuthorsItem.module.css";

interface AuthorUserProps {
  author: User;
}

export default function AuthorsItem({ author }: AuthorUserProps) {
  const firstName = author.name.trim().split(/\s+/)[0];
  const avatarUrl = author.avatarUrl?.replace(/^http:\/\//, "https://");

  return (
    <li className={css.item}>
      <Link href={`/authors/${author._id}`} className={css.link}>
        <Image
          src={avatarUrl || "/default-avatar.png"}
          alt={author.name}
          width={262}
          height={262}
          className={css.avatar}
        />

        <p className={css.name}>{firstName}</p>
      </Link>
    </li>
  );
}
