import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Comment {
  id: string;
  parentId?: string;
  author: string;
  body: string;
  timestamp: number;
  likes: number;
  userLiked: boolean;
}

interface CommentState {
  tipComments: Record<number, Comment[]>;
  articleComments: Record<string, Comment[]>;
  addComment: (key: string, type: 'tip' | 'article', comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  likeComment: (key: string, type: 'tip' | 'article', commentId: string) => void;
}

let commentId = Date.now();

export const useCommentStore = create<CommentState>()(
  persist(
    (set) => ({
      tipComments: {},
      articleComments: {},

      addComment: (key, type, comment) => {
        const newComment: Comment = {
          ...comment,
          id: `c-${commentId++}`,
          timestamp: Date.now(),
        };
        set((s) => {
          if (type === 'tip') {
            const numKey = Number(key);
            return { tipComments: { ...s.tipComments, [numKey]: [...(s.tipComments[numKey] || []), newComment] } };
          }
          return { articleComments: { ...s.articleComments, [key]: [...(s.articleComments[key] || []), newComment] } };
        });
      },

      likeComment: (key, type, commentId) => {
        set((s) => {
          const toggleLike = (comments: Comment[]) =>
            comments.map((c) =>
              c.id === commentId
                ? { ...c, likes: c.userLiked ? c.likes - 1 : c.likes + 1, userLiked: !c.userLiked }
                : c
            );

          if (type === 'tip') {
            const numKey = Number(key);
            return { tipComments: { ...s.tipComments, [numKey]: toggleLike(s.tipComments[numKey] || []) } };
          }
          return { articleComments: { ...s.articleComments, [key]: toggleLike(s.articleComments[key] || []) } };
        });
      },
    }),
    {
      name: 'comments-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
