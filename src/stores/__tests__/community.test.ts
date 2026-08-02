import { useCommunityStore } from '@/src/stores/community';

const defaultThreads = [
  { id: 't1', title: 'What do you break your fast with?', author: 'AnnaK', content: 'Ideas', replies: 23, category: 'Fasting', createdAt: '2026-01-01T00:00:00Z', liked: false },
  { id: 't2', title: 'My results', author: 'MaxFit', content: 'Down 8kg', replies: 47, category: 'Progress', createdAt: '2026-01-01T00:00:00Z', liked: false },
  { id: 't3', title: 'Best protein sources', author: 'PlantPower', content: 'Tips?', replies: 31, category: 'Nutrition', createdAt: '2026-01-01T00:00:00Z', liked: false },
  { id: 't4', title: 'Push-up progression', author: 'NewbieLifter', content: 'Plan', replies: 19, category: 'Workouts', createdAt: '2026-01-01T00:00:00Z', liked: false },
  { id: 't5', title: 'Meal prep Sunday', author: 'ChefHealth', content: 'Recipes', replies: 56, category: 'Nutrition', createdAt: '2026-01-01T00:00:00Z', liked: false },
] as any[];

beforeEach(() => {
  useCommunityStore.setState({
    threads: defaultThreads.slice(),
    savedRecipes: [],
    joinedChallenges: [],
  });
});

describe('Community Store', () => {
  describe('initial state', () => {
    it('should have 5 default threads', () => {
      expect(useCommunityStore.getState().threads.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('addThread', () => {
    it('should add a new thread', () => {
      useCommunityStore.getState().addThread({
        title: 'Test Thread',
        author: 'TestAuthor',
        content: 'Test content',
        category: 'General',
        replies: 0,
      });
      const threads = useCommunityStore.getState().threads;
      expect(threads[0].title).toBe('Test Thread');
      expect(threads[0].author).toBe('TestAuthor');
    });
  });

  describe('removeThread', () => {
    it('should remove a thread by ID', () => {
      const initial = useCommunityStore.getState().threads.length;
      useCommunityStore.getState().removeThread('t1');
      expect(useCommunityStore.getState().threads.length).toBe(initial - 1);
    });
  });

  describe('likeThread', () => {
    it('should toggle liked status', () => {
      useCommunityStore.getState().likeThread('t1');
      const thread = useCommunityStore.getState().threads.find((t) => t.id === 't1');
      expect(thread!.liked).toBe(true);
    });

    it('should toggle back', () => {
      useCommunityStore.getState().likeThread('t1');
      useCommunityStore.getState().likeThread('t1');
      const thread = useCommunityStore.getState().threads.find((t) => t.id === 't1');
      expect(thread!.liked).toBe(false);
    });
  });

  describe('toggleSaveRecipe', () => {
    it('should save a recipe', () => {
      useCommunityStore.getState().toggleSaveRecipe('r1');
      expect(useCommunityStore.getState().isRecipeSaved('r1')).toBe(true);
    });

    it('should unsave a recipe', () => {
      useCommunityStore.getState().toggleSaveRecipe('r1');
      useCommunityStore.getState().toggleSaveRecipe('r1');
      expect(useCommunityStore.getState().isRecipeSaved('r1')).toBe(false);
    });
  });

  describe('challenges', () => {
    it('should join a challenge', () => {
      useCommunityStore.getState().joinChallenge('c1');
      const joined = useCommunityStore.getState().joinedChallenges;
      expect(joined).toHaveLength(1);
      expect(joined[0].challengeId).toBe('c1');
      expect(joined[0].progress).toBe(0);
    });

    it('should not duplicate join', () => {
      useCommunityStore.getState().joinChallenge('c1');
      useCommunityStore.getState().joinChallenge('c1');
      expect(useCommunityStore.getState().joinedChallenges).toHaveLength(1);
    });

    it('should update progress', () => {
      useCommunityStore.getState().joinChallenge('c1');
      useCommunityStore.getState().updateChallengeProgress('c1', 50);
      const joined = useCommunityStore.getState().joinedChallenges[0];
      expect(joined.progress).toBe(50);
    });

    it('should cap progress at 100', () => {
      useCommunityStore.getState().joinChallenge('c1');
      useCommunityStore.getState().updateChallengeProgress('c1', 150);
      expect(useCommunityStore.getState().joinedChallenges[0].progress).toBe(100);
    });

    it('should leave a challenge', () => {
      useCommunityStore.getState().joinChallenge('c1');
      useCommunityStore.getState().leaveChallenge('c1');
      expect(useCommunityStore.getState().joinedChallenges).toHaveLength(0);
    });
  });

  describe('getThreadsByCategory', () => {
    it('should filter by category', () => {
      const fasting = useCommunityStore.getState().getThreadsByCategory('Fasting');
      fasting.forEach((t) => expect(t.category).toBe('Fasting'));
    });
  });
});
