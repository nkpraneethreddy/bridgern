-- BridgeRN Phase 1 Initial Database Schema
-- Covers: profiles, categories, questions, question_options, exam_sessions,
-- attempts, answers, study_plans, subscriptions, outcome_reports

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1. User profiles (IEN-specific metadata + privacy consent)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  country_of_education text,
  current_country text,
  target_state text,
  exam_date date,
  weekly_study_hours integer CHECK (weekly_study_hours IS NULL OR (weekly_study_hours >= 1 AND weekly_study_hours <= 80)),
  onboarding_completed boolean NOT NULL DEFAULT false,
  consent_accepted_at timestamptz,
  disclaimer_acknowledged_at timestamptz,
  role text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'author', 'reviewer', 'admin')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. NCLEX-RN Client Needs categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  blueprint_weight numeric(5,2) NOT NULL DEFAULT 0,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Questions (supports traditional + Next Gen NCLEX item types)
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  case_study_id uuid,
  case_study_step integer CHECK (case_study_step IS NULL OR (case_study_step >= 1 AND case_study_step <= 6)),
  topic text NOT NULL,
  item_type text NOT NULL CHECK (
    item_type IN (
      'multiple_choice',
      'sata',
      'matrix',
      'ordered_response',
      'hot_spot',
      'bowtie',
      'case_study'
    )
  ),
  difficulty integer NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  cognitive_level text NOT NULL CHECK (
    cognitive_level IN (
      'remember_understand',
      'apply',
      'analyze',
      'evaluate_create',
      'recognize_cues',
      'analyze_cues',
      'prioritize_hypotheses',
      'generate_solutions',
      'take_action',
      'evaluate_outcomes'
    )
  ),
  stem text NOT NULL,
  clinical_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text NOT NULL,
  max_points integer NOT NULL DEFAULT 1,
  scoring_rule text NOT NULL DEFAULT 'dichotomous' CHECK (
    scoring_rule IN ('dichotomous', 'polytomous_plus_minus', 'polytomous_zero_one', 'rationale_triad')
  ),
  is_placeholder boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  pack_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT questions_published_requires_reviewer CHECK (status <> 'published' OR reviewer_id IS NOT NULL)
);

CREATE INDEX idx_questions_category_status ON public.questions(category_id, status);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_case_study ON public.questions(case_study_id) WHERE case_study_id IS NOT NULL;

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Question options & per-option rationales
CREATE TABLE public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_key text NOT NULL,
  label text NOT NULL,
  explanation text,
  is_correct boolean NOT NULL DEFAULT false,
  correct_order integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, option_key)
);

CREATE INDEX idx_question_options_question ON public.question_options(question_id, sort_order);

-- 5. Exam & practice sessions (diagnostic, tutor, exam, retake, offline)
CREATE TABLE public.exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('diagnostic', 'tutor', 'exam', 'retake', 'offline')),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  title text,
  category_filter uuid[],
  time_limit_seconds integer,
  elapsed_seconds integer NOT NULL DEFAULT 0,
  current_ability numeric(4,2) NOT NULL DEFAULT 0.00,
  total_questions integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  score_percentage numeric(5,2),
  readiness_low numeric(5,2),
  readiness_high numeric(5,2),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_sessions_user ON public.exam_sessions(user_id, started_at DESC);

CREATE TRIGGER trg_exam_sessions_updated_at
  BEFORE UPDATE ON public.exam_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Practice attempts
CREATE TABLE public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  mode text NOT NULL CHECK (mode IN ('diagnostic', 'tutor', 'exam', 'retake', 'offline')),
  questions_answered integer NOT NULL DEFAULT 0,
  points_earned numeric(8,2) NOT NULL DEFAULT 0,
  points_possible numeric(8,2) NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_user ON public.attempts(user_id, started_at DESC);

CREATE TRIGGER trg_attempts_updated_at
  BEFORE UPDATE ON public.attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Individual item answers (supports partial credit & offline sync conflict resolution)
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attempt_id uuid REFERENCES public.attempts(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  response_payload jsonb NOT NULL,
  points_earned numeric(6,2) NOT NULL DEFAULT 0,
  points_possible numeric(6,2) NOT NULL DEFAULT 1,
  is_correct boolean NOT NULL DEFAULT false,
  time_spent_seconds integer NOT NULL DEFAULT 0,
  client_sync_id text,
  answered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_answers_user_question ON public.answers(user_id, question_id);
CREATE INDEX idx_answers_session ON public.answers(session_id);
CREATE UNIQUE INDEX idx_answers_user_client_sync
  ON public.answers(user_id, client_sync_id)
  WHERE client_sync_id IS NOT NULL;

CREATE TRIGGER trg_answers_updated_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Auto-generated and retake study plans
CREATE TABLE public.study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'diagnostic' CHECK (source IN ('diagnostic', 'retake', 'manual')),
  exam_date date,
  weekly_hours integer NOT NULL DEFAULT 10 CHECK (weekly_hours >= 1 AND weekly_hours <= 80),
  daily_question_goal integer NOT NULL DEFAULT 25 CHECK (daily_question_goal >= 5 AND daily_question_goal <= 200),
  focus_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  schedule_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_study_plans_user_active ON public.study_plans(user_id, is_active);

CREATE TRIGGER trg_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9. Subscriptions & Entitlements (RevenueCat synced server-side)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'core', 'plus')),
  billing_period text NOT NULL DEFAULT 'none' CHECK (billing_period IN ('monthly', 'quarterly', 'annual', 'none')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'grace_period', 'expired', 'cancelled')),
  provider text NOT NULL DEFAULT 'revenuecat' CHECK (provider IN ('revenuecat', 'manual', 'promo')),
  rc_customer_id text,
  rc_entitlement_id text,
  currency_code text NOT NULL DEFAULT 'USD',
  region_tier text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. Post-exam outcome reports & CPR weak-area intake for Retake Mode
CREATE TABLE public.outcome_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  target_state text,
  outcome text NOT NULL CHECK (outcome IN ('passed', 'did_not_pass', 'pending', 'rescheduled')),
  questions_stopped_at integer,
  weak_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  reported_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_outcome_reports_user ON public.outcome_reports(user_id, reported_at DESC);

CREATE TRIGGER trg_outcome_reports_updated_at
  BEFORE UPDATE ON public.outcome_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Provision profile and default free subscription on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, tier, billing_period, status)
  VALUES (NEW.id, 'free', 'none', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed baseline NCLEX-RN Client Needs categories
INSERT INTO public.categories (slug, name, blueprint_weight, description, sort_order)
VALUES
  ('management-of-care', 'Safe & Effective Care Environment: Management of Care', 18.00, 'Care coordination, delegation, legal/ethical responsibilities, advocacy', 1),
  ('safety-infection-control', 'Safe & Effective Care Environment: Safety & Infection Control', 13.00, 'Standard precautions, fall prevention, emergency response, hazardous materials', 2),
  ('health-promotion', 'Health Promotion & Maintenance', 9.00, 'Lifespan development, antepartum/postpartum care, screening, health teaching', 3),
  ('psychosocial-integrity', 'Psychosocial Integrity', 9.00, 'Therapeutic communication, crisis intervention, mental health, coping', 4),
  ('basic-care-comfort', 'Physiological Integrity: Basic Care & Comfort', 9.00, 'Nutrition, mobility, elimination, pain and palliative comfort measures', 5),
  ('pharmacological-therapies', 'Physiological Integrity: Pharmacological & Parenteral Therapies', 16.00, 'Medication administration, dosage calculation, IV therapy, adverse effects', 6),
  ('reduction-of-risk', 'Physiological Integrity: Reduction of Risk Potential', 12.00, 'Diagnostic tests, lab values, vital sign trends, procedure complications', 7),
  ('physiological-adaptation', 'Physiological Integrity: Physiological Adaptation', 14.00, 'Acute/chronic pathophysiology, fluid & electrolyte imbalances, medical emergencies', 8)
ON CONFLICT (slug) DO NOTHING;
