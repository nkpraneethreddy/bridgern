/**
 * Category-weighted adaptive item selector.
 *
 * Strategy:
 * 1. Weight categories by NCLEX blueprint percentages.
 * 2. Prefer categories the user has answered fewer questions in.
 * 3. Within a category, pick a question near the target difficulty.
 * 4. Target difficulty rises/falls based on a rolling window of correctness.
 *
 * Designed behind the ItemSelector interface so it can be replaced
 * by an IRT (Item Response Theory) model in a later phase.
 *
 * Psychology: Vygotsky's Zone of Proximal Development — questions are
 * always slightly challenging but achievable, keeping the learner in
 * flow state rather than frustration or boredom.
 */

import type {
  ItemSelector,
  QuestionWithOptions,
  AnswerRecord,
} from './types';

/** How many recent answers to consider for difficulty adjustment */
const ROLLING_WINDOW = 5;

/** Step size for difficulty changes */
const DIFFICULTY_STEP = 0.6;

/** Minimum and maximum difficulty bounds */
const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

/**
 * Default blueprint weights for NCLEX-RN Client Needs categories.
 * Keys match the `slug` field in the categories table.
 */
const DEFAULT_WEIGHTS: Record<string, number> = {
  'management-of-care': 18,
  'safety-infection-control': 13,
  'health-promotion': 9,
  'psychosocial-integrity': 9,
  'basic-care-comfort': 9,
  'pharmacological-therapies': 16,
  'reduction-of-risk': 12,
  'physiological-adaptation': 14,
};

export class CategoryWeightedSelector implements ItemSelector {
  private categoryWeights: Record<string, number>;

  constructor(weights?: Record<string, number>) {
    this.categoryWeights = weights ?? DEFAULT_WEIGHTS;
  }

  selectNext(
    pool: QuestionWithOptions[],
    history: AnswerRecord[],
    currentAbility: number,
  ): QuestionWithOptions | null {
    if (pool.length === 0) return null;

    // Don't repeat questions already answered in this session
    const answeredIds = new Set(history.map((h) => h.questionId));
    const available = pool.filter((q) => !answeredIds.has(q.id));
    if (available.length === 0) return null;

    // Target difficulty based on current ability
    const targetDifficulty = Math.max(
      MIN_DIFFICULTY,
      Math.min(MAX_DIFFICULTY, Math.round(currentAbility + 3)),
    );

    // Count how many questions per category have been answered
    const categoryCount: Record<string, number> = {};
    for (const a of history) {
      categoryCount[a.categoryId] = (categoryCount[a.categoryId] ?? 0) + 1;
    }

    // Score each available question
    let bestScore = -Infinity;
    let bestQuestion: QuestionWithOptions | null = null;

    for (const q of available) {
      // Category weight — higher weight means more important
      const catWeight = this.categoryWeights[q.category_id] ?? 10;

      // Under-representation bonus: fewer answered → higher priority
      const answered = categoryCount[q.category_id] ?? 0;
      const underRepBonus = catWeight / (1 + answered);

      // Difficulty proximity — closer to target = better
      const diffDistance = Math.abs(q.difficulty - targetDifficulty);
      const diffScore = 5 - diffDistance;

      // Small random jitter to avoid deterministic ordering
      const jitter = Math.random() * 0.5;

      const totalScore = underRepBonus * 2 + diffScore + jitter;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestQuestion = q;
      }
    }

    return bestQuestion;
  }

  updateAbility(
    currentAbility: number,
    wasCorrect: boolean,
    difficulty: number,
  ): number {
    // Difficulty is 1-5; normalize to a -1 to +1 scale around 3
    const normalizedDiff = (difficulty - 3) / 2;

    // If correct on a hard question → bigger boost; wrong on easy → bigger drop
    const delta = wasCorrect
      ? DIFFICULTY_STEP * (1 + normalizedDiff * 0.3)
      : -DIFFICULTY_STEP * (1 - normalizedDiff * 0.3);

    const updated = currentAbility + delta;

    // Clamp to [-2, +2] range (maps to difficulty 1-5 via targetDifficulty)
    return Math.max(-2, Math.min(2, updated));
  }
}

/**
 * Compute a rolling correctness rate from recent answers.
 * Used to display momentum feedback in the UI.
 */
export function rollingCorrectness(
  history: AnswerRecord[],
  window: number = ROLLING_WINDOW,
): number {
  if (history.length === 0) return 0;
  const recent = history.slice(-window);
  const correct = recent.filter((a) => a.wasCorrect).length;
  return correct / recent.length;
}

/**
 * Estimate a readiness confidence interval.
 *
 * Uses a simple Wilson score interval on the correctness rate.
 * This gives honest confidence bounds rather than a false single number.
 *
 * Psychology: Anchoring with a range prevents overconfidence
 * while still rewarding progress.
 */
export function readinessInterval(
  history: AnswerRecord[],
): { low: number; mid: number; high: number } {
  const n = history.length;
  if (n === 0) return { low: 0, mid: 0, high: 0 };

  const correct = history.filter((a) => a.wasCorrect).length;
  const phat = correct / n;

  // Wilson score interval with z = 1.96 (95% CI)
  const z = 1.96;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (phat + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n)) / denom;

  return {
    low: Math.max(0, Math.round((center - margin) * 100)),
    mid: Math.round(center * 100),
    high: Math.min(100, Math.round((center + margin) * 100)),
  };
}
