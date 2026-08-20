import { Metadata } from "next";
import AddArticleForm from "@/components/AddArticleForm/AddArticleForm";
import css from './page.module.css';

export const metadata: Metadata = {
  title: "Create an article — Harmoniq",
  description: "Write and publish a new article on Harmoniq.",
};

export default function CreateArticlePage() {
  return (
    <div className="container">
      <h2 className={css.title}>Create an article</h2>
      <AddArticleForm/>
   </div>
  );
}
