import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { captureError } from '@/src/lib/sentry';
import { isLocalOnly } from '@/src/lib/privacyMode';

const MAX_SYNC_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 2_000;
const MAX_BACKOFF_MS = 5 * 60 * 1_000;
const JITTER_MS = 1_000;

interface SyncItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  timestamp: number;
  /** Number of failed attempts so far. Used for backoff and quarantine. */
  attempts: number;
  /** Epoch ms — the item is skipped until this time has passed. */
  nextRetryAt: number;
}

interface SyncState {
  queue: SyncItem[];
  /** Items that failed MAX_SYNC_ATTEMPTS times in a row. Kept, not lost —
   *  surfaced so the user/app can decide to retry rather than silently
   *  dropping data or retrying a permanently-broken item forever. */
  quarantined: SyncItem[];
  lastSync: number | null;
  syncing: boolean;
  enqueue: (item: Omit<SyncItem, 'id' | 'timestamp' | 'attempts' | 'nextRetryAt'>) => void;
  processQueue: (userId: string) => Promise<void>;
  retryQuarantined: () => void;
  clearQueue: () => void;
  /**
   * Fully resets sync state — call on logout. Without this, an unsynced
   * item queued by one account would still be sitting in memory (this
   * store's state is a process-lifetime singleton, not reset just because
   * AsyncStorage was cleared) and would sync under whichever `userId`
   * `processQueue` is next called with, i.e. a different account signing
   * in on the same device.
   */
  resetSync: () => void;
  /**
   * Starts syncing for the given user: flushes the outbox immediately, then
   * again whenever the app returns to the foreground. Returns a cleanup
   * function to stop listening — call it on logout / unmount.
   */
  initSync: (userId: string) => () => void;
}

function nextBackoff(attempts: number): number {
  const delay = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** attempts);
  return Date.now() + delay + Math.random() * JITTER_MS;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      quarantined: [],
      lastSync: null,
      syncing: false,

      enqueue: (item) => {
        if (isLocalOnly()) return;
        set((s) => ({
          queue: [
            ...s.queue,
            {
              ...item,
              id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              timestamp: Date.now(),
              attempts: 0,
              nextRetryAt: 0,
            },
          ],
        }));
      },

      processQueue: async (userId) => {
        if (isLocalOnly()) return;
        const { queue, syncing } = get();
        if (syncing || queue.length === 0) return;

        set({ syncing: true });
        const now = Date.now();
        const remaining: SyncItem[] = [];
        const newlyQuarantined: SyncItem[] = [];

        for (const item of queue) {
          if (item.nextRetryAt > now) {
            remaining.push(item);
            continue;
          }

          try {
            const table = supabase.from(item.table);
            if (item.action === 'insert') {
              const { error } = await table.insert({ ...item.payload, user_id: userId } as any);
              if (error) throw error;
            } else if (item.action === 'update') {
              const { error } = await table.update(item.payload).eq('id', item.payload.id as string);
              if (error) throw error;
            } else if (item.action === 'delete') {
              const { error } = await table.delete().eq('id', item.payload.id as string);
              if (error) throw error;
            }
          } catch (err) {
            captureError(err as Error, { sync_table: item.table, sync_action: item.action });
            const attempts = item.attempts + 1;
            if (attempts >= MAX_SYNC_ATTEMPTS) {
              newlyQuarantined.push({ ...item, attempts });
            } else {
              remaining.push({ ...item, attempts, nextRetryAt: nextBackoff(attempts) });
            }
          }
        }

        set((s) => ({
          queue: remaining,
          quarantined: [...s.quarantined, ...newlyQuarantined],
          lastSync: Date.now(),
          syncing: false,
        }));
      },

      retryQuarantined: () => {
        set((s) => ({
          queue: [
            ...s.queue,
            ...s.quarantined.map((item) => ({ ...item, attempts: 0, nextRetryAt: 0 })),
          ],
          quarantined: [],
        }));
      },

      clearQueue: () => set({ queue: [] }),

      resetSync: () => set({ queue: [], quarantined: [], lastSync: null, syncing: false }),

      initSync: (userId) => {
        if (isLocalOnly()) return () => {};

        void get().processQueue(userId);

        const handleAppStateChange = (state: AppStateStatus) => {
          if (state === 'active') void get().processQueue(userId);
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // `syncing` is a transient in-flight flag — never resume rehydrated as
      // stuck "true" if the app was killed mid-sync.
      partialize: (state) => ({
        queue: state.queue,
        quarantined: state.quarantined,
        lastSync: state.lastSync,
      }),
    }
  )
);
