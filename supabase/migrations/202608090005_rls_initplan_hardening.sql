-- Cache auth.uid() once per statement in existing RLS predicates.

DO $$
DECLARE
  policy_row RECORD;
  rewritten_using TEXT;
  rewritten_check TEXT;
  statement TEXT;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
  LOOP
    rewritten_using := replace(policy_row.qual, 'auth.uid()', '(select auth.uid())');
    rewritten_check := replace(policy_row.with_check, 'auth.uid()', '(select auth.uid())');
    statement := format('ALTER POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
    IF rewritten_using IS NOT NULL THEN
      statement := statement || format(' USING (%s)', rewritten_using);
    END IF;
    IF rewritten_check IS NOT NULL THEN
      statement := statement || format(' WITH CHECK (%s)', rewritten_check);
    END IF;
    EXECUTE statement;
  END LOOP;
END;
$$;
