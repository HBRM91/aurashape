-- Tighten executable privileges after the B2B functions are exposed through RPC.

ALTER FUNCTION public.handle_new_user() SET search_path = public;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.organization_membership_role(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_organization(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.employer_cohort_summary(UUID) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.organization_membership_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.employer_cohort_summary(UUID) TO authenticated;

DROP POLICY IF EXISTS employer_programs_admin_write ON public.employer_programs;

CREATE POLICY employer_programs_admin_insert ON public.employer_programs
  FOR INSERT TO authenticated
  WITH CHECK (public.organization_membership_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY employer_programs_admin_update ON public.employer_programs
  FOR UPDATE TO authenticated
  USING (public.organization_membership_role(organization_id) IN ('owner', 'admin'))
  WITH CHECK (public.organization_membership_role(organization_id) IN ('owner', 'admin'));

CREATE POLICY employer_programs_admin_delete ON public.employer_programs
  FOR DELETE TO authenticated
  USING (public.organization_membership_role(organization_id) IN ('owner', 'admin'));
