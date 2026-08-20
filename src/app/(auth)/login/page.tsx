import { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm/LoginForm";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Log in — Harmoniq",
  description: "Log in to your Harmoniq account.",
};

export default function LoginPage() {
  return (
    <div className={css.page}>
      <LoginForm />
    </div>
  );
}
