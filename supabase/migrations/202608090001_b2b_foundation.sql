-- Secure B2B foundation. Personal health tables remain user-scoped.

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_members_user_idx
  ON public.organization_members(user_id, organization_id);

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (length(trim(email)) BETWEEN 3 AND 320),
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  token_hash TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_invitations_lookup_idx
  ON public.organization_invitations(organization_id, status, expires_at);

CREATE TABLE IF NOT EXISTS public.employer_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.employer_program_enrollments (
  program_id UUID NOT NULL REFERENCES public.employer_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opted_in BOOLEAN NOT NULL DEFAULT false,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (program_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.organization_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (length(trim(action)) BETWEEN 2 AND 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_audit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.organization_membership_role(p_organization_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE organization_id = p_organization_id AND user_id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.create_organization(p_name TEXT, p_slug TEXT)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created public.organizations;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  INSERT INTO public.organizations (name, slug, created_by)
  VALUES (trim(p_name), lower(trim(p_slug)), auth.uid())
  RETURNING * INTO created;
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (created.id, auth.uid(), 'owner');
  INSERT INTO public.organization_audit_events (organization_id, actor_id, action)
  VALUES (created.id, auth.uid(), 'organization.created');
  RETURN created;
END;
$$;

CREATE OR REPLACE FUNCTION public.employer_cohort_summary(p_org_id UUID)
RETURNS TABLE (member_count INTEGER, opted_in_count INTEGER, active_program_count INTEGER, generated_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  caller_role := public.organization_membership_role(p_org_id);
  IF caller_role IS NULL THEN RAISE EXCEPTION 'organization membership required'; END IF;
  RETURN QUERY
  WITH members AS (
    SELECT COUNT(*)::INTEGER AS total
    FROM public.organization_members
    WHERE organization_id = p_org_id
  ), opted AS (
    SELECT COUNT(DISTINCT e.user_id)::INTEGER AS total
    FROM public.employer_program_enrollments e
    JOIN public.employer_programs p ON p.id = e.program_id
    WHERE p.organization_id = p_org_id AND p.active AND e.opted_in
  ), programs AS (
    SELECT COUNT(*)::INTEGER AS total
    FROM public.employer_programs
    WHERE organization_id = p_org_id AND active
  )
  SELECT CASE WHEN members.total >= 10 THEN members.total ELSE 0 END,
    CASE WHEN members.total >= 10 THEN opted.total ELSE 0 END,
    CASE WHEN members.total >= 10 THEN programs.total ELSE 0 END,
    now();
END;
$$;

CREATE POLICY organizations_member_read ON public.organizations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = id AND m.user_id = auth.uid()));

CREATE POLICY organization_members_self_read ON public.organization_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.organization_membership_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY organization_invitations_admin_read ON public.organization_invitations
  FOR SELECT TO authenticated
  USING (public.organization_membership_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY employer_programs_member_read ON public.employer_programs
  FOR SELECT TO authenticated
  USING (public.organization_membership_role(organization_id) IS NOT NULL);

CREATE POLICY employer_programs_admin_write ON public.employer_programs
  FOR ALL TO authenticated
  USING (public.organization_membership_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.organization_membership_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY employer_enrollments_self_write ON public.employer_program_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY employer_enrollments_self_update ON public.employer_program_enrollments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY audit_events_admin_read ON public.organization_audit_events
  FOR SELECT TO authenticated
  USING (public.organization_membership_role(organization_id) IN ('owner', 'admin'));

REVOKE ALL ON FUNCTION public.employer_cohort_summary(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.employer_cohort_summary(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.create_organization(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;
REVOKE ALL ON FUNCTION public.organization_membership_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.organization_membership_role(UUID) TO authenticated;

GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT ON public.organization_members TO authenticated;
GRANT SELECT ON public.organization_invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employer_programs TO authenticated;
GRANT INSERT, UPDATE ON public.employer_program_enrollments TO authenticated;
GRANT SELECT ON public.organization_audit_events TO authenticated;
