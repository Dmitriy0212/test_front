"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import AuthorsItem from "@/components/AuthorsItem/AuthorsItem";
import Loader from "@/components/Loader/Loader";
import Pagination from "@/components/Pagination/Pagination";
import { getUsers } from "@/lib/api/clientApi";
import css from "./AuthorsList.module.css";

const USERS_PER_PAGE = 20;

export default function AuthorsList() {
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pendingScrollPageRef = useRef<number | null>(null);

  const { data, error, isError, isFetching, isPending } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers({ page, perPage: USERS_PER_PAGE }),
  });

  const authors = data?.users ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Scroll only once the requested page's data has actually landed (not while
  // `isFetching`), otherwise scrollIntoView targets a scroll height computed
  // from the still-old (usually longer) list and can undershoot after the
  // shorter page renders in.
  useEffect(() => {
    if (pendingScrollPageRef.current === null || pendingScrollPageRef.current !== page) {
      return;
    }

    if (isFetching) {
      return;
    }

    pendingScrollPageRef.current = null;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [page, isFetching]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) {
      return;
    }

    pendingScrollPageRef.current = nextPage;
    setPage(nextPage);
  };

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return <p>{error instanceof Error ? error.message : "Failed to load authors."}</p>;
  }

  if (!authors.length) {
    return <p>No authors found.</p>;
  }

  return (
    <div ref={sectionRef} className={`container ${css.content}`} aria-busy={isFetching}>
      <h2 className={css.title}>Authors</h2>

      <ul className={css.list}>
        {authors.map((user) => (
          <AuthorsItem key={user._id} author={user} />
        ))}
      </ul>

      <Pagination pageCount={totalPages} currentPage={page} onPageChange={handlePageChange} />
    </div>
  );
}
