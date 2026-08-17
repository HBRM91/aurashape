-- Soft-delete + reliable updated_at for diary_entries.
--
-- The offline sync pull path (docs/ARCHITECTURE-REVIEW-AND-BACKLOG.md
-- FND-02) needs to distinguish "this row was never synced to this device"
-- from "this row was deleted on another device." A pull query filtered on
-- `updated_at > cursor` can only see that distinction if deletes are soft
-- (an UPDATE setting deleted_at, which bumps updated_at and is included in
-- the next pull) rather than hard DELETEs, which simply vanish from every
-- future query with no signal left behind.

ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS diary_entries_updated_at_idx ON public.diary_entries(user_id, updated_at);

-- Keep updated_at current on every row change, including soft-deletes, so
-- the sync cursor (`updated_at > last_pull_at`) never misses one.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS diary_entries_set_updated_at ON public.diary_entries;
CREATE TRIGGER diary_entries_set_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Replace the single FOR ALL policy with split policies that omit DELETE.
-- End-user deletions now go through the soft-delete path (UPDATE
-- deleted_at), so a client-issued hard DELETE is no longer permitted.
-- Hard removal still happens via the existing
-- `diary_entries.user_id REFERENCES profiles(id) ON DELETE CASCADE`
-- when an account itself is deleted — this only removes the row-level
-- self-service DELETE that let a client bypass the tombstone.
DROP POLICY IF EXISTS "crud_own_diary" ON public.diary_entries;

CREATE POLICY "select_own_diary" ON public.diary_entries
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "insert_own_diary" ON public.diary_entries
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "update_own_diary" ON public.diary_entries
  FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
