/**
 * Simulates two independent devices sharing one backend, to prove the sync
 * write path (processQueue) and pull path (pullChanges) actually converge —
 * not just that neither one crashes in isolation. There's no live Supabase
 * project available to this session, so the "backend" is an in-memory array
 * behind a supabase-shaped mock, shared by both device sandboxes.
 *
 * Each "device" is a fully independent copy of the diary/sync module graph,
 * obtained via jest.isolateModules — this matters because diary.ts and
 * sync.ts are otherwise process-lifetime singletons; two real devices are
 * two separate processes, and the test needs the same isolation to mean
 * anything.
 */

import type { Food } from '@/src/types';

const mockFood: Food = {
  id: '0123456789012',
  name: 'Protein Bar',
  brand: 'Aura Biosens',
  barcode: '0123456789012',
  serving_size_g: 40,
  serving_name: '40 g',
  calories_per_serving: 160,
  protein_g: 12,
  carbs_g: 16,
  fat_g: 6,
  fiber_g: 2,
  is_verified: true,
  is_aurabiosens: true,
  source: 'open_food_facts',
};

interface ServerRow {
  [key: string]: unknown;
}

function makeFakeBackend() {
  const rows: ServerRow[] = [];
  let clock = 1;
  const nextTimestamp = () => new Date(2026, 0, 15, 0, 0, 0, clock++).toISOString();

  const supabase = {
    from: (table: string) => ({
      insert: async (payload: ServerRow) => {
        rows.push({ ...payload, updated_at: nextTimestamp(), deleted_at: null });
        return { error: null };
      },
      update: (payload: ServerRow) => ({
        eq: async (col: string, val: string) => {
          const idx = rows.findIndex((r) => r[col] === val);
          if (idx === -1) return { error: { message: 'not found' } };
          rows[idx] = { ...rows[idx], ...payload, updated_at: nextTimestamp() };
          return { error: null };
        },
      }),
      select: () => ({
        eq: (col: string, val: string) => ({
          gt: (col2: string, since: string) => ({
            order: async () => ({
              data: rows
                .filter((r) => r[col] === val && (r[col2] as string) > since)
                .sort((a, b) => (a[col2] as string).localeCompare(b[col2] as string)),
              error: null,
            }),
          }),
        }),
      }),
    }),
  };

  return { supabase, rows };
}

function bootDevice(supabase: unknown) {
  let handles: any;
  jest.isolateModules(() => {
    jest.doMock('@/src/lib/supabase', () => ({ supabase }));
    jest.doMock('@/src/lib/sentry', () => ({ captureError: jest.fn() }));
    handles = {
      diary: require('@/src/stores/diary'),
      sync: require('@/src/stores/sync'),
    };
  });
  return handles;
}

describe('two-device sync convergence', () => {
  const realEnv = process.env.EXPO_PUBLIC_DATA_MODE;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_DATA_MODE = 'cloud';
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_DATA_MODE = realEnv;
    jest.resetModules();
  });

  it('an entry logged on device A appears on device B after both sync', async () => {
    const { supabase } = makeFakeBackend();
    const deviceA = bootDevice(supabase);
    const deviceB = bootDevice(supabase);

    deviceA.diary.useDiaryStore.getState().addEntry(mockFood, 'breakfast');
    await deviceA.sync.useSyncStore.getState().processQueue('user-1');

    expect(deviceB.diary.useDiaryStore.getState().entries).toHaveLength(0); // hasn't pulled yet

    await deviceB.sync.useSyncStore.getState().pullChanges('user-1');

    const bEntries = deviceB.diary.useDiaryStore.getState().entries;
    expect(bEntries).toHaveLength(1);
    expect(bEntries[0].food?.name).toBe('Protein Bar');
    expect(bEntries[0].food?.id).toBe(mockFood.id); // identity survived the round-trip
    expect(bEntries[0].servings).toBe(1);
  });

  it('a soft-delete on device A removes the entry on device B after both sync', async () => {
    const { supabase } = makeFakeBackend();
    const deviceA = bootDevice(supabase);
    const deviceB = bootDevice(supabase);

    deviceA.diary.useDiaryStore.getState().addEntry(mockFood, 'breakfast');
    await deviceA.sync.useSyncStore.getState().processQueue('user-1');
    await deviceB.sync.useSyncStore.getState().pullChanges('user-1');
    expect(deviceB.diary.useDiaryStore.getState().entries).toHaveLength(1);

    const entryId = deviceA.diary.useDiaryStore.getState().entries[0].id;
    deviceA.diary.useDiaryStore.getState().removeEntry(entryId);
    await deviceA.sync.useSyncStore.getState().processQueue('user-1');

    await deviceB.sync.useSyncStore.getState().pullChanges('user-1');

    expect(deviceB.diary.useDiaryStore.getState().entries).toHaveLength(0);
  });

  it('an edit on device A is reflected on device B, and B does not need to re-fetch what it already has', async () => {
    const { supabase } = makeFakeBackend();
    const deviceA = bootDevice(supabase);
    const deviceB = bootDevice(supabase);

    deviceA.diary.useDiaryStore.getState().addEntry(mockFood, 'breakfast', 1);
    await deviceA.sync.useSyncStore.getState().processQueue('user-1');
    await deviceB.sync.useSyncStore.getState().pullChanges('user-1');

    const entryId = deviceA.diary.useDiaryStore.getState().entries[0].id;
    deviceA.diary.useDiaryStore.getState().updateEntry(entryId, 2.5);
    await deviceA.sync.useSyncStore.getState().processQueue('user-1');

    await deviceB.sync.useSyncStore.getState().pullChanges('user-1');

    const bEntry = deviceB.diary.useDiaryStore.getState().entries[0];
    expect(bEntry.servings).toBe(2.5);

    // a second pull with nothing new on the server must not re-emit / re-touch state
    const beforeSecondPull = deviceB.diary.useDiaryStore.getState().entries;
    await deviceB.sync.useSyncStore.getState().pullChanges('user-1');
    expect(deviceB.diary.useDiaryStore.getState().entries).toEqual(beforeSecondPull);
  });
});
