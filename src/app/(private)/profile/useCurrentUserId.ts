// Раніше тут була повна копія src/hooks/useCurrentUser.ts (без retry: false,
// тож гості на цих запитах ловили дефолтні 3 ретраї на 401). Профіль і так
// захищений серверним редіректом, тож ризик був низький, але дублювати
// одну й ту саму логіку у двох місцях не було сенсу.
export { useCurrentUser, useCurrentUserId } from "@/hooks/useCurrentUser";
