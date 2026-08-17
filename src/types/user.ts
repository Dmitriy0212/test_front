// Публічний профіль (GET /api/users/:id) — саме те, що бекенд реально повертає
export type User = {
  _id: string;
  name: string;
  avatarUrl: string | null;
  articlesAmount: number;
};

// Відповідь register/login — форма трохи інша (id, а не _id), так вже влаштовано на бекенді
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type GetMeResponse = {
  success: boolean;
  data: {
    user: AuthUser;
  };
};
