/**
 * Minimal in-process pub-sub used to break the circular dependencies between
 * domain stores (diary, workout, fasting, meditation, cycle, community,
 * recipes -> achievements). Those stores previously reached into each other
 * with a runtime `require()` wrapped in a bare `try { } catch {}`, which
 * silently swallowed every error the call could produce — including real
 * bugs in achievement logic, not just the circular-import warning it was
 * meant to suppress. See docs/ARCHITECTURE-REVIEW-AND-BACKLOG.md A10/FND-05.
 *
 * Emitting stores don't know or care who's listening; listening stores
 * subscribe once at module load. A throwing listener is logged in dev
 * instead of crashing the store that emitted the event, but it is never
 * silently discarded.
 */

type Listener<T> = (payload: T) => void;

class EventBus {
  private listeners = new Map<string, Set<Listener<never>>>();

  on<T = void>(event: string, listener: Listener<T>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<never>);
    return () => set!.delete(listener as Listener<never>);
  }

  emit<T = void>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        (listener as Listener<T>)(payload);
      } catch (err) {
        if (__DEV__) console.warn(`[events] listener for "${event}" threw`, err);
      }
    });
  }
}

export const appEvents = new EventBus();

export const APP_EVENTS = {
  /** Emitted after any user action that might unlock or progress an achievement. */
  achievementsRecheck: 'achievements:recheck',
  /**
   * Emitted by sync.ts::pullChanges after fetching rows changed on the
   * server for a given table. sync.ts stays generic (it doesn't know what a
   * `diary_entries` row means) and diary.ts subscribes to apply the rows
   * that belong to it — the same reason achievementsRecheck exists, to
   * avoid sync.ts having to import every domain store directly.
   */
  syncPulled: 'sync:pulled',
} as const;

export interface SyncPulledPayload {
  table: string;
  rows: Array<Record<string, unknown>>;
}
