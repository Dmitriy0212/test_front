import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

// Ті самі defaultOptions, що й у TanStackProvider.tsx — інакше сервер і
// клієнт гідрують кеш з різною поведінкою рефетчу для тих самих ключів
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          refetchOnWindowFocus: false,
        },
      },
    }),
);

export default getQueryClient;
