'use client';

import css from './AddArticleForm.module.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createArticle, updateArticle } from '@/lib/api/clientApi';
import { createArticleSchema } from '@/lib/validation/createArticleSchema';
import { ArticleImagePicker } from '../ArticleImagePicker/ArticleImagePicker';
import { useArticleDraftStore } from '@/lib/store/articleDraftStore';
import { updateArticleSchema } from '@/lib/validation/updateArticleSchema';
import { Article, CreateArticleRequest, UpdateArticleRequest } from '@/types/article';

type FormValues = {
  title: string;
  article: string;
  img: File | null;
};

type Props = {
  article?: Article;
};

export default function AddArticleForm({
  article,
}: Props) {
  const router = useRouter();
  const { draft, setDraft, clearDraft } =
  useArticleDraftStore();

  const createMutation = useMutation({
    mutationFn: createArticle,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateArticleRequest) =>
      updateArticle(article!._id, payload),
  });


  const isEdit = !!article;

  const initialValues: FormValues = {
  title: article?.title ?? draft.title,
  article: article?.article ?? draft.article,
  img: null,
};

  const handleSubmit = async (
  values: FormValues,
  { setSubmitting }: { setSubmitting: (value: boolean) => void }
) => {
  try {
    if (!isEdit) {
      const payload: CreateArticleRequest = {
        title: values.title,
        article: values.article,
        img: values.img as File,
      };

      const createdArticle =
        await createMutation.mutateAsync(payload);

      toast.success('Article created successfully');

      clearDraft();

      router.push(`/articles/${createdArticle._id}`);

      return;
    }
    const payload: UpdateArticleRequest = {};

    if (values.title !== article.title) {
      payload.title = values.title;
    }

    if (values.article !== article.article) {
      payload.article = values.article;
    }

    if (values.img) {
      payload.img = values.img;
    }

    const updatedArticle =
      await updateMutation.mutateAsync(payload);

    toast.success('Article updated successfully');

    router.push(`/articles/${updatedArticle._id}`);
  } catch {
    toast.error('Operation failed');
  } finally {
    setSubmitting(false);
  }
  };
  
  const validationSchema = isEdit
  ? updateArticleSchema
  : createArticleSchema;

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        setFieldValue,
        isSubmitting,
        handleChange,
      }) => (
        <Form className={css.form}>
          <div className={css.content}>
            <div className={css.imageBlock}>
              <ArticleImagePicker
                file={values.img}
                imageUrl={article?.img}
                onChange={(file) => setFieldValue('img', file)}
              />
              <ErrorMessage
                name="img"
                component="p"
                className={css.error}
              />
            </div>

            <div className={css.leftSide}>
              <div className={css.field}>
                <label htmlFor="title" className={css.label}>
                  Title
                </label>

                <Field
                   id="title"
                   name="title"
                   as="textarea"
                   placeholder="Enter the title"
                   className={css.title}
                   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                   handleChange(e);

                   if (!isEdit) {
                      setDraft({
                      title: e.target.value,
                      article: values.article,
                   });
                 }
                }}
                 />

                <ErrorMessage
                  name="title"
                  component="p"
                  className={css.error}
                />
              </div>

              <div className={css.field}>
                <Field
                  as="textarea"
                  id="article"
                  name="article"
                  rows={12}
                  placeholder="Enter a text"
                  className={css.textarea}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  handleChange(e);

                  if (!isEdit) {
                    setDraft({
                    title: values.title,
                    article: e.target.value,
                  });
                  }
                }}
                />

                <ErrorMessage
                  name="article"
                  component="p"
                  className={css.error}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={css.submitButton}
            disabled={
  isSubmitting ||
  createMutation.isPending ||
  updateMutation.isPending
}
          >
{
  createMutation.isPending ||
  updateMutation.isPending
    ? 'Publishing...'
    : 'Publish Article'
}          </button>
        </Form>
      )}
    </Formik>
  );
}