import css from "./Pagination.module.css";

interface PaginationProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export default function Pagination({ hasMore, isLoading, onLoadMore }: PaginationProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <button
      type="button"
      className={css.button}
      disabled={isLoading}
      aria-busy={isLoading}
      onClick={onLoadMore}
    >
      {isLoading ? "Loading..." : "Load More"}
    </button>
  );
}
