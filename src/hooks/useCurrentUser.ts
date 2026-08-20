import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/lib/api/clientApi";
import type { AuthUser } from "@/types/user";


async function fetchCurrentUser(): Promise<AuthUser> {
  const rawUser = await getMe();
  const rawUserWithMongoId = rawUser as AuthUser & { _id?: string };
  return { ...rawUser, id: rawUserWithMongoId.id ?? rawUserWithMongoId._id ?? "" };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    retry: false,
  });
}

export function useCurrentUserId(): string | undefined {
  const { data } = useCurrentUser();
  return data?.id || undefined;
}
