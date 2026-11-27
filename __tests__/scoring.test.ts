/**
 * Tests for the scoring engine — covers every item type × scoring rule.
 */

import { scoreAnswer } from '../src/engine/scoring';
import { createPlaceholderPool } from '../src/engine/placeholderPool';
import type { QuestionWithOptions } from '../src/engine/types';

// Build the pool once
let pool: QuestionWithOptions[];
beforeAll(() => {
  pool = createPlaceholderPool();
});

function findByType(type: string): QuestionWithOptions {
  const q = pool.find((q) => q.item_type === type);
  if (!q) throw new Error(`No question of type ${type} in pool`);
  return q;
}

function findByTopic(topic: string): QuestionWithOptions {
  const q = pool.find((q) => q.topic === topic);
  if (!q) throw new Error(`No question with topic "${topic}" in pool`);
  return q;
}

// ─── Multiple Choice ────────────────────────────────────────────────

describe('MC scoring (dichotomous)', () => {
  it('awards 1 point for correct answer', () => {
    const q = findByType('multiple_choice');
    const correctKey = q.options.find((o) => o.is_correct)!.option_key;
    const result = scoreAnswer(q, { type: 'multiple_choice', selected: correctKey });
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(1);
    expect(result.pointsPossible).toBe(1);
  });

  it('awards 0 points for wrong answer', () => {
    const q = findByType('multiple_choice');
    const wrongKey = q.options.find((o) => !o.is_correct)!.option_key;
    const result = scoreAnswer(q, { type: 'multiple_choice', selected: wrongKey });
    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });

  it('marks correct option as correct in feedback', () => {
    const q = findByType('multiple_choice');
    const correctKey = q.options.find((o) => o.is_correct)!.option_key;
    const result = scoreAnswer(q, { type: 'multiple_choice', selected: correctKey });
    expect(result.optionFeedback[correctKey]).toBe('correct');
  });
});

// ─── SATA ───────────────────────────────────────────────────────────

describe('SATA scoring', () => {
  it('dichotomous: all correct → 1 point', () => {
    const q = findByTopic('Standard precautions');
    const correctKeys = q.options.filter((o) => o.is_correct).map((o) => o.option_key);
    const result = scoreAnswer(q, { type: 'sata', selected: correctKeys });
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(1);
  });

  it('dichotomous: missing one → 0 points', () => {
    const q = findByTopic('Standard precautions');
    const correctKeys = q.options.filter((o) => o.is_correct).map((o) => o.option_key);
    const result = scoreAnswer(q, { type: 'sata', selected: correctKeys.slice(0, -1) });
    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });

  it('polytomous_plus_minus: partial credit for some correct', () => {
    const q = findByTopic('Informed consent');
    // Pick 2 of 3 correct + 0 wrong
    const correctKeys = q.options.filter((o) => o.is_correct).map((o) => o.option_key);
    const result = scoreAnswer(q, { type: 'sata', selected: correctKeys.slice(0, 2) });
    expect(result.pointsEarned).toBeGreaterThan(0);
    expect(result.pointsEarned).toBeLessThan(q.max_points);
  });

  it('polytomous_plus_minus: selecting wrong option reduces score', () => {
    const q = findByTopic('Informed consent');
    const allKeys = q.options.map((o) => o.option_key);
    const result = scoreAnswer(q, { type: 'sata', selected: allKeys });
    // Selecting wrong options deducts, so should be less than max
    expect(result.pointsEarned).toBeLessThan(q.max_points);
  });
});

// ─── Ordered Response ───────────────────────────────────────────────

describe('Ordered response scoring', () => {
  it('correct order → full points', () => {
    const q = findByTopic('Priority setting');
    const correctOrder = q.options
      .filter((o) => o.correct_order != null)
      .sort((a, b) => (a.correct_order ?? 0) - (b.correct_order ?? 0))
      .map((o) => o.option_key);

    const result = scoreAnswer(q, { type: 'ordered_response', order: correctOrder });
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(q.max_points);
  });

  it('reversed order → 0 or partial points', () => {
    const q = findByTopic('Priority setting');
    const correctOrder = q.options
      .filter((o) => o.correct_order != null)
      .sort((a, b) => (a.correct_order ?? 0) - (b.correct_order ?? 0))
      .map((o) => o.option_key);

    const reversed = [...correctOrder].reverse();
    const result = scoreAnswer(q, { type: 'ordered_response', order: reversed });
    expect(result.isCorrect).toBe(false);
  });
});

// ─── Matrix ─────────────────────────────────────────────────────────

describe('Matrix scoring', () => {
  it('all rows correct → full points', () => {
    const q = findByTopic('Newborn assessment');
    const selections: Record<string, string> = {};
    for (const o of q.options) {
      const col = (o.metadata as Record<string, unknown>)?.correct_column as string;
      if (col) selections[o.option_key] = col;
    }

    const result = scoreAnswer(q, { type: 'matrix', selections });
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(q.max_points);
  });

  it('wrong row selections → partial or 0 points', () => {
    const q = findByTopic('Newborn assessment');
    const selections: Record<string, string> = {};
    for (const o of q.options) {
      // Pick the wrong column
      const col = (o.metadata as Record<string, unknown>)?.correct_column as string;
      selections[o.option_key] = col === 'Normal' ? 'Abnormal' : 'Normal';
    }

    const result = scoreAnswer(q, { type: 'matrix', selections });
    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });
});

// ─── Hot Spot ───────────────────────────────────────────────────────

describe('Hot spot scoring', () => {
  it('correct region → 1 point', () => {
    const q = findByTopic('Isolation precautions');
    const correctKey = q.options.find((o) => o.is_correct)!.option_key;
    const result = scoreAnswer(q, { type: 'hot_spot', selected: correctKey });
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(1);
  });

  it('wrong region → 0 points', () => {
    const q = findByTopic('Isolation precautions');
    const wrongKey = q.options.find((o) => !o.is_correct)!.option_key;
    const result = scoreAnswer(q, { type: 'hot_spot', selected: wrongKey });
    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });
});

// ─── Bowtie ─────────────────────────────────────────────────────────

describe('Bowtie scoring (rationale triad)', () => {
  it('all zones correct → full points', () => {
    const q = findByTopic('Shock management');
    const result = scoreAnswer(q, {
      type: 'bowtie',
      center: 'C1',
      left: ['L1', 'L2'],
      right: ['P1', 'P2'],
    });
    expect(result.isCorrect).toBe(true);
    expect(result.pointsEarned).toBe(q.max_points);
  });

  it('wrong center → reduced score', () => {
    const q = findByTopic('Shock management');
    const result = scoreAnswer(q, {
      type: 'bowtie',
      center: 'C2', // wrong
      left: ['L1', 'L2'],
      right: ['P1', 'P2'],
    });
    expect(result.isCorrect).toBe(false);
    expect(result.pointsEarned).toBeLessThan(q.max_points);
  });

  it('partially correct zones → partial credit', () => {
    const q = findByTopic('Shock management');
    const result = scoreAnswer(q, {
      type: 'bowtie',
      center: 'C1',
      left: ['L1', 'L3'], // one correct, one wrong
      right: ['P1', 'P2'],
    });
    expect(result.pointsEarned).toBeGreaterThan(0);
    expect(result.pointsEarned).toBeLessThan(q.max_points);
  });
});

// ─── Type mismatch fallback ─────────────────────────────────────────

describe('Type mismatch', () => {
  it('returns 0 points when response type does not match question', () => {
    const q = findByType('multiple_choice');
    const result = scoreAnswer(q, { type: 'sata', selected: ['A'] });
    expect(result.pointsEarned).toBe(0);
    expect(result.isCorrect).toBe(false);
  });
});
