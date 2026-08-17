import * as Yup from 'yup';

export const updateArticleSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must contain at least 3 characters')
    .max(48, 'Title must contain at most 48 characters')
    .required('Title is required'),

  article: Yup.string()
    .min(100, 'Article must contain at least 100 characters')
    .max(4000, 'Article must contain at most 4000 characters')
    .required('Article text is required'),

  img: Yup.mixed<File>()
    .nullable()
    .test(
      'fileSize',
      'Image size must not exceed 1 MB',
      (value) => {
        if (!value) return true;
        return value.size <= 1024 * 1024;
      }
    )
    .test(
      'fileType',
      'Only image files are allowed',
      (value) => {
        if (!value) return true;
        return value.type.startsWith('image/');
      }
    ),
});
