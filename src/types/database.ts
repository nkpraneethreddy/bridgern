export type UserRole = 'learner' | 'author' | 'reviewer' | 'admin';

export type QuestionItemType =
  | 'multiple_choice'
  | 'sata'
  | 'matrix'
  | 'ordered_response'
  | 'hot_spot'
  | 'bowtie'
  | 'case_study';

export type CognitiveLevel =
  | 'remember_understand'
  | 'apply'
  | 'analyze'
  | 'evaluate_create'
  | 'recognize_cues'
  | 'analyze_cues'
  | 'prioritize_hypotheses'
  | 'generate_solutions'
  | 'take_action'
  | 'evaluate_outcomes';

export type QuestionScoringRule =
  | 'dichotomous'
  | 'polytomous_plus_minus'
  | 'polytomous_zero_one'
  | 'rationale_triad';

export type QuestionStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type SessionMode = 'diagnostic' | 'tutor' | 'exam' | 'retake' | 'offline';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type SubscriptionTier = 'free' | 'core' | 'plus';
export type BillingPeriod = 'monthly' | 'quarterly' | 'annual' | 'none';
export type SubscriptionStatus = 'active' | 'trialing' | 'grace_period' | 'expired' | 'cancelled';

export type ExamOutcome = 'passed' | 'did_not_pass' | 'pending' | 'rescheduled';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  country_of_education: string | null;
  current_country: string | null;
  target_state: string | null;
  exam_date: string | null;
  weekly_study_hours: number | null;
  onboarding_completed: boolean;
  consent_accepted_at: string | null;
  disclaimer_acknowledged_at: string | null;
  role: UserRole;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  blueprint_weight: number;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Question {
  id: string;
  category_id: string;
  case_study_id: string | null;
  case_study_step: number | null;
  topic: string;
  item_type: QuestionItemType;
  difficulty: number;
  cognitive_level: CognitiveLevel;
  stem: string;
  clinical_data: Record<string, unknown>;
  rationale: string;
  max_points: number;
  scoring_rule: QuestionScoringRule;
  is_placeholder: boolean;
  status: QuestionStatus;
  author_id: string | null;
  reviewer_id: string | null;
  published_at: string | null;
  pack_version: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_key: string;
  label: string;
  explanation: string | null;
  is_correct: boolean;
  correct_order: number | null;
  metadata: Record<string, unknown>;
  sort_order: number;
  created_at: string;
}

export interface ExamSession {
  id: string;
  user_id: string;
  mode: SessionMode;
  status: SessionStatus;
  title: string | null;
  category_filter: string[] | null;
  time_limit_seconds: number | null;
  elapsed_seconds: number;
  current_ability: number;
  total_questions: number;
  correct_count: number;
  score_percentage: number | null;
  readiness_low: number | null;
  readiness_high: number | null;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  session_id: string | null;
  category_id: string | null;
  mode: SessionMode;
  questions_answered: number;
  points_earned: number;
  points_possible: number;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface Answer {
  id: string;
  user_id: string;
  attempt_id: string | null;
  session_id: string | null;
  question_id: string;
  response_payload: Record<string, unknown>;
  points_earned: number;
  points_possible: number;
  is_correct: boolean;
  time_spent_seconds: number;
  client_sync_id: string | null;
  answered_at: string;
  updated_at: string;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  source: 'diagnostic' | 'retake' | 'manual';
  exam_date: string | null;
  weekly_hours: number;
  daily_question_goal: number;
  focus_categories: unknown[];
  schedule_blocks: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  billing_period: BillingPeriod;
  status: SubscriptionStatus;
  provider: 'revenuecat' | 'manual' | 'promo';
  rc_customer_id: string | null;
  rc_entitlement_id: string | null;
  currency_code: string;
  region_tier: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutcomeReport {
  id: string;
  user_id: string;
  exam_date: string;
  target_state: string | null;
  outcome: ExamOutcome;
  questions_stopped_at: number | null;
  weak_categories: unknown[];
  notes: string | null;
  reported_at: string;
  updated_at: string;
}
