import { cookies } from "next/headers";

import type { AuthUser } from "@/types/user";
import api from "@/lib/api/api";

// Наш локальний серверний хелпер (не чіпаємо serverApi.ts — там немає
// server-side еквіваленту getMe(), а він потрібен, щоб дізнатись поточного
// юзера ще на сервері й зробити безпечний редірект гостей + prefetch).
//
// ВАЖЛИВО: бекенд реально повертає ідентифікатор як "_id" (стандарт MongoDB),
// а тип AuthUser (types/user.ts, спільний) декларує поле "id" — це розбіжність
// типу й реального рантайму (перевірено через Network tab: GET /users/me
// повертає { "_id": "...", ... }, а не { "id": "..." }). Тому не довіряємо
// заявленому типу сліпо і читаємо "_id" з сирої відповіді напряму.
type RawMeResponse = {
  success: boolean;
  data: {
    user: AuthUser & { _id?: string };
  };
};

export async function getCurrentUserServer(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  try {
    const { data } = await api.get<RawMeResponse>("/users/me", { headers: { Cookie: cookie } });
    const rawUser = data.data.user;
    const id = rawUser._id ?? rawUser.id;

    if (!id) {
      return null;
    }

    return { ...rawUser, id };
  } catch {
    return null;
  }
}
