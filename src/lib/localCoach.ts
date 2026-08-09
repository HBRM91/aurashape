import { useDiaryStore } from '@/src/stores/diary';
import { useFastingStore } from '@/src/stores/fasting';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useWaterStore } from '@/src/stores/water';
import { useWorkoutStore } from '@/src/stores/workout';

export interface LocalCoachContext {
  date: string;
  calories: { consumed: number; target: number };
  waterMl: { consumed: number; target: number };
  diaryDaysLogged: number;
  workoutsCompleted: number;
  fastingSessionsCompleted: number;
  recentWorkoutEffort: 'comfortable' | 'mixed' | 'hard' | 'unknown';
}

export interface LocalRecommendation {
  id: string;
  category: 'nutrition' | 'hydration' | 'workout' | 'fasting' | 'recovery';
  title: string;
  action: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

function recentDates(date: string): string[] {
  const end = new Date(`${date}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(end);
    current.setDate(end.getDate() - index);
    return current.toISOString().slice(0, 10);
  });
}

function workoutEffort(date: string): LocalCoachContext['recentWorkoutEffort'] {
  const cutoff = new Date(`${date}T00:00:00`).getTime() - 7 * 24 * 60 * 60 * 1000;
  const sessions = useWorkoutStore.getState().history.filter((entry) => new Date(entry.endTime).getTime() >= cutoff).slice(0, 3);
  if (sessions.length === 0) return 'unknown';
  const rpes = sessions.flatMap((session) => session.exercises.flatMap((exercise) => exercise.sets.map((set) => set.rpe).filter((rpe): rpe is number => rpe !== undefined)));
  if (rpes.length === 0) return 'mixed';
  if (rpes.every((rpe) => rpe <= 7)) return 'comfortable';
  if (rpes.some((rpe) => rpe >= 9)) return 'hard';
  return 'mixed';
}

export function buildLocalCoachContext(date: string): LocalCoachContext {
  const dates = recentDates(date);
  const diary = useDiaryStore.getState();
  const water = useWaterStore.getState();
  const onboarding = useOnboardingStore.getState();
  const workoutHistory = useWorkoutStore.getState().history;
  const fastingHistory = useFastingStore.getState().history;
  const cutoff = new Date(`${date}T00:00:00`).getTime() - 7 * 24 * 60 * 60 * 1000;

  return {
    date,
    calories: {
      consumed: diary.getDailyCalories(date),
      target: onboarding.calorieTarget || 2000,
    },
    waterMl: {
      consumed: water.waterMl[date] || 0,
      target: 2000,
    },
    diaryDaysLogged: new Set(diary.entries.filter((entry) => dates.includes(entry.date)).map((entry) => entry.date)).size,
    workoutsCompleted: workoutHistory.filter((entry) => new Date(entry.endTime).getTime() >= cutoff).length,
    fastingSessionsCompleted: fastingHistory.filter((entry) => entry.completed && new Date(entry.startTime).getTime() >= cutoff).length,
    recentWorkoutEffort: workoutEffort(date),
  };
}

export function getDailyRecommendations(context: LocalCoachContext): LocalRecommendation[] {
  if (context.diaryDaysLogged === 0 && context.workoutsCompleted === 0 && context.fastingSessionsCompleted === 0 && context.waterMl.consumed === 0) return [];
  const recommendations: LocalRecommendation[] = [];
  if (context.waterMl.consumed < context.waterMl.target * 0.6) {
    recommendations.push({
      id: `hydration-${context.date}`,
      category: 'hydration',
      title: 'Close the hydration gap',
      action: 'Add one glass of water now and keep your bottle nearby.',
      reason: `You have logged ${context.waterMl.consumed} ml of your ${context.waterMl.target} ml local target today.`,
      confidence: 'high',
    });
  }
  if (context.recentWorkoutEffort === 'comfortable') {
    recommendations.push({
      id: `workout-${context.date}`,
      category: 'workout',
      title: 'Progress with control',
      action: 'Consider a small rep or weight increase in your next session.',
      reason: 'Your recent logged sets were consistently comfortable.',
      confidence: 'medium',
    });
  }
  return recommendations.slice(0, 3);
}

export function getWeeklyRecommendation(contexts: LocalCoachContext[]): LocalRecommendation | null {
  if (contexts.length === 0) return null;
  const comfortableWorkouts = contexts.filter((context) => context.recentWorkoutEffort === 'comfortable').length;
  if (comfortableWorkouts >= 3) {
    return {
      id: `weekly-workout-${contexts[0].date}`,
      category: 'workout',
      title: 'Build on a steady training rhythm',
      action: 'Repeat your current plan and progress one exercise slightly next week.',
      reason: `${comfortableWorkouts} local snapshots show comfortable workout effort.`,
      confidence: 'medium',
    };
  }
  const averageWaterRatio = contexts.reduce((sum, context) => sum + context.waterMl.consumed / Math.max(context.waterMl.target, 1), 0) / contexts.length;
  if (averageWaterRatio < 0.7) {
    return {
      id: `weekly-hydration-${contexts[0].date}`,
      category: 'hydration',
      title: 'Make hydration easier next week',
      action: 'Set up two simple water reminders around meals.',
      reason: 'Your local seven-day water average stayed below 70% of target.',
      confidence: 'medium',
    };
  }
  return null;
}
