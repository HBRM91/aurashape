const mockInsert = jest.fn();
const mockUpdateEq = jest.fn();
const mockDeleteEq = jest.fn();
const mockOrder = jest.fn();
const mockFrom = jest.fn(() => ({
  insert: (...args: unknown[]) => mockInsert(...args),
  update: jest.fn(() => ({ eq: (...args: unknown[]) => mockUpdateEq(...args) })),
  delete: jest.fn(() => ({ eq: (...args: unknown[]) => mockDeleteEq(...args) })),
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      gt: jest.fn((...args: unknown[]) => ({
        order: (...orderArgs: unknown[]) => mockOrder(...args, ...orderArgs),
      })),
    })),
  })),
}));

jest.mock('@/src/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...(args as [])) },
}));

const mockCaptureError = jest.fn();
jest.mock('@/src/lib/sentry', () => ({ captureError: mockCaptureError }));

const mockEmit = jest.fn();
jest.mock('@/src/lib/events', () => ({
  appEvents: { emit: (...args: unknown[]) => mockEmit(...args), on: jest.fn() },
  APP_EVENTS: { achievementsRecheck: 'achievements:recheck', syncPulled: 'sync:pulled' },
}));

import { useSyncStore } from '@/src/stores/sync';

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_DATA_MODE = 'cloud';
  useSyncStore.setState({ queue: [], quarantined: [], lastPullAt: {}, lastSync: null, syncing: false });
  mockInsert.mockResolvedValue({ error: null });
  mockUpdateEq.mockResolvedValue({ error: null });
  mockDeleteEq.mockResolvedValue({ error: null });
  mockOrder.mockResolvedValue({ data: [], error: null });
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_DATA_MODE;
});

describe('sync store', () => {
  describe('enqueue', () => {
    it('does nothing in local-only mode', () => {
      delete process.env.EXPO_PUBLIC_DATA_MODE;
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: {} });
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('adds a fresh item with zero attempts and an immediately-eligible retry time', () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: '1' } });
      const [item] = useSyncStore.getState().queue;
      expect(item.attempts).toBe(0);
      expect(item.nextRetryAt).toBe(0);
      expect(item.table).toBe('diary_entries');
    });

    it('assigns distinct ids to items enqueued back to back', () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: '1' } });
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: '2' } });
      const [a, b] = useSyncStore.getState().queue;
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('processQueue', () => {
    it('does nothing in local-only mode', async () => {
      delete process.env.EXPO_PUBLIC_DATA_MODE;
      useSyncStore.setState({ queue: [{ id: 'x', table: 'diary_entries', action: 'insert', payload: {}, timestamp: 0, attempts: 0, nextRetryAt: 0 }] });
      await useSyncStore.getState().processQueue('user-1');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('sends an insert with the user id attached and clears the queue on success', async () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: 'e1', servings: 1 } });
      await useSyncStore.getState().processQueue('user-1');
      expect(mockFrom).toHaveBeenCalledWith('diary_entries');
      expect(mockInsert).toHaveBeenCalledWith({ id: 'e1', servings: 1, user_id: 'user-1' });
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('routes an update action through .update().eq(id)', async () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'update', payload: { id: 'e1', servings: 2 } });
      await useSyncStore.getState().processQueue('user-1');
      expect(mockUpdateEq).toHaveBeenCalledWith('id', 'e1');
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('routes a delete action through .delete().eq(id)', async () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'delete', payload: { id: 'e1' } });
      await useSyncStore.getState().processQueue('user-1');
      expect(mockDeleteEq).toHaveBeenCalledWith('id', 'e1');
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('keeps a failed item in the queue with an incremented attempt count and a future retry time', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'network down' } });
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: 'e1' } });

      const before = Date.now();
      await useSyncStore.getState().processQueue('user-1');

      const [item] = useSyncStore.getState().queue;
      expect(item.attempts).toBe(1);
      expect(item.nextRetryAt).toBeGreaterThan(before);
      expect(mockCaptureError).toHaveBeenCalled();
    });

    it('skips (but keeps) an item whose backoff has not elapsed yet', async () => {
      useSyncStore.setState({
        queue: [{
          id: 'x', table: 'diary_entries', action: 'insert', payload: { id: 'e1' },
          timestamp: 0, attempts: 1, nextRetryAt: Date.now() + 60_000,
        }],
      });
      await useSyncStore.getState().processQueue('user-1');
      expect(mockFrom).not.toHaveBeenCalled();
      expect(useSyncStore.getState().queue).toHaveLength(1);
    });

    it('retries an item once its backoff window has passed', async () => {
      useSyncStore.setState({
        queue: [{
          id: 'x', table: 'diary_entries', action: 'insert', payload: { id: 'e1' },
          timestamp: 0, attempts: 1, nextRetryAt: Date.now() - 1,
        }],
      });
      await useSyncStore.getState().processQueue('user-1');
      expect(mockFrom).toHaveBeenCalled();
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });

    it('quarantines an item instead of retrying forever once it exceeds the attempt limit', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'permanently broken' } });
      useSyncStore.setState({
        queue: [{
          id: 'x', table: 'diary_entries', action: 'insert', payload: { id: 'e1' },
          timestamp: 0, attempts: 4, nextRetryAt: 0,
        }],
      });

      await useSyncStore.getState().processQueue('user-1');

      expect(useSyncStore.getState().queue).toHaveLength(0);
      const [quarantined] = useSyncStore.getState().quarantined;
      expect(quarantined.id).toBe('x');
      expect(quarantined.attempts).toBe(5);
    });

    it('does not lose data: a quarantined item is never simply dropped', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'broken' } });
      useSyncStore.setState({
        queue: [{
          id: 'x', table: 'diary_entries', action: 'insert', payload: { id: 'e1' },
          timestamp: 0, attempts: 10, nextRetryAt: 0,
        }],
      });
      await useSyncStore.getState().processQueue('user-1');
      const total = useSyncStore.getState().queue.length + useSyncStore.getState().quarantined.length;
      expect(total).toBe(1);
    });

    it('does not run two syncs concurrently', async () => {
      let resolveFirst!: (value: { error: null }) => void;
      mockInsert.mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve; }));
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: 'e1' } });

      const first = useSyncStore.getState().processQueue('user-1');
      const second = useSyncStore.getState().processQueue('user-1');

      resolveFirst({ error: null });
      await Promise.all([first, second]);

      // the second call should have been a no-op while `syncing` was true
      expect(mockFrom).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryQuarantined', () => {
    it('moves quarantined items back into the queue with attempts reset', () => {
      useSyncStore.setState({
        queue: [],
        quarantined: [{
          id: 'x', table: 'diary_entries', action: 'insert', payload: { id: 'e1' },
          timestamp: 0, attempts: 5, nextRetryAt: 0,
        }],
      });
      useSyncStore.getState().retryQuarantined();
      expect(useSyncStore.getState().quarantined).toHaveLength(0);
      const [item] = useSyncStore.getState().queue;
      expect(item.attempts).toBe(0);
      expect(item.nextRetryAt).toBe(0);
    });
  });

  describe('clearQueue', () => {
    it('empties the queue', () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: {} });
      useSyncStore.getState().clearQueue();
      expect(useSyncStore.getState().queue).toHaveLength(0);
    });
  });

  describe('initSync', () => {
    it('returns a no-op cleanup and does not touch the network in local-only mode', () => {
      delete process.env.EXPO_PUBLIC_DATA_MODE;
      const cleanup = useSyncStore.getState().initSync('user-1');
      expect(mockFrom).not.toHaveBeenCalled();
      expect(() => cleanup()).not.toThrow();
    });

    it('flushes the queue immediately on start in cloud mode', async () => {
      useSyncStore.getState().enqueue({ table: 'diary_entries', action: 'insert', payload: { id: 'e1' } });
      const cleanup = useSyncStore.getState().initSync('user-1');
      await new Promise((resolve) => setImmediate(resolve));
      expect(mockFrom).toHaveBeenCalled();
      cleanup();
    });
  });

  describe('pullChanges', () => {
    it('does nothing in local-only mode', async () => {
      delete process.env.EXPO_PUBLIC_DATA_MODE;
      await useSyncStore.getState().pullChanges('user-1');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('queries with the epoch as the cursor on a first-ever pull', async () => {
      await useSyncStore.getState().pullChanges('user-1');
      expect(mockOrder).toHaveBeenCalledWith(
        'updated_at', '1970-01-01T00:00:00.000Z', 'updated_at', { ascending: true }
      );
    });

    it('emits sync:pulled with the fetched rows when there are any', async () => {
      const rows = [{ id: 'e1', updated_at: '2026-01-15T10:00:00.000Z' }];
      mockOrder.mockResolvedValueOnce({ data: rows, error: null });

      await useSyncStore.getState().pullChanges('user-1');

      expect(mockEmit).toHaveBeenCalledWith('sync:pulled', { table: 'diary_entries', rows });
    });

    it('does not emit when there are no changed rows', async () => {
      mockOrder.mockResolvedValueOnce({ data: [], error: null });
      await useSyncStore.getState().pullChanges('user-1');
      expect(mockEmit).not.toHaveBeenCalled();
    });

    it('advances the cursor to the latest row updated_at after a successful pull', async () => {
      mockOrder.mockResolvedValueOnce({
        data: [
          { id: 'e1', updated_at: '2026-01-15T10:00:00.000Z' },
          { id: 'e2', updated_at: '2026-01-15T12:00:00.000Z' },
        ],
        error: null,
      });

      await useSyncStore.getState().pullChanges('user-1');

      expect(useSyncStore.getState().lastPullAt.diary_entries).toBe('2026-01-15T12:00:00.000Z');
    });

    it('uses the stored cursor (not the epoch) on a subsequent pull', async () => {
      useSyncStore.setState({ lastPullAt: { diary_entries: '2026-01-15T09:00:00.000Z' } });
      await useSyncStore.getState().pullChanges('user-1');
      expect(mockOrder).toHaveBeenCalledWith(
        'updated_at', '2026-01-15T09:00:00.000Z', 'updated_at', { ascending: true }
      );
    });

    it('does not advance the cursor when the fetch fails, so the same window is retried next time', async () => {
      mockOrder.mockResolvedValueOnce({ data: null, error: { message: 'network down' } });
      await useSyncStore.getState().pullChanges('user-1');
      expect(useSyncStore.getState().lastPullAt.diary_entries).toBeUndefined();
      expect(mockCaptureError).toHaveBeenCalled();
    });
  });
});
