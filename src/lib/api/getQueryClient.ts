import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

// React.cache() гарантує, що в межах одного серверного рендеру (одного запиту)
// всі виклики getQueryClient() поверне той самий інстанс, а між різними запитами
// користувачів інстанси не перетинаються (на відміну від module-level singleton).
const getQueryClient = cache(() => new QueryClient());

export default getQueryClient;
