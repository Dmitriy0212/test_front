"use client";
import Link from "next/link";
import css from "./Footer.module.css";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../lib/store/authStore";
export default function Footer() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getLinkClass = (path: string) => {
    return pathname === path ? `${css.navigationLink} ${css.active}` : css.navigationLink;
  };
  return (
    <footer className={css.footer}>
      <div className={`container ${css.wrap}`}>
        <Link title="Home page" href="/" className={css.footerLink} aria-label="Home">
          <svg className={css.logoIcon}>
            <use href="/sprite.svg#iconlogo" />
          </svg>
        </Link>
        <p className={css.copyright}>
          &copy; {new Date().getFullYear()} Harmoniq. All rights reserved.
        </p>

        <ul className={css.navigation}>
          <li className={css.navigationItem}>
            <Link title="Articles page" href="/articles" className={getLinkClass("/articles")}>
              Articles
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className={css.navigationItemDesc}>
                <Link
                  title="My Profile page"
                  href="/profile"
                  prefetch={false}
                  className={getLinkClass("/profile")}
                >
                  Account
                </Link>
              </li>
            </>
          ) : (
            <></>
          )}
        </ul>
      </div>
    </footer>
  );
}
