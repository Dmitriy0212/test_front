import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const browserApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

/**
 * Храним текущий refresh-запрос.
 *
 * Если одновременно несколько API-запросов получат 401,
 * refresh будет выполнен только один раз.
 */
let refreshPromise: Promise<boolean> | null = null;

const refreshSession = async (): Promise<boolean> => {
  // Refresh уже выполняется — просто ждём его.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post(
      "/api/auth/refresh",
      {},
      {
        withCredentials: true,
      },
    )
    .then((response) => {
      return response.status === 200;
    })
    .catch(() => {
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

browserApi.interceptors.response.use(
  // Обычный успешный response
  (response) => response,

  // Ошибка response
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    // Если config отсутствует — просто передаём ошибку дальше
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Нас интересует только 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Не допускаем бесконечный retry
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Refresh endpoint не должен сам запускать refresh
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /**
     * Access token истёк.
     *
     * Backend:
     * 1. проверит sessionId + refreshToken;
     * 2. удалит старую Session;
     * 3. создаст новую Session;
     * 4. установит новые cookies;
     * 5. вернёт 200.
     */
    const refreshed = await refreshSession();

    // Refresh token тоже недействителен
    if (!refreshed) {
      return Promise.reject(error);
    }

    /**
     * Cookies уже обновлены backend'ом.
     * Повторяем первоначальный запрос.
     */
    return browserApi(originalRequest);
  },
);

export default browserApi;
