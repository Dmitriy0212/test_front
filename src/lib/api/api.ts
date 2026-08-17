import axios from "axios";

// Використовується serverApi.ts (виконується на сервері) — там немає браузерного
// origin, щоб дорезолвити відносний шлях, тому baseURL має бути абсолютним.
// Відносний "/api" — для браузера, він лежить окремо в browserApi.ts.
const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

export default client;
