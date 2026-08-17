import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile — Harmoniq",
  description: "Manage your published and saved articles on Harmoniq.",
};

// Весь UI сторінки (шапка, таби, слоти) рендерить layout.tsx — тут лише
// метадані для маршруту /profile, як того вимагає базове ТЗ.
export default function ProfilePage() {
  return null;
}
