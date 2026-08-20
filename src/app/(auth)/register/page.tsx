import { Metadata } from "next";
import { RegisterForm } from "@/components/RegisterForm/RegisterForm";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Register — Harmoniq",
  description: "Create a Harmoniq account and join the community.",
};

export default function RegisterPage() {
  return (
    <div className={css.page}>
      <RegisterForm />
    </div>
  );
}
