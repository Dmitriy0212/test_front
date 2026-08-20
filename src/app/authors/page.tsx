import { Metadata } from "next";
import AuthorsList from "@/components/AuthorsList/AuthorsList";
import css from "./page.module.css";

export const metadata: Metadata = {
  title: "Creators — Harmoniq",
  description: "Browse authors publishing on Harmoniq.",
};

export default function AuthorsPage() {
  return (
    <main>
      <AuthorsList />
    </main>
  );
}
