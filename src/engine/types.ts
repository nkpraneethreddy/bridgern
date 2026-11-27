/**
 * Response payload types for each NCLEX item type.
 * These define the shape of `response_payload` stored in the `answers` table.
 */

/** Multiple choice — user picks one option key */
export interface MCResponse {
  type: 'multiple_choice';
  selected: string; // option_key
}

/** Select All That Apply — user picks one or more option keys */
export interface SATAResponse {
  type: 'sata';
  selected: string[]; // option_keys
}

/** Matrix / Grid — user assigns a value to each row */
export interface MatrixResponse {
  type: 'matrix';
  selections: Record<string, string>; // row_key → column_key
}

/** Drag-and-drop ordering — user arranges option keys in order */
export interface OrderedResponse {
  type: 'ordered_response';
  order: string[]; // option_keys in user's chosen order
}

/** Hot spot — user taps coordinates on an image */
export interface HotSpotResponse {
  type: 'hot_spot';
  selected: string; // option_key of the tapped region
}

/**
 * Bowtie — NGN item: user picks one center (condition), then
 * actions on the left and parameters on the right.
 */
export interface BowtieResponse {
  type: 'bowtie';
  center: string;        // condition option_key
  left: string[];        // action option_keys
  right: string[];       // parameter option_keys
}

/** Case study step — wraps any of the above for one step within a case */
export interface CaseStudyStepResponse {
  type: 'case_study';
  step: number;
  inner: QuestionResponse;
}

export type QuestionResponse =
  | MCResponse
  | SATAResponse
  | MatrixResponse
  | OrderedResponse
  | HotSpotResponse
  | BowtieResponse
  | CaseStudyStepResponse;

/**
 * A question with its options pre-loaded — the working unit
 * the engine and UI both consume.
 */
import type { Question, QuestionOption } from '../types/database';

export interface QuestionWithOptions extends Question {
  options: QuestionOption[];
}

/**
 * Result of scoring a single answer.
 */
export interface ScoreResult {
  pointsEarned: number;
  pointsPossible: number;
  isCorrect: boolean;
  /** Per-option correctness feedback for tutor mode */
  optionFeedback: Record<string, 'correct' | 'incorrect' | 'missed' | 'neutral'>;
}

/**
 * Adaptive selector interface — allows swapping the simple
 * category-weighted selector for an IRT model later.
 */
export interface ItemSelector {
  /** Pick the next question from the available pool */
  selectNext(
    pool: QuestionWithOptions[],
    history: AnswerRecord[],
    currentAbility: number,
  ): QuestionWithOptions | null;

  /** Update estimated ability after an answer */
  updateAbility(
    currentAbility: number,
    wasCorrect: boolean,
    difficulty: number,
  ): number;
}

/** Minimal record of a past answer within a session */
export interface AnswerRecord {
  questionId: string;
  categoryId: string;
  difficulty: number;
  wasCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  timeSpentSeconds: number;
}

/**
 * Session configuration passed when starting a practice session.
 */
export interface SessionConfig {
  mode: 'tutor' | 'exam';
  /** Max questions (exam mode: 75-145, tutor: user-chosen or unlimited) */
  maxQuestions: number;
  /** Time limit in seconds (exam mode only, 0 = no limit) */
  timeLimitSeconds: number;
  /** Filter to specific categories (empty = all) */
  categoryFilter: string[];
  /** Starting difficulty (1-5, default 3) */
  startingDifficulty: number;
}
