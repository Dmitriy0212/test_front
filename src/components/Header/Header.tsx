"use client";

import Link from "next/link";
import css from "./Header.module.css";

import { useAuthStore } from "../../lib/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import HeaderUserBar from "./HeaderUserBar/HeaderUserBar";

import { useEffect, useState } from "react";
import NavigationItem from "./NavigationItem/NavigationItem";

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const getLinkClass = (path: string) => {
    return pathname === path ? `${css.navigationLink} ${css.active}` : css.navigationLink;
  };

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1439) {
        setIsOpen(false);

        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";

        return;
      }

      if (isOpen) {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      } else {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBurger = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`${css.header} ${isOpen ? css.headerFixed : ""}`}
        data-scroll-behavior="smooth"
      >
        <div className={`container ${css.headerWrapper}`}>
          <Link
            title="Home page"
            onClick={() => setIsOpen(false)}
            href="/"
            className={css.headerLink}
            aria-label="Home"
          >
            <svg className={css.logoIcon}>
              <use href="/sprite.svg#iconlogo" />
            </svg>
          </Link>
          <div className={css.navigationDescFild}>
            <nav aria-label="Main Navigation">
              <ul className={css.navigationDesc}>
                <NavigationItem
                  setIsOpen={setIsOpen}
                  className="navigationItemDesc"
                  getLinkClass={getLinkClass}
                />

                {isAuthenticated ? (
                  <>
                    <li className={css.navigationItemDesc}>
                      <Link
                        title="My Profile page"
                        onClick={() => setIsOpen(false)}
                        href="/profile"
                        prefetch={false}
                        className={getLinkClass("/profile")}
                      >
                        My Profile
                      </Link>
                    </li>

                    <li className={css.navigationItem}>
                      <Link
                        title="Create an article page"
                        onClick={() => setIsOpen(false)}
                        href="/articles/create"
                        prefetch={false}
                        className={css.navigationLinkJoinDesc}
                      >
                        Create an article
                      </Link>
                    </li>

                    <HeaderUserBar user={user || null} className="userFieldDesc" />
                  </>
                ) : (
                  <>
                    <li className={css.navigationItemDesc}>
                      <Link
                        title="Log in page"
                        onClick={() => setIsOpen(false)}
                        href="/login"
                        prefetch={false}
                        className={getLinkClass("/login")}
                      >
                        Log in
                      </Link>
                    </li>

                    <li className={css.navigationItem}>
                      <Link
                        title="Register page"
                        onClick={() => setIsOpen(false)}
                        href="/register"
                        prefetch={false}
                        className={css.navigationLinkJoinDesc}
                      >
                        Join now
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
            <div>
              <button className={css.navBarMobButton} type="button" onClick={handleBurger}>
                {isOpen ? (
                  <>
                    <svg width="32" height="32">
                      <use href="/sprite.svg#iconcontrolsclose" />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg width="32" height="32">
                      <use href="/sprite.svg#icongenericburgerregular" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className={isOpen ? `${css.navBarMob} ${css.isOpen}` : css.navBarMob}>
        <nav aria-label="Main Navigation">
          <ul className={css.navigation}>
            <NavigationItem
              setIsOpen={setIsOpen}
              className="navigationItem"
              getLinkClass={getLinkClass}
            />
            {isAuthenticated ? (
              <>
                <li className={css.navigationItem}>
                  <Link
                    title="My Profile page"
                    onClick={() => setIsOpen(false)}
                    href="/profile"
                    prefetch={false}
                    className={getLinkClass("/profile")}
                  >
                    My Profile
                  </Link>
                </li>

                <li className={css.navigationItemCriate}>
                  <Link
                    title="Create an article page"
                    onClick={() => setIsOpen(false)}
                    href="/articles/create"
                    prefetch={false}
                    className={css.navigationLinkJoin}
                  >
                    Create an article
                  </Link>
                </li>

                <HeaderUserBar user={user || null} className="userField" />
              </>
            ) : (
              <>
                <li className={css.navigationItem}>
                  <Link
                    title="Log in page"
                    onClick={() => setIsOpen(false)}
                    href="/login"
                    prefetch={false}
                    className={getLinkClass("/login")}
                  >
                    Log in
                  </Link>
                </li>

                <li className={css.navigationItem}>
                  <Link
                    title="Register page"
                    onClick={() => setIsOpen(false)}
                    href="/register"
                    prefetch={false}
                    className={css.navigationLinkJoin}
                  >
                    Join now
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}
