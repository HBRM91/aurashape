-- Advisor hardening: isolate pg_trgm and cover foreign-key lookups.

CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

CREATE INDEX IF NOT EXISTS challenge_participants_user_idx ON public.challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS community_recipes_author_idx ON public.community_recipes(author_id);
CREATE INDEX IF NOT EXISTS diary_entries_food_idx ON public.diary_entries(food_id);
CREATE INDEX IF NOT EXISTS employer_program_enrollments_user_idx ON public.employer_program_enrollments(user_id);
CREATE INDEX IF NOT EXISTS employer_programs_created_by_idx ON public.employer_programs(created_by);
CREATE INDEX IF NOT EXISTS employer_programs_organization_idx ON public.employer_programs(organization_id);
CREATE INDEX IF NOT EXISTS foods_created_by_idx ON public.foods(created_by);
CREATE INDEX IF NOT EXISTS forum_replies_author_idx ON public.forum_replies(author_id);
CREATE INDEX IF NOT EXISTS forum_replies_parent_idx ON public.forum_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS forum_replies_thread_idx ON public.forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS forum_threads_author_idx ON public.forum_threads(author_id);
CREATE INDEX IF NOT EXISTS organization_audit_events_actor_idx ON public.organization_audit_events(actor_id);
CREATE INDEX IF NOT EXISTS organization_audit_events_organization_idx ON public.organization_audit_events(organization_id);
CREATE INDEX IF NOT EXISTS organization_invitations_invited_by_idx ON public.organization_invitations(invited_by);
CREATE INDEX IF NOT EXISTS organizations_created_by_idx ON public.organizations(created_by);
CREATE INDEX IF NOT EXISTS progress_photos_user_idx ON public.progress_photos(user_id);
CREATE INDEX IF NOT EXISTS routines_user_idx ON public.routines(user_id);
CREATE INDEX IF NOT EXISTS user_consents_user_idx ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_food_idx ON public.user_favorites(food_id);
CREATE INDEX IF NOT EXISTS user_favorites_recipe_idx ON public.user_favorites(recipe_id);

DROP POLICY IF EXISTS organizations_member_read ON public.organizations;
CREATE POLICY organizations_member_read ON public.organizations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = id AND m.user_id = (select auth.uid())));

DROP POLICY IF EXISTS organization_members_self_read ON public.organization_members;
CREATE POLICY organization_members_self_read ON public.organization_members
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR (select public.organization_membership_role(organization_id)) IN ('owner', 'admin'));

DROP POLICY IF EXISTS employer_enrollments_self_write ON public.employer_program_enrollments;
CREATE POLICY employer_enrollments_self_write ON public.employer_program_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS employer_enrollments_self_update ON public.employer_program_enrollments;
CREATE POLICY employer_enrollments_self_update ON public.employer_program_enrollments
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
