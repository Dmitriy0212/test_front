import { getSavedArticles, getUserInfo } from "@/lib/api/clientApi";
import type { Article } from "@/types/article";

export type SavedArticlesWithAuthors = {
  articles: Article[];
  authorNames: Record<string, string>;
};

export function savedArticlesQueryKey(currentUserId: string | undefined) {
  return ["saved-articles-full", currentUserId] as const;
}

export async function fetchSavedArticlesWithAuthors(): Promise<SavedArticlesWithAuthors> {
  const articles = await getSavedArticles();

  const embeddedAuthorEntries = articles.flatMap((article) =>
    article.ownerId === null || typeof article.ownerId === "string"
      ? []
      : ([[article.ownerId._id, article.ownerId.name]] as const),
  );
  const ownerIdsToResolve = [
    ...new Set(
      articles.flatMap((article) => (typeof article.ownerId === "string" ? [article.ownerId] : [])),
    ),
  ];
  const fetchedAuthorEntries = await Promise.all(
    ownerIdsToResolve.map(async (ownerId) => {
      try {
        const author = await getUserInfo(ownerId);
        return [ownerId, author.name] as const;
      } catch {
        return [ownerId, "Unknown author"] as const;
      }
    }),
  );

  return {
    articles,
    authorNames: Object.fromEntries([...embeddedAuthorEntries, ...fetchedAuthorEntries]),
  };
}
