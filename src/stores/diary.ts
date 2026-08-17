import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';
import { generateId, isLegacyId } from '@/src/lib/id';
import { appEvents, APP_EVENTS, type SyncPulledPayload } from '@/src/lib/events';
import { mapDiaryEntryToPayload, mapPayloadToDiaryEntry } from '@/src/lib/syncMappers';
import { useSyncStore } from './sync';
import type { DiaryEntry, Food, MealSlot } from '@/src/types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DiaryState {
  selectedDate: string;
  entries: DiaryEntry[];
  recentFoods: Food[];
  favoriteFoods: Food[];
  setDate: (date: string) => void;
  addEntry: (food: Food, slot: MealSlot, servings?: number) => void;
  toggleFavoriteFood: (food: Food) => void;
  isFavoriteFood: (foodId: string) => boolean;
  updateEntry: (id: string, servings: number) => void;
  removeEntry: (id: string) => void;
  copyFromDate: (fromDate: string) => void;
  getEntriesBySlot: (date: string, slot: MealSlot) => DiaryEntry[];
  getSlotCalories: (date: string, slot: MealSlot) => number;
  getDailyCalories: (date: string) => number;
  getDailyMacros: (date: string) => { protein: number; carbs: number; fat: number };
}

/**
 * Replaces any pre-UUIDv7 entry ID (`String(Date.now() + counter)`, which
 * collides across devices/reinstalls) with a fresh UUIDv7. Exported as a
 * pure function so the migration logic is testable independently of
 * zustand's persist/rehydrate machinery.
 */
export function migrateLegacyEntryIds(entries: DiaryEntry[]): DiaryEntry[] {
  return entries.map((entry) => (isLegacyId(entry.id) ? { ...entry, id: generateId() } : entry));
}

/**
 * Applies rows pulled from the server (sync.ts::pullChanges) to the local
 * entries array: a row carrying deleted_at removes the matching local
 * entry (the tombstone from another device's soft-delete); otherwise the
 * row is upserted. An id present in `pendingIds` (still sitting in this
 * device's own outbound queue) is skipped entirely — applying a pulled row
 * for an id with an in-flight local edit would silently clobber that edit
 * with a version that hasn't seen it yet. It's applied on the next pull,
 * once the local edit has actually synced through.
 */
export function applyPulledDiaryRows(
  entries: DiaryEntry[],
  rows: Array<Record<string, unknown>>,
  pendingIds: Set<string>
): DiaryEntry[] {
  let result = entries;
  for (const row of rows) {
    const id = row.id as string;
    if (pendingIds.has(id)) continue;

    if (row.deleted_at) {
      result = result.filter((e) => e.id !== id);
      continue;
    }

    const incoming = mapPayloadToDiaryEntry(row);
    const idx = result.findIndex((e) => e.id === id);
    result = idx === -1 ? [...result, incoming] : result.map((e) => (e.id === id ? incoming : e));
  }
  return result;
}

function makeEntry(food: Food, slot: MealSlot, date: string, servings: number): DiaryEntry {
  return {
    id: generateId(),
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
      favoriteFoods: [],

      setDate: (date) => set({ selectedDate: date }),

      addEntry: (food, slot, servings = 1) => {
        const { selectedDate, entries, recentFoods } = get();
        const entry = makeEntry(food, slot, selectedDate, servings);
        const updatedRecent = [food, ...recentFoods.filter((f) => f.id !== food.id)].slice(0, 20);
        set({ entries: [...entries, entry], recentFoods: updatedRecent });
        track('meal_logged', { meal: slot, calories: (food.calories_per_serving || 0) * servings });
        useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: mapDiaryEntryToPayload(entry) });
        appEvents.emit(APP_EVENTS.achievementsRecheck, undefined);
      },

      toggleFavoriteFood: (food) => {
        set((state) => ({
          favoriteFoods: state.favoriteFoods.some((favorite) => favorite.id === food.id)
            ? state.favoriteFoods.filter((favorite) => favorite.id !== food.id)
            : [food, ...state.favoriteFoods],
        }));
      },

      isFavoriteFood: (foodId) => get().favoriteFoods.some((food) => food.id === foodId),

      updateEntry: (id, servings) => {
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, servings } : e)),
        }));
        useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'update', payload: { id, servings } });
      },

      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
        // Soft-delete on the server (RLS no longer permits a client-issued
        // hard DELETE on diary_entries — see
        // supabase/migrations/202608170001_diary_soft_delete.sql): other
        // devices only learn a row was removed by pulling a non-null
        // deleted_at, which a hard DELETE could never signal. The local
        // copy above is still removed immediately; only the server side
        // needs a tombstone.
        useSyncStore.getState().enqueue({
          table: 'diary_entries',
          action: 'update',
          payload: { id, deleted_at: new Date().toISOString() },
        });
      },

      copyFromDate: (fromDate) => {
        const { entries, selectedDate } = get();
        const sourceEntries = entries.filter((e) => e.date === fromDate);
        const cloned = sourceEntries.map((e) => ({
          ...e,
          id: generateId(),
          date: selectedDate,
        }));
        set((s) => ({ entries: [...s.entries, ...cloned] }));
        cloned.forEach((entry) => {
          useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: mapDiaryEntryToPayload(entry) });
        });
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
      version: 1,
      // v0 -> v1: entry IDs were `String(Date.now() + counter)`, which
      // collide across devices/reinstalls and are rejected by the UUID
      // columns the server schema expects. Assign every legacy entry a
      // fresh UUIDv7 once, on first load after the upgrade.
      migrate: (persistedState) => {
        const state = persistedState as DiaryState;
        if (!state?.entries) return state;
        return { ...state, entries: migrateLegacyEntryIds(state.entries) };
      },
      partialize: (state) => ({
        ...state,
        selectedDate: todayStr(),
      }),
    }
  )
);

// sync.ts::pullChanges fetches rows for every table in SYNCED_TABLES and
// emits them generically — it doesn't know what a diary_entries row means.
// This is the diary-specific half: apply pulled rows to the local entries.
appEvents.on<SyncPulledPayload>(APP_EVENTS.syncPulled, ({ table, rows }) => {
  if (table !== 'diary_entries') return;
  const pendingIds = new Set(
    useSyncStore.getState().queue.map((item) => item.payload.id as string)
  );
  useDiaryStore.setState((s) => ({
    entries: applyPulledDiaryRows(s.entries, rows, pendingIds),
  }));
});
