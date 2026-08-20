import { Metadata } from "next";
import AddArticleForm from "@/components/AddArticleForm/AddArticleForm";
import { getArticleById } from "@/lib/api/serverApi";
import { getCurrentUserServer } from "@/app/(private)/profile/getCurrentUserServer";
import { notFound } from 'next/navigation';
import { AxiosError } from 'axios';


type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit article — Harmoniq",
  description: "Edit your article on Harmoniq.",
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

  // FE-43: без цього анонім чи будь-який залогінений юзер бачив повністю
  // заповнену форму редагування чужої статті (бекенд захищає лише сам сабміт)
  const ownerId =
    typeof article.ownerId === "string" ? article.ownerId : article.ownerId?._id;
  const currentUser = await getCurrentUserServer();

  if (!currentUser || currentUser.id !== ownerId) {
    notFound();
  }

  return (
    <div className="container">
      <h2>Edit article</h2>
      <AddArticleForm article={article} />
    </div>
  );
}