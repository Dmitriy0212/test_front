import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ArticleDraft = {
  title: string;
  article: string;
};

type ArticleDraftStore = {
  draft: ArticleDraft;
  setDraft: (draft: ArticleDraft) => void;
  clearDraft: () => void;
};

const initialDraft: ArticleDraft = {
  title: '',
  article: '',
};

export const useArticleDraftStore =
  create<ArticleDraftStore>()(
    persist(
      (set) => ({
        draft: initialDraft,

        setDraft: (draft) =>
          set(() => ({ draft })),

        clearDraft: () =>
          set(() => ({ draft: initialDraft })),
      }),
      {
        name: 'article-draft',
        partialize: (state) => ({
          draft: state.draft,
        }),
      }
    )
  );