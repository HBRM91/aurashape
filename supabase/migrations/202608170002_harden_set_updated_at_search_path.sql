-- Pin search_path on the trigger function added by 202608170001_diary_soft_delete.
-- Flagged by the Supabase security linter (function_search_path_mutable)
-- after applying that migration to the live project. The function only
-- calls NOW(), a built-in always resolvable via pg_catalog regardless of
-- search_path, so an empty search_path is safe and maximally strict —
-- consistent with this repo's existing hardening pass
-- (202608090004_advisor_hardening.sql).
ALTER FUNCTION public.set_updated_at() SET search_path = '';
