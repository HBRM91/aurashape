import {
  buildLocalCoachContext,
  getDailyRecommendations,
  getWeeklyRecommendation,
} from '../localCoach';
import { useDiaryStore } from '@/src/stores/diary';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useWaterStore } from '@/src/stores/water';
import { useWorkoutStore } from '@/src/stores/workout';
import { useFastingStore } from '@/src/stores/fasting';

const today = '2026-08-05';

beforeEach(() => {
  useOnboardingStore.setState({ calorieTarget: 2000, proteinTargetG: 100, carbsTargetG: 200, fatTargetG: 55 });
  useDiaryStore.setState({ selectedDate: today, entries: [], recentFoods: [], favoriteFoods: [] });
  useWaterStore.setState({ waterMl: {}, fruitCount: {}, vegCount: {} });
  useWorkoutStore.setState({ activeWorkout: null, history: [], personalRecords: {} });
  useFastingStore.setState({ currentPlan: '16:8', customHours: 16, activeSession: null, history: [] });
});

describe('local coach', () => {
  it('returns a safe no-data context without guessing', () => {
    const context = buildLocalCoachContext(today);

    expect(context).toEqual(expect.objectContaining({
      date: today,
      calories: { consumed: 0, target: 2000 },
      waterMl: { consumed: 0, target: 2000 },
      diaryDaysLogged: 0,
      workoutsCompleted: 0,
      fastingSessionsCompleted: 0,
      recentWorkoutEffort: 'unknown',
    }));
    expect(getDailyRecommendations(context)).toEqual([]);
  });

  it('creates a hydration nudge from local water data', () => {
    useWaterStore.setState({ waterMl: { [today]: 400 }, fruitCount: {}, vegCount: {} });

    const recommendations = getDailyRecommendations(buildLocalCoachContext(today));

    expect(recommendations).toEqual([
      expect.objectContaining({ category: 'hydration', confidence: 'high' }),
    ]);
  });

  it('suggests a weekly progression after comfortable local workouts', () => {
    const contexts = [1, 2, 3, 4, 5, 6, 7].map((offset) => ({
      ...buildLocalCoachContext(today),
      date: `2026-08-${String(5 - offset).padStart(2, '0')}`,
      workoutsCompleted: 1,
      recentWorkoutEffort: 'comfortable' as const,
    }));

    expect(getWeeklyRecommendation(contexts)).toEqual(expect.objectContaining({
      category: 'workout',
      confidence: 'medium',
    }));
  });
});
