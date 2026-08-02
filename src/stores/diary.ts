import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';
import type { DiaryEntry, Food, MealSlot } from '@/src/types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DiaryState {
  selectedDate: string;
  entries: DiaryEntry[];
  recentFoods: Food[];
  setDate: (date: string) => void;
  addEntry: (food: Food, slot: MealSlot, servings?: number) => void;
  updateEntry: (id: string, servings: number) => void;
  removeEntry: (id: string) => void;
  copyFromDate: (fromDate: string) => void;
  getEntriesBySlot: (date: string, slot: MealSlot) => DiaryEntry[];
  getSlotCalories: (date: string, slot: MealSlot) => number;
  getDailyCalories: (date: string) => number;
  getDailyMacros: (date: string) => { protein: number; carbs: number; fat: number };
}

let nextId = Date.now();

function makeEntry(food: Food, slot: MealSlot, date: string, servings: number): DiaryEntry {
  return {
    id: String(nextId++),
    user_id: '',
    food_id: food.id,
    food,
    meal_slot: slot,
    servings,
    date,
  };
}

export const useDiaryStore = create<DiaryState>()(
  persist(
    (set, get) => ({
      selectedDate: todayStr(),
      entries: [],
      recentFoods: [],

      setDate: (date) => set({ selectedDate: date }),

      addEntry: (food, slot, servings = 1) => {
        const { selectedDate, entries, recentFoods } = get();
        const entry = makeEntry(food, slot, selectedDate, servings);
        const updatedRecent = [food, ...recentFoods.filter((f) => f.id !== food.id)].slice(0, 20);
        set({ entries: [...entries, entry], recentFoods: updatedRecent });
        track('meal_logged', { meal: slot, calories: (food.calories_per_serving || 0) * servings });
        try { require('./sync').useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: entry as any }); } catch {}
        try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}
      },

      updateEntry: (id, servings) => {
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, servings } : e)),
        }));
      },

      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      },

      copyFromDate: (fromDate) => {
        const { entries, selectedDate } = get();
        const sourceEntries = entries.filter((e) => e.date === fromDate);
        const cloned = sourceEntries.map((e) => ({
          ...e,
          id: String(nextId++),
          date: selectedDate,
        }));
        set((s) => ({ entries: [...s.entries, ...cloned] }));
      },

      getEntriesBySlot: (date, slot) => {
        return get().entries.filter((e) => e.date === date && e.meal_slot === slot);
      },

      getSlotCalories: (date, slot) => {
        return get()
          .entries.filter((e) => e.date === date && e.meal_slot === slot)
          .reduce((sum, e) => sum + (e.food?.calories_per_serving || 0) * e.servings, 0);
      },

      getDailyCalories: (date) => {
        return get()
          .entries.filter((e) => e.date === date)
          .reduce((sum, e) => sum + (e.food?.calories_per_serving || 0) * e.servings, 0);
      },

      getDailyMacros: (date) => {
        const entries = get().entries.filter((e) => e.date === date);
        return entries.reduce(
          (acc, e) => ({
            protein: acc.protein + (e.food?.protein_g || 0) * e.servings,
            carbs: acc.carbs + (e.food?.carbs_g || 0) * e.servings,
            fat: acc.fat + (e.food?.fat_g || 0) * e.servings,
          }),
          { protein: 0, carbs: 0, fat: 0 }
        );
      },
    }),
    {
      name: 'diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ...state,
        selectedDate: todayStr(),
      }),
    }
  )
);
