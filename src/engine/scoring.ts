/**
 * Pure scoring functions for every NCLEX item type × scoring rule.
 * No React Native or Supabase dependency — fully unit-testable.
 */

import type { QuestionOption } from '../types/database';
import type { QuestionScoringRule } from '../types/database';
import type {
  QuestionResponse,
  ScoreResult,
  QuestionWithOptions,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────

function correctKeys(options: QuestionOption[]): Set<string> {
  return new Set(options.filter((o) => o.is_correct).map((o) => o.option_key));
}

function correctOrder(options: QuestionOption[]): string[] {
  return options
    .filter((o) => o.correct_order != null)
    .sort((a, b) => (a.correct_order ?? 0) - (b.correct_order ?? 0))
    .map((o) => o.option_key);
}

function emptyFeedback(
  options: QuestionOption[],
): Record<string, 'correct' | 'incorrect' | 'missed' | 'neutral'> {
  const fb: Record<string, 'correct' | 'incorrect' | 'missed' | 'neutral'> = {};
  for (const o of options) {
    fb[o.option_key] = 'neutral';
  }
  return fb;
}

// ─── MC (dichotomous) ───────────────────────────────────────────────

function scoreMC(
  response: { selected: string },
  options: QuestionOption[],
): ScoreResult {
  const correct = correctKeys(options);
  const isCorrect = correct.has(response.selected);

  const feedback = emptyFeedback(options);
  for (const key of correct) feedback[key] = 'correct';
  if (!isCorrect) {
    feedback[response.selected] = 'incorrect';
  }

  return {
    pointsEarned: isCorrect ? 1 : 0,
    pointsPossible: 1,
    isCorrect,
    optionFeedback: feedback,
  };
}

// ─── SATA ───────────────────────────────────────────────────────────

function scoreSATADichotomous(
  selected: string[],
  options: QuestionOption[],
): ScoreResult {
  const correct = correctKeys(options);
  const selectedSet = new Set(selected);
  const allRight =
    correct.size === selectedSet.size &&
    [...correct].every((k) => selectedSet.has(k));

  const feedback = emptyFeedback(options);
  for (const o of options) {
    const wasSelected = selectedSet.has(o.option_key);
    if (o.is_correct && wasSelected) feedback[o.option_key] = 'correct';
    else if (o.is_correct && !wasSelected) feedback[o.option_key] = 'missed';
    else if (!o.is_correct && wasSelected) feedback[o.option_key] = 'incorrect';
  }

  return {
    pointsEarned: allRight ? 1 : 0,
    pointsPossible: 1,
    isCorrect: allRight,
    optionFeedback: feedback,
  };
}

function scoreSATAPlusMinus(
  selected: string[],
  options: QuestionOption[],
  maxPoints: number,
): ScoreResult {
  const correct = correctKeys(options);
  const selectedSet = new Set(selected);
  let points = 0;

  const feedback = emptyFeedback(options);
  for (const o of options) {
    const wasSelected = selectedSet.has(o.option_key);
    if (o.is_correct && wasSelected) {
      points += 1;
      feedback[o.option_key] = 'correct';
    } else if (o.is_correct && !wasSelected) {
      points -= 1;
      feedback[o.option_key] = 'missed';
    } else if (!o.is_correct && wasSelected) {
      points -= 1;
      feedback[o.option_key] = 'incorrect';
    }
  }

  // Floor at 0
  const earned = Math.max(0, Math.min(points, maxPoints));
  return {
    pointsEarned: earned,
    pointsPossible: maxPoints,
    isCorrect: earned === maxPoints,
    optionFeedback: feedback,
  };
}

function scoreSATAZeroOne(
  selected: string[],
  options: QuestionOption[],
  maxPoints: number,
): ScoreResult {
  const correct = correctKeys(options);
  const selectedSet = new Set(selected);
  let correctCount = 0;

  const feedback = emptyFeedback(options);
  for (const o of options) {
    const wasSelected = selectedSet.has(o.option_key);
    if (o.is_correct && wasSelected) {
      correctCount += 1;
      feedback[o.option_key] = 'correct';
    } else if (o.is_correct && !wasSelected) {
      feedback[o.option_key] = 'missed';
    } else if (!o.is_correct && wasSelected) {
      feedback[o.option_key] = 'incorrect';
    }
  }

  // Any wrong selection → 0
  const hasWrong = selected.some((k) => !correct.has(k));
  const earned = hasWrong ? 0 : Math.min(correctCount, maxPoints);

  return {
    pointsEarned: earned,
    pointsPossible: maxPoints,
    isCorrect: earned === maxPoints,
    optionFeedback: feedback,
  };
}

// ─── Ordered Response ───────────────────────────────────────────────

function scoreOrdered(
  userOrder: string[],
  options: QuestionOption[],
  rule: QuestionScoringRule,
  maxPoints: number,
): ScoreResult {
  const expected = correctOrder(options);
  const feedback = emptyFeedback(options);

  if (rule === 'dichotomous') {
    const isCorrect =
      expected.length === userOrder.length &&
      expected.every((k, i) => k === userOrder[i]);

    for (let i = 0; i < userOrder.length; i++) {
      feedback[userOrder[i]] =
        i < expected.length && userOrder[i] === expected[i]
          ? 'correct'
          : 'incorrect';
    }

    return {
      pointsEarned: isCorrect ? maxPoints : 0,
      pointsPossible: maxPoints,
      isCorrect,
      optionFeedback: feedback,
    };
  }

  // Partial credit: count consecutively correct from the top
  let consecutive = 0;
  for (let i = 0; i < Math.min(expected.length, userOrder.length); i++) {
    if (userOrder[i] === expected[i]) {
      consecutive += 1;
      feedback[userOrder[i]] = 'correct';
    } else {
      feedback[userOrder[i]] = 'incorrect';
      break;
    }
  }

  const earned = Math.round(
    (consecutive / expected.length) * maxPoints,
  );

  return {
    pointsEarned: earned,
    pointsPossible: maxPoints,
    isCorrect: consecutive === expected.length,
    optionFeedback: feedback,
  };
}

// ─── Matrix ─────────────────────────────────────────────────────────

function scoreMatrix(
  selections: Record<string, string>,
  options: QuestionOption[],
  rule: QuestionScoringRule,
  maxPoints: number,
): ScoreResult {
  const feedback = emptyFeedback(options);

  // Each option represents a row; metadata.correct_column holds the right answer
  let correctCount = 0;
  let totalRows = 0;

  for (const o of options) {
    const correctCol = (o.metadata as Record<string, unknown>)?.correct_column as string | undefined;
    if (!correctCol) continue;
    totalRows += 1;

    const userPick = selections[o.option_key];
    if (userPick === correctCol) {
      correctCount += 1;
      feedback[o.option_key] = 'correct';
    } else {
      feedback[o.option_key] = userPick ? 'incorrect' : 'missed';
    }
  }

  if (totalRows === 0) {
    return { pointsEarned: 0, pointsPossible: maxPoints, isCorrect: false, optionFeedback: feedback };
  }

  if (rule === 'dichotomous') {
    const allCorrect = correctCount === totalRows;
    return {
      pointsEarned: allCorrect ? maxPoints : 0,
      pointsPossible: maxPoints,
      isCorrect: allCorrect,
      optionFeedback: feedback,
    };
  }

  const earned = Math.round((correctCount / totalRows) * maxPoints);
  return {
    pointsEarned: earned,
    pointsPossible: maxPoints,
    isCorrect: correctCount === totalRows,
    optionFeedback: feedback,
  };
}

// ─── Hot Spot ───────────────────────────────────────────────────────

function scoreHotSpot(
  selected: string,
  options: QuestionOption[],
): ScoreResult {
  // Same as MC — one correct region
  return scoreMC({ selected }, options);
}

// ─── Bowtie (rationale triad scoring) ───────────────────────────────

function scoreBowtie(
  response: { center: string; left: string[]; right: string[] },
  options: QuestionOption[],
  maxPoints: number,
): ScoreResult {
  const feedback = emptyFeedback(options);

  // Options are tagged with metadata.bowtie_zone: 'center' | 'left' | 'right'
  const zones: Record<string, QuestionOption[]> = { center: [], left: [], right: [] };
  for (const o of options) {
    const zone = (o.metadata as Record<string, unknown>)?.bowtie_zone as string;
    if (zone && zones[zone]) zones[zone].push(o);
  }

  // Center: dichotomous
  const centerCorrect = zones.center.find((o) => o.is_correct);
  const centerRight = centerCorrect?.option_key === response.center;
  if (centerCorrect) {
    feedback[centerCorrect.option_key] = centerRight ? 'correct' : 'missed';
  }
  if (!centerRight && response.center) {
    feedback[response.center] = 'incorrect';
  }

  // Left and right: partial
  let partialPoints = centerRight ? 1 : 0;
  const totalParts = 3; // center + left + right

  for (const zone of ['left', 'right'] as const) {
    const zoneOptions = zones[zone];
    const correctSet = new Set(zoneOptions.filter((o) => o.is_correct).map((o) => o.option_key));
    const userSet = new Set(response[zone]);

    let zoneCorrect = 0;
    for (const o of zoneOptions) {
      const wasSelected = userSet.has(o.option_key);
      if (o.is_correct && wasSelected) {
        zoneCorrect += 1;
        feedback[o.option_key] = 'correct';
      } else if (o.is_correct && !wasSelected) {
        feedback[o.option_key] = 'missed';
      } else if (!o.is_correct && wasSelected) {
        feedback[o.option_key] = 'incorrect';
      }
    }

    if (correctSet.size > 0 && zoneCorrect === correctSet.size && !response[zone].some((k) => !correctSet.has(k))) {
      partialPoints += 1;
    }
  }

  const earned = Math.round((partialPoints / totalParts) * maxPoints);

  return {
    pointsEarned: earned,
    pointsPossible: maxPoints,
    isCorrect: partialPoints === totalParts,
    optionFeedback: feedback,
  };
}

// ─── Main Scorer ────────────────────────────────────────────────────

export function scoreAnswer(
  question: QuestionWithOptions,
  response: QuestionResponse,
): ScoreResult {
  const { options, scoring_rule, max_points, item_type } = question;

  switch (item_type) {
    case 'multiple_choice': {
      if (response.type !== 'multiple_choice') break;
      return scoreMC(response, options);
    }

    case 'sata': {
      if (response.type !== 'sata') break;
      if (scoring_rule === 'dichotomous') return scoreSATADichotomous(response.selected, options);
      if (scoring_rule === 'polytomous_plus_minus') return scoreSATAPlusMinus(response.selected, options, max_points);
      return scoreSATAZeroOne(response.selected, options, max_points);
    }

    case 'ordered_response': {
      if (response.type !== 'ordered_response') break;
      return scoreOrdered(response.order, options, scoring_rule, max_points);
    }

    case 'matrix': {
      if (response.type !== 'matrix') break;
      return scoreMatrix(response.selections, options, scoring_rule, max_points);
    }

    case 'hot_spot': {
      if (response.type !== 'hot_spot') break;
      return scoreHotSpot(response.selected, options);
    }

    case 'bowtie': {
      if (response.type !== 'bowtie') break;
      return scoreBowtie(response, options, max_points);
    }

    case 'case_study': {
      // Case study delegates to the inner response type
      if (response.type !== 'case_study') break;
      // Recursively score the inner step — the question's options
      // are for the current step of the case
      return scoreAnswer(question, response.inner);
    }

    default:
      break;
  }

  // Fallback: type mismatch
  return {
    pointsEarned: 0,
    pointsPossible: max_points,
    isCorrect: false,
    optionFeedback: emptyFeedback(options),
  };
}
