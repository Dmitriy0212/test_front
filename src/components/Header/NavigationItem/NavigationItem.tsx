"use client";
import Image from "next/image";
import css from "../Header.module.css";
import type { AuthUser } from "@/types/user";
import Link from "next/link";
type NavigationItemProps = {
  setIsOpen: (isOpen: boolean) => void;
  className: string;
  getLinkClass: (path: string) => string;
};

export default function NavigationItem({
  setIsOpen,
  className,
  getLinkClass,
}: NavigationItemProps) {
  return (
    <>
      <li className={css[className]}>
        <Link
          title="Home page"
          onClick={() => setIsOpen(false)}
          href="/"
          className={getLinkClass("/")}
        >
          Home
        </Link>
      </li>

      <li className={css[className]}>
        <Link
          title="Articles page"
          onClick={() => setIsOpen(false)}
          href="/articles"
          className={getLinkClass("/articles")}
        >
          Articles
        </Link>
      </li>

      <li className={css[className]}>
        <Link
          title="Creators page"
          onClick={() => setIsOpen(false)}
          href="/authors"
          className={getLinkClass("/authors")}
        >
          Creators
        </Link>
      </li>
    </>
  );
}
