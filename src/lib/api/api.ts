import axios from "axios";

// Використовується serverApi.ts (виконується на сервері) — там немає браузерного
// origin, щоб дорезолвити відносний шлях, тому baseURL має бути абсолютним.
// Відносний "/api" — для браузера, він лежить окремо в browserApi.ts.
//
// API_URL, не NEXT_PUBLIC_API_URL: цей файл виконується лише на сервері,
// а префікс NEXT_PUBLIC_ інлайнить значення в клієнтський бандл — це б
// злило адресу бекенду в браузер і звело нанівець сенс BFF-проксі
const client = axios.create({
  baseURL: `${process.env.API_URL}/api`,
  // withCredentials тут ні на що не впливає — це серверний інстанс, у Node
  // немає браузерного cookie-jar, cookie й так передаються вручну через
  // authHeaders() у serverApi.ts/proxyRequest.ts
  timeout: 10_000,
});

export default client;
