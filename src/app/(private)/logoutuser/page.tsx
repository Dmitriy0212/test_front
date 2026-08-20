import { redirect } from 'next/navigation';
import { logoutServer } from '@/lib/api/serverApi';

// Спрацьовує лише коли @modal/(.)logoutUser (клієнтський перехоплюючий
// роут) не встиг — прямий заход на URL, ручне оновлення сторінки саме тут,
// або старе посилання з неправильним регістром. Без реального виклику
// logout сесія лишалась живою в базі: /auth/session і далі відповідав би
// {success: true} після редіректу.
export default async function LogoutUserPage() {
  try {
    await logoutServer();
  } catch {
    // сесії вже могло не бути (протухла, чи юзер сюди й так не мав доступу) —
    // редіректимо в будь-якому разі, це не привід показувати помилку
  }

  redirect('/');
}
