import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import { captureError } from '@/src/lib/sentry';

interface SyncItem {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  timestamp: number;
}

interface SyncState {
  queue: SyncItem[];
  lastSync: number | null;
  syncing: boolean;
  enqueue: (item: Omit<SyncItem, 'id' | 'timestamp'>) => void;
  processQueue: (userId: string) => Promise<void>;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  queue: [],
  lastSync: null,
  syncing: false,

  enqueue: (item) => {
    set((s) => ({
      queue: [
        ...s.queue,
        { ...item, id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now() },
      ],
    }));
  },

  processQueue: async (userId) => {
    const { queue, syncing } = get();
    if (syncing || queue.length === 0) return;

    set({ syncing: true });
    const remaining: SyncItem[] = [];

    for (const item of queue) {
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
        remaining.push(item);
      }
    }

    set({ queue: remaining, lastSync: Date.now(), syncing: false });
  },

  clearQueue: () => set({ queue: [] }),
}));
