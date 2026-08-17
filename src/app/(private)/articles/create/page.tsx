import AddArticleForm from "@/components/AddArticleForm/AddArticleForm";
import css from './page.module.css';

export default function CreateArticlePage() {
  return (
    <div className="container">
      <h2 className={css.title}>Create an article</h2>
      <AddArticleForm/>
   </div>
  );
}
