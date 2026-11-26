-- BridgeRN Phase 1 Row-Level Security (RLS) Policies & Account Deletion RPC

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcome_reports ENABLE ROW LEVEL SECURITY;

-- Helper: check if current authenticated user holds an editorial/admin role
CREATE OR REPLACE FUNCTION public.is_editorial_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('author', 'reviewer', 'admin')
      AND deleted_at IS NULL
  );
$$;

-- 1. profiles: users can read, insert, and update only their own non-privileged fields
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() AND role = 'learner');

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 2. categories: readable by all authenticated users
CREATE POLICY "categories_select_authenticated"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- 3. questions: learners read only published items; editorial staff handled in Phase 7
CREATE POLICY "questions_select_published"
  ON public.questions FOR SELECT
  TO authenticated
  USING (status = 'published' OR public.is_editorial_staff());

-- 4. question_options: readable when parent question is readable
CREATE POLICY "question_options_select_visible"
  ON public.question_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = question_options.question_id
        AND (q.status = 'published' OR public.is_editorial_staff())
    )
  );

-- 5. exam_sessions: strictly scoped to owner
CREATE POLICY "exam_sessions_all_own"
  ON public.exam_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. attempts: strictly scoped to owner
CREATE POLICY "attempts_all_own"
  ON public.attempts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. answers: strictly scoped to owner
CREATE POLICY "answers_all_own"
  ON public.answers FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. study_plans: strictly scoped to owner
CREATE POLICY "study_plans_all_own"
  ON public.study_plans FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 9. subscriptions: users can only read their own subscription; writes come from service_role/webhooks
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 10. outcome_reports: strictly scoped to owner
CREATE POLICY "outcome_reports_all_own"
  ON public.outcome_reports FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Self-service account deletion RPC (privacy requirement)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Cascades through profiles and all user-owned tables
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
