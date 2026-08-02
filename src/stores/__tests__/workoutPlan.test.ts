import { useWorkoutPlanStore } from '@/src/stores/workoutPlan';

beforeEach(() => {
  useWorkoutPlanStore.setState({
    templates: useWorkoutPlanStore.getInitialState().templates,
  });
});

describe('Workout Plan Store', () => {
  describe('initial templates', () => {
    it('should have 5 default workout templates', () => {
      expect(useWorkoutPlanStore.getState().templates.length).toBeGreaterThanOrEqual(5);
    });

    it('should include push day template', () => {
      const push = useWorkoutPlanStore.getState().templates.find((t) => t.id === 't-push');
      expect(push).toBeDefined();
      expect(push!.name).toBe('Push Day');
      expect(push!.category).toBe('push');
    });

    it('should include pull day template', () => {
      const pull = useWorkoutPlanStore.getState().templates.find((t) => t.id === 't-pull');
      expect(pull).toBeDefined();
      expect(pull!.name).toBe('Pull Day');
    });

    it('should include legs day template', () => {
      const legs = useWorkoutPlanStore.getState().templates.find((t) => t.id === 't-legs');
      expect(legs).toBeDefined();
      expect(legs!.category).toBe('legs');
    });

    it('should have exercises in each template', () => {
      const templates = useWorkoutPlanStore.getState().templates;
      templates.forEach((t) => {
        expect(t.exercises.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getByCategory', () => {
    it('should filter templates by category', () => {
      const push = useWorkoutPlanStore.getState().getByCategory('push');
      push.forEach((t) => expect(t.category).toBe('push'));
    });

    it('should return empty for unknown category', () => {
      const result = useWorkoutPlanStore.getState().getByCategory('custom' as any);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('useTemplate', () => {
    it('should increment timesUsed', () => {
      useWorkoutPlanStore.getState().useTemplate('t-push');
      const template = useWorkoutPlanStore.getState().templates.find((t) => t.id === 't-push');
      expect(template!.timesUsed).toBe(1);
    });

    it('should set lastUsed date', () => {
      useWorkoutPlanStore.getState().useTemplate('t-pull');
      const template = useWorkoutPlanStore.getState().templates.find((t) => t.id === 't-pull');
      expect(template!.lastUsed).toBeDefined();
    });
  });

  describe('addTemplate', () => {
    it('should add a custom template', () => {
      useWorkoutPlanStore.getState().addTemplate({
        name: 'My Custom Workout',
        description: 'A test workout',
        exercises: [],
        category: 'custom',
        difficulty: 1,
        estimatedMinutes: 20,
      });

      const templates = useWorkoutPlanStore.getState().templates;
      const added = templates.find((t) => t.name === 'My Custom Workout');
      expect(added).toBeDefined();
      expect(added!.timesUsed).toBe(0);
    });
  });

  describe('removeTemplate', () => {
    it('should remove a template', () => {
      const initial = useWorkoutPlanStore.getState().templates.length;
      useWorkoutPlanStore.getState().removeTemplate('t-push');
      expect(useWorkoutPlanStore.getState().templates.length).toBe(initial - 1);
    });
  });

  describe('updateTemplate', () => {
    it('should update template properties', () => {
      useWorkoutPlanStore.getState().updateTemplate('t-push', { name: 'Chest & Shoulders' });
      const updated = useWorkoutPlanStore.getState().templates.find((t) => t.id === 't-push');
      expect(updated!.name).toBe('Chest & Shoulders');
    });
  });
});
