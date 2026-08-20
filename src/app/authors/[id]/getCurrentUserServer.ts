import { cookies } from "next/headers";

import type { AuthUser } from "@/types/user";
import api from "@/lib/api/api";

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
