import AddArticleForm from "@/components/AddArticleForm/AddArticleForm";
import { getArticleById } from "@/lib/api/serverApi";
import { notFound } from 'next/navigation';
import { AxiosError } from 'axios';


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({
  params,
}: Props) {
  const { id } = await params;

  let article;

  try {
    article = await getArticleById(id);
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="container">
      <h2>Edit article</h2>
      <AddArticleForm article={article} />
    </div>
  );
}