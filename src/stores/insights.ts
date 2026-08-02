import { create } from 'zustand';
import { useDiaryStore } from './diary';

interface DaySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealsLogged: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

interface WeeklyInsight {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  calorieTargetMet: number;
  proteinTargetMet: number;
  bestDay: string | null;
  worstDay: string | null;
  streak: number;
  totalMeals: number;
  topFoods: Array<{ name: string; count: number }>;
}

interface InsightsState {
  getDaySummary: (date: string, calorieTarget: number, proteinTarget: number,
    carbsTarget: number, fatTarget: number) => DaySummary;
  getWeeklyInsights: (endDate: string, calorieTarget: number, proteinTarget: number,
    carbsTarget: number, fatTarget: number) => WeeklyInsight;
  getStreak: () => number;
}

export const useInsightsStore = create<InsightsState>(() => ({
  getDaySummary: (date, calorieTarget, proteinTarget, carbsTarget, fatTarget) => {
    const { entries, getDailyCalories, getDailyMacros } = useDiaryStore.getState();
    const dateEntries = entries.filter((e) => e.date === date);
    const calories = getDailyCalories(date);
    const macros = getDailyMacros(date);
    const fiber = dateEntries.reduce((sum, e) => sum + (e.food?.fiber_g || 0) * e.servings, 0);

    return {
      date,
      calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber,
      mealsLogged: new Set(dateEntries.map((e) => e.meal_slot)).size,
      targetCalories: calorieTarget,
      targetProtein: proteinTarget,
      targetCarbs: carbsTarget,
      targetFat: fatTarget,
    };
  },

  getWeeklyInsights: (endDate, calorieTarget, proteinTarget, carbsTarget, fatTarget) => {
    const { entries, getDailyCalories, getDailyMacros } = useDiaryStore.getState();
    const end = new Date(endDate);
    const days: DaySummary[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        calories: getDailyCalories(dateStr),
        protein: getDailyMacros(dateStr).protein,
        carbs: getDailyMacros(dateStr).carbs,
        fat: getDailyMacros(dateStr).fat,
        fiber: entries.filter((e) => e.date === dateStr).reduce((s, e) => s + (e.food?.fiber_g || 0) * e.servings, 0),
        mealsLogged: new Set(entries.filter((e) => e.date === dateStr).map((e) => e.meal_slot)).size,
        targetCalories: calorieTarget,
        targetProtein: proteinTarget,
        targetCarbs: carbsTarget,
        targetFat: fatTarget,
      });
    }

    const activeDays = days.filter((d) => d.mealsLogged > 0);
    const total = activeDays.length || 1;

    const avgCalories = Math.round(days.reduce((s, d) => s + d.calories, 0) / total);
    const avgProtein = Math.round(days.reduce((s, d) => s + d.protein, 0) / total);
    const avgCarbs = Math.round(days.reduce((s, d) => s + d.carbs, 0) / total);
    const avgFat = Math.round(days.reduce((s, d) => s + d.fat, 0) / total);

    const calorieTargetMet = days.filter(
      (d) => d.mealsLogged > 0 && d.calories <= d.targetCalories * 1.05 && d.calories >= d.targetCalories * 0.75
    ).length;
    const proteinTargetMet = days.filter(
      (d) => d.mealsLogged > 0 && d.protein >= d.targetProtein * 0.8
    ).length;

    let bestDay: string | null = null;
    let worstDay: string | null = null;
    let bestScore = -Infinity;
    let worstScore = Infinity;

    activeDays.forEach((d) => {
      const score =
        (1 - Math.abs(d.calories - d.targetCalories) / Math.max(d.targetCalories, 1)) * 0.4 +
        Math.min(d.protein / Math.max(d.targetProtein, 1), 2) * 0.3 +
        Math.min(d.fiber / Math.max(25, 1), 2) * 0.3;
      if (score > bestScore) { bestScore = score; bestDay = d.date; }
      if (score < worstScore) { worstScore = score; worstDay = d.date; }
    });

    const foodCounts = new Map<string, number>();
    entries
      .filter((e) => days.some((d) => d.date === e.date))
      .forEach((e) => {
        const name = e.food?.name || 'Unknown';
        foodCounts.set(name, (foodCounts.get(name) || 0) + 1);
      });
    const topFoods = [...foodCounts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].mealsLogged > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFat,
      calorieTargetMet,
      proteinTargetMet,
      bestDay,
      worstDay,
      streak: currentStreak,
      totalMeals: activeDays.length,
      topFoods,
    };
  },

  getStreak: () => {
    const { entries } = useDiaryStore.getState();
    const dates = [...new Set(entries.map((e) => e.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().slice(0, 10);
      if (dates[i] === expectedStr) {
        streak++;
      } else if (i === 0 && dates[i] !== today) {
        break;
      } else if (new Date(dates[i]).getTime() === new Date(expectedStr).getTime() - 86400000) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
}));
