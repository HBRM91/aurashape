import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  category: 'Fasting' | 'Progress' | 'Nutrition' | 'Workouts' | 'Recipe' | 'General';
  createdAt: string;
  liked: boolean;
}

export interface ThreadReply {
  id: string;
  threadId: string;
  parentId?: string;
  author: string;
  body: string;
  createdAt: string;
  upvotes: number;
  userVote: 1 | -1 | 0;
}

export interface ChallengeEntry {
  challengeId: string;
  joinedAt: string;
  progress: number;
}

export interface SubmittedRecipe {
  id: string;
  name: string;
  description: string;
  photoUri?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  author: string;
  tags: string[];
  createdAt: string;
  likes: number;
  userLiked: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  goal: string;
  memberSince: string;
  streak: number;
  workoutsPerMonth: number;
  goalProgress: number;
  privacyLevel: 'everyone' | 'community' | 'nobody';
  showWeight: 'goal_pct' | 'no';
  showWorkouts: boolean;
}

interface CommunityState {
  threads: ForumThread[];
  threadReplies: Record<string, ThreadReply[]>;
  savedRecipes: string[];
  joinedChallenges: ChallengeEntry[];
  submittedRecipes: SubmittedRecipe[];
  userProfiles: Record<string, UserProfile>;
  addThread: (thread: Omit<ForumThread, 'id' | 'createdAt' | 'liked'>) => void;
  removeThread: (id: string) => void;
  likeThread: (id: string) => void;
  addReply: (threadId: string, body: string, parentId?: string) => void;
  voteReply: (threadId: string, replyId: string, vote: 1 | -1) => void;
  submitRecipe: (recipe: Omit<SubmittedRecipe, 'id' | 'createdAt' | 'author' | 'likes' | 'userLiked'>) => void;
  likeSubmittedRecipe: (id: string) => void;
  removeSubmittedRecipe: (id: string) => void;
  toggleSaveRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
  joinChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  leaveChallenge: (challengeId: string) => void;
  getThreadsByCategory: (category: ForumThread['category']) => ForumThread[];
  getReplies: (threadId: string) => ThreadReply[];
}

let threadId = Date.now();
let replyId = Date.now();
let recipeId = Date.now();

const DEFAULT_THREADS: ForumThread[] = [
  {
    id: 't1', title: 'What do you break your fast with?', author: 'AnnaK',
    content: 'I usually go with eggs and avocado. Looking for more ideas!',
    replies: 2, category: 'Fasting', createdAt: new Date(Date.now() - 7200000).toISOString(), liked: false,
  },
  {
    id: 't2', title: 'My 3-month body recomp results (with photos)', author: 'MaxFit',
    content: 'Down 8kg and visible muscle definition. Consistency is key!',
    replies: 1, category: 'Progress', createdAt: new Date(Date.now() - 18000000).toISOString(), liked: false,
  },
  {
    id: 't3', title: 'Best protein sources for vegans?', author: 'PlantPower',
    content: 'Looking to hit 120g protein on a plant-based diet. Any tips?',
    replies: 2, category: 'Nutrition', createdAt: new Date(Date.now() - 86400000).toISOString(), liked: false,
  },
  {
    id: 't4', title: 'Push-up progression: from 0 to 50', author: 'NewbieLifter',
    content: 'Sharing my 12-week progression plan that actually worked!',
    replies: 1, category: 'Workouts', createdAt: new Date(Date.now() - 172800000).toISOString(), liked: false,
  },
  {
    id: 't5', title: 'Meal prep Sunday — share your recipes!', author: 'ChefHealth',
    content: 'Post your favorite meal prep recipes below!',
    replies: 1, category: 'Nutrition', createdAt: new Date(Date.now() - 259200000).toISOString(), liked: false,
  },
];

const DEFAULT_REPLIES: Record<string, ThreadReply[]> = {
  t1: [
    { id: 'r1', threadId: 't1', author: 'MaxFit', body: 'Eggs and avocado is my go-to too! Sometimes I add smoked salmon for extra protein.', createdAt: new Date(Date.now() - 6000000).toISOString(), upvotes: 5, userVote: 0 },
    { id: 'r2', threadId: 't1', parentId: 'r1', author: 'AnnaK', body: 'Great idea! I will try that tomorrow.', createdAt: new Date(Date.now() - 5000000).toISOString(), upvotes: 2, userVote: 0 },
  ],
  t2: [
    { id: 'r3', threadId: 't2', author: 'PlantPower', body: 'Amazing results! What was your diet like?', createdAt: new Date(Date.now() - 15000000).toISOString(), upvotes: 8, userVote: 0 },
  ],
  t3: [
    { id: 'r4', threadId: 't3', author: 'ChefHealth', body: 'Lentils, chickpeas, tempeh, and a good plant protein powder. I hit 130g daily!', createdAt: new Date(Date.now() - 80000000).toISOString(), upvotes: 12, userVote: 0 },
    { id: 'r5', threadId: 't3', parentId: 'r4', author: 'PlantPower', body: 'Which protein powder do you recommend?', createdAt: new Date(Date.now() - 70000000).toISOString(), upvotes: 3, userVote: 0 },
  ],
  t4: [
    { id: 'r6', threadId: 't4', author: 'MaxFit', body: 'This plan helped me too! The wall-push-up progression was key.', createdAt: new Date(Date.now() - 150000000).toISOString(), upvotes: 6, userVote: 0 },
  ],
  t5: [
    { id: 'r7', threadId: 't5', author: 'AnnaK', body: 'My go-to meal prep: grilled chicken, roasted veggies, and quinoa. 45g protein per serving!', createdAt: new Date(Date.now() - 200000000).toISOString(), upvotes: 9, userVote: 0 },
  ],
};

const MOCK_PROFILES: Record<string, UserProfile> = {
  AnnaK: { id: 'p1', username: 'AnnaK', bio: 'Fasting enthusiast. Lost 12kg with 16:8.', goal: 'Maintain', memberSince: '2025-11-01', streak: 34, workoutsPerMonth: 12, goalProgress: 85, privacyLevel: 'community', showWeight: 'goal_pct', showWorkouts: true },
  MaxFit: { id: 'p2', username: 'MaxFit', bio: 'Body recomp journey. Science-based training.', goal: 'Build Muscle', memberSince: '2025-08-15', streak: 67, workoutsPerMonth: 20, goalProgress: 92, privacyLevel: 'community', showWeight: 'goal_pct', showWorkouts: true },
  PlantPower: { id: 'p3', username: 'PlantPower', bio: 'Vegan athlete. Proving plants build muscle.', goal: 'Build Muscle', memberSince: '2026-01-10', streak: 45, workoutsPerMonth: 16, goalProgress: 78, privacyLevel: 'community', showWeight: 'goal_pct', showWorkouts: true },
  NewbieLifter: { id: 'p4', username: 'NewbieLifter', bio: 'Starting my fitness journey at 35. Better late than never!', goal: 'Improve Health', memberSince: '2026-04-01', streak: 12, workoutsPerMonth: 8, goalProgress: 60, privacyLevel: 'everyone', showWeight: 'no', showWorkouts: true },
  ChefHealth: { id: 'p5', username: 'ChefHealth', bio: 'Meal prep master. Healthy food doesn"t have to be boring.', goal: 'Maintain', memberSince: '2025-06-20', streak: 89, workoutsPerMonth: 14, goalProgress: 95, privacyLevel: 'community', showWeight: 'goal_pct', showWorkouts: false },
};

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      threads: DEFAULT_THREADS,
      threadReplies: DEFAULT_REPLIES,
      savedRecipes: [],
      joinedChallenges: [],
      submittedRecipes: [],
      userProfiles: MOCK_PROFILES,

      addThread: (thread) =>
        set((s) => {
          track('thread_created', { category: thread.category });
          return { threads: [{ ...thread, id: String(threadId++), createdAt: new Date().toISOString(), liked: false, replies: 0 }, ...s.threads] };
        }),

      removeThread: (id) =>
        set((s) => ({ threads: s.threads.filter((t) => t.id !== id) })),

      likeThread: (id) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === id ? { ...t, liked: !t.liked, replies: t.liked ? t.replies - 1 : t.replies + 1 } : t
          ),
        })),

      addReply: (threadId, body, parentId) => {
        const reply: ThreadReply = {
          id: String(replyId++),
          threadId,
          parentId,
          author: 'You',
          body,
          createdAt: new Date().toISOString(),
          upvotes: 0,
          userVote: 0,
        };
        set((s) => {
          const currentReplies = s.threadReplies[threadId] || [];
          const replyCount = currentReplies.filter((r) => !r.parentId).length + 1;
          return {
            threadReplies: { ...s.threadReplies, [threadId]: [...currentReplies, reply] },
            threads: s.threads.map((t) => t.id === threadId ? { ...t, replies: replyCount } : t),
          };
        });
      },

      voteReply: (threadId, replyId, vote) => {
        set((s) => {
          const currentReplies = s.threadReplies[threadId] || [];
          return {
            threadReplies: {
              ...s.threadReplies,
              [threadId]: currentReplies.map((r) => {
                if (r.id !== replyId) return r;
                const existingVote = r.userVote;
                const voteDelta = vote - existingVote;
                return {
                  ...r,
                  upvotes: r.upvotes + voteDelta,
                  userVote: existingVote === vote ? 0 : vote,
                };
              }),
            },
          };
        });
      },

      submitRecipe: (recipe) =>
        set((s) => {
          track('recipe_submitted', { name: recipe.name });
          return { submittedRecipes: [{
            ...recipe,
            id: String(recipeId++),
            author: 'You',
            createdAt: new Date().toISOString(),
            likes: 0,
            userLiked: false,
          }, ...s.submittedRecipes] };
        }),

      likeSubmittedRecipe: (id) =>
        set((s) => ({
          submittedRecipes: s.submittedRecipes.map((r) =>
            r.id === id ? { ...r, likes: r.userLiked ? r.likes - 1 : r.likes + 1, userLiked: !r.userLiked } : r
          ),
        })),

      removeSubmittedRecipe: (id) =>
        set((s) => ({ submittedRecipes: s.submittedRecipes.filter((r) => r.id !== id) })),

      toggleSaveRecipe: (recipeId) =>
        set((s) => ({
          savedRecipes: s.savedRecipes.includes(recipeId)
            ? s.savedRecipes.filter((id) => id !== recipeId)
            : [...s.savedRecipes, recipeId],
        })),

      isRecipeSaved: (recipeId) => get().savedRecipes.includes(recipeId),

      joinChallenge: (challengeId) =>
        set((s) => {
          if (s.joinedChallenges.some((c) => c.challengeId === challengeId)) return s;
          track('challenge_joined', { challengeId });
          try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}
          return { joinedChallenges: [...s.joinedChallenges, { challengeId, joinedAt: new Date().toISOString(), progress: 0 }] };
        }),

      updateChallengeProgress: (challengeId, progress) =>
        set((s) => ({
          joinedChallenges: s.joinedChallenges.map((c) =>
            c.challengeId === challengeId ? { ...c, progress: Math.min(100, progress) } : c
          ),
        })),

      leaveChallenge: (challengeId) =>
        set((s) => ({
          joinedChallenges: s.joinedChallenges.filter((c) => c.challengeId !== challengeId),
        })),

      getThreadsByCategory: (category) =>
        get().threads.filter((t) => t.category === category),

      getReplies: (threadId) => get().threadReplies[threadId] || [],
    }),
    {
      name: 'community-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
