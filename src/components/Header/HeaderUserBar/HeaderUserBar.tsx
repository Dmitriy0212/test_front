"use client";
import Image from "next/image";
import css from "../Header.module.css";
import type { AuthUser } from "@/types/user";
import Link from "next/link";
type UserBarProps = {
  user: AuthUser | null;

  className: string;
};

export default function HeaderUserBar({ user, className }: UserBarProps) {
  return (
    <li className={css[className]}>
      <div className={css.userFieldFirst}>
        <div>
          <Image
            className={css.userAvatar}
            src={user?.avatarUrl || "/default-avatar.png"}
            width={40}
            height={40}
            alt={user?.name || "User avatar"}
          />
        </div>

        <p className={css.userName}>{user?.name}</p>
      </div>

      <Link href="/logoutUser/" className={css.userLogout} title="User logout">
        <svg width="15" height="15">
          <use href="/sprite.svg#icongenericlogout" />
        </svg>
      </Link>
    </li>
  );
}
