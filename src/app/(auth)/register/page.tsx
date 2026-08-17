import { RegisterForm } from "@/components/RegisterForm/RegisterForm";
import css from "./page.module.css";

export default function RegisterPage() {
  return (
    <div className={css.page}>
      <RegisterForm />
    </div>
  );
}
