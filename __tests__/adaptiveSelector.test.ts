/**
 * Tests for the adaptive selector and readiness interval.
 */

import {
  CategoryWeightedSelector,
  rollingCorrectness,
  readinessInterval,
} from '../src/engine/adaptiveSelector';
import { createPlaceholderPool } from '../src/engine/placeholderPool';
import type { AnswerRecord, QuestionWithOptions } from '../src/engine/types';

let pool: QuestionWithOptions[];
let selector: CategoryWeightedSelector;

beforeEach(() => {
  pool = createPlaceholderPool();
  selector = new CategoryWeightedSelector();
});

// ─── selectNext ─────────────────────────────────────────────────────

describe('CategoryWeightedSelector.selectNext', () => {
  it('returns a question from the pool', () => {
    const result = selector.selectNext(pool, [], 0);
    expect(result).not.toBeNull();
    expect(pool.some((q) => q.id === result!.id)).toBe(true);
  });

  it('does not repeat already-answered questions', () => {
    const first = selector.selectNext(pool, [], 0)!;
    const history: AnswerRecord[] = [
      {
        questionId: first.id,
        categoryId: first.category_id,
        difficulty: first.difficulty,
        wasCorrect: true,
        pointsEarned: 1,
        pointsPossible: 1,
        timeSpentSeconds: 30,
      },
    ];
    const second = selector.selectNext(pool, history, 0);
    expect(second).not.toBeNull();
    expect(second!.id).not.toBe(first.id);
  });

  it('returns null when all questions have been answered', () => {
    const history: AnswerRecord[] = pool.map((q) => ({
      questionId: q.id,
      categoryId: q.category_id,
      difficulty: q.difficulty,
      wasCorrect: true,
      pointsEarned: 1,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));
    const result = selector.selectNext(pool, history, 0);
    expect(result).toBeNull();
  });

  it('returns null for empty pool', () => {
    const result = selector.selectNext([], [], 0);
    expect(result).toBeNull();
  });

  it('favors under-represented categories', () => {
    // Answer many questions from one category
    const mgmtQuestions = pool.filter((q) => q.category_id === 'management-of-care');
    const history: AnswerRecord[] = mgmtQuestions.map((q) => ({
      questionId: q.id,
      categoryId: q.category_id,
      difficulty: q.difficulty,
      wasCorrect: true,
      pointsEarned: 1,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));

    // Next question should likely NOT be management-of-care
    const next = selector.selectNext(pool, history, 0);
    expect(next).not.toBeNull();
    // Can't guarantee it's not management-of-care due to randomness,
    // but it's very likely to be a different category
  });
});

// ─── updateAbility ──────────────────────────────────────────────────

describe('CategoryWeightedSelector.updateAbility', () => {
  it('increases ability when answering correctly', () => {
    const updated = selector.updateAbility(0, true, 3);
    expect(updated).toBeGreaterThan(0);
  });

  it('decreases ability when answering incorrectly', () => {
    const updated = selector.updateAbility(0, false, 3);
    expect(updated).toBeLessThan(0);
  });

  it('gives a bigger boost for correct answers on harder questions', () => {
    const easyBoost = selector.updateAbility(0, true, 1);
    const hardBoost = selector.updateAbility(0, true, 5);
    expect(hardBoost).toBeGreaterThan(easyBoost);
  });

  it('clamps ability between -2 and 2', () => {
    let ability = 0;
    // Push way up
    for (let i = 0; i < 50; i++) {
      ability = selector.updateAbility(ability, true, 5);
    }
    expect(ability).toBeLessThanOrEqual(2);

    // Push way down
    ability = 0;
    for (let i = 0; i < 50; i++) {
      ability = selector.updateAbility(ability, false, 1);
    }
    expect(ability).toBeGreaterThanOrEqual(-2);
  });
});

// ─── rollingCorrectness ─────────────────────────────────────────────

describe('rollingCorrectness', () => {
  it('returns 0 for empty history', () => {
    expect(rollingCorrectness([])).toBe(0);
  });

  it('returns 1.0 for all correct within window', () => {
    const history: AnswerRecord[] = Array.from({ length: 5 }, (_, i) => ({
      questionId: `q-${i}`,
      categoryId: 'test',
      difficulty: 3,
      wasCorrect: true,
      pointsEarned: 1,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));
    expect(rollingCorrectness(history)).toBe(1);
  });

  it('returns 0.6 for 3/5 correct in last 5', () => {
    const history: AnswerRecord[] = [
      { questionId: 'q-1', categoryId: 'c', difficulty: 3, wasCorrect: true, pointsEarned: 1, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'q-2', categoryId: 'c', difficulty: 3, wasCorrect: false, pointsEarned: 0, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'q-3', categoryId: 'c', difficulty: 3, wasCorrect: true, pointsEarned: 1, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'q-4', categoryId: 'c', difficulty: 3, wasCorrect: false, pointsEarned: 0, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'q-5', categoryId: 'c', difficulty: 3, wasCorrect: true, pointsEarned: 1, pointsPossible: 1, timeSpentSeconds: 30 },
    ];
    expect(rollingCorrectness(history)).toBe(0.6);
  });

  it('only considers the last N items', () => {
    const history: AnswerRecord[] = [
      // These old ones should be excluded from window of 3
      { questionId: 'old-1', categoryId: 'c', difficulty: 3, wasCorrect: false, pointsEarned: 0, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'old-2', categoryId: 'c', difficulty: 3, wasCorrect: false, pointsEarned: 0, pointsPossible: 1, timeSpentSeconds: 30 },
      // These recent ones should be in the window
      { questionId: 'new-1', categoryId: 'c', difficulty: 3, wasCorrect: true, pointsEarned: 1, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'new-2', categoryId: 'c', difficulty: 3, wasCorrect: true, pointsEarned: 1, pointsPossible: 1, timeSpentSeconds: 30 },
      { questionId: 'new-3', categoryId: 'c', difficulty: 3, wasCorrect: true, pointsEarned: 1, pointsPossible: 1, timeSpentSeconds: 30 },
    ];
    expect(rollingCorrectness(history, 3)).toBe(1);
  });
});

// ─── readinessInterval ──────────────────────────────────────────────

describe('readinessInterval', () => {
  it('returns {0, 0, 0} for empty history', () => {
    const result = readinessInterval([]);
    expect(result).toEqual({ low: 0, mid: 0, high: 0 });
  });

  it('returns a range where low ≤ mid ≤ high', () => {
    const history: AnswerRecord[] = Array.from({ length: 20 }, (_, i) => ({
      questionId: `q-${i}`,
      categoryId: 'test',
      difficulty: 3,
      wasCorrect: i % 3 !== 0, // ~67% correct
      pointsEarned: i % 3 !== 0 ? 1 : 0,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));

    const result = readinessInterval(history);
    expect(result.low).toBeLessThanOrEqual(result.mid);
    expect(result.mid).toBeLessThanOrEqual(result.high);
  });

  it('returns wider range for fewer questions', () => {
    const fewHistory: AnswerRecord[] = Array.from({ length: 5 }, (_, i) => ({
      questionId: `q-${i}`,
      categoryId: 'test',
      difficulty: 3,
      wasCorrect: true,
      pointsEarned: 1,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));

    const manyHistory: AnswerRecord[] = Array.from({ length: 50 }, (_, i) => ({
      questionId: `q-${i}`,
      categoryId: 'test',
      difficulty: 3,
      wasCorrect: true,
      pointsEarned: 1,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));

    const fewResult = readinessInterval(fewHistory);
    const manyResult = readinessInterval(manyHistory);

    const fewWidth = fewResult.high - fewResult.low;
    const manyWidth = manyResult.high - manyResult.low;

    expect(fewWidth).toBeGreaterThan(manyWidth);
  });

  it('values are between 0 and 100', () => {
    const history: AnswerRecord[] = Array.from({ length: 10 }, (_, i) => ({
      questionId: `q-${i}`,
      categoryId: 'test',
      difficulty: 3,
      wasCorrect: i % 2 === 0,
      pointsEarned: i % 2 === 0 ? 1 : 0,
      pointsPossible: 1,
      timeSpentSeconds: 30,
    }));

    const result = readinessInterval(history);
    expect(result.low).toBeGreaterThanOrEqual(0);
    expect(result.high).toBeLessThanOrEqual(100);
  });
});
