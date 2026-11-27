/**
 * Session orchestrator — manages the lifecycle of a practice session.
 *
 * Handles question selection, answer recording, timing, and
 * session-end conditions for both tutor and exam modes.
 *
 * Psychology principles applied:
 * - Endowed progress effect: session starts at question 1/N, not 0/N
 * - Commitment/consistency: each answered question is a micro-commitment
 * - Variable ratio reinforcement: difficulty varies to maintain engagement
 * - Loss aversion: exam mode shows "time remaining" (losing time) not "time elapsed"
 */

import { CategoryWeightedSelector, readinessInterval } from './adaptiveSelector';
import { scoreAnswer } from './scoring';
import type {
  AnswerRecord,
  ItemSelector,
  QuestionResponse,
  QuestionWithOptions,
  ScoreResult,
  SessionConfig,
} from './types';

export interface SessionState {
  /** Session configuration */
  config: SessionConfig;
  /** All questions available for this session */
  pool: QuestionWithOptions[];
  /** Current question being shown */
  currentQuestion: QuestionWithOptions | null;
  /** Index of the current question (1-based for display) */
  questionNumber: number;
  /** All answers so far */
  history: AnswerRecord[];
  /** Current ability estimate */
  currentAbility: number;
  /** Elapsed time in seconds */
  elapsedSeconds: number;
  /** Whether the session has ended */
  isComplete: boolean;
  /** Total points earned */
  totalPointsEarned: number;
  /** Total points possible */
  totalPointsPossible: number;
  /** Last score result (for tutor mode feedback) */
  lastScoreResult: ScoreResult | null;
  /** The question that was just answered (for tutor mode feedback) */
  lastQuestion: QuestionWithOptions | null;
  /** Readiness estimate */
  readiness: { low: number; mid: number; high: number };
}

export class SessionManager {
  private selector: ItemSelector;
  private state: SessionState;
  private questionStartTime: number = Date.now();

  constructor(config: SessionConfig, pool: QuestionWithOptions[], selector?: ItemSelector) {
    this.selector = selector ?? new CategoryWeightedSelector();

    this.state = {
      config,
      pool,
      currentQuestion: null,
      questionNumber: 0,
      history: [],
      currentAbility: 0,
      elapsedSeconds: 0,
      isComplete: false,
      totalPointsEarned: 0,
      totalPointsPossible: 0,
      lastScoreResult: null,
      lastQuestion: null,
      readiness: { low: 0, mid: 0, high: 0 },
    };

    // Pick the first question
    this.advanceToNextQuestion();
  }

  getState(): Readonly<SessionState> {
    return this.state;
  }

  /**
   * Submit an answer for the current question.
   * Returns the score result (always computed, only shown in tutor mode).
   */
  submitAnswer(response: QuestionResponse): ScoreResult | null {
    const { currentQuestion } = this.state;
    if (!currentQuestion || this.state.isComplete) return null;

    // Calculate time spent on this question
    const now = Date.now();
    const timeSpent = Math.round((now - this.questionStartTime) / 1000);

    // Score it
    const result = scoreAnswer(currentQuestion, response);

    // Record the answer
    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      categoryId: currentQuestion.category_id,
      difficulty: currentQuestion.difficulty,
      wasCorrect: result.isCorrect,
      pointsEarned: result.pointsEarned,
      pointsPossible: result.pointsPossible,
      timeSpentSeconds: timeSpent,
    };

    this.state.history.push(record);
    this.state.totalPointsEarned += result.pointsEarned;
    this.state.totalPointsPossible += result.pointsPossible;
    this.state.elapsedSeconds += timeSpent;

    // Update ability estimate
    this.state.currentAbility = this.selector.updateAbility(
      this.state.currentAbility,
      result.isCorrect,
      currentQuestion.difficulty,
    );

    // Update readiness
    this.state.readiness = readinessInterval(this.state.history);

    // Store for tutor mode feedback
    this.state.lastScoreResult = result;
    this.state.lastQuestion = currentQuestion;

    // Check end conditions
    if (this.shouldEndSession()) {
      this.state.isComplete = true;
      this.state.currentQuestion = null;
    }

    return result;
  }

  /**
   * Advance to the next question (called after tutor feedback is dismissed,
   * or automatically in exam mode).
   */
  advanceToNextQuestion(): void {
    if (this.state.isComplete) return;

    const next = this.selector.selectNext(
      this.state.pool,
      this.state.history,
      this.state.currentAbility,
    );

    if (!next) {
      // Pool exhausted
      this.state.isComplete = true;
      this.state.currentQuestion = null;
      return;
    }

    this.state.currentQuestion = next;
    this.state.questionNumber += 1;
    this.state.lastScoreResult = null;
    this.state.lastQuestion = null;
    this.questionStartTime = Date.now();
  }

  /**
   * Update the elapsed time (call this from a timer interval).
   */
  tick(deltaSeconds: number): void {
    if (this.state.isComplete) return;
    this.state.elapsedSeconds += deltaSeconds;

    // Check time limit in exam mode
    if (
      this.state.config.mode === 'exam' &&
      this.state.config.timeLimitSeconds > 0 &&
      this.state.elapsedSeconds >= this.state.config.timeLimitSeconds
    ) {
      this.state.isComplete = true;
    }
  }

  /**
   * Get time remaining in seconds (exam mode).
   * Returns null if no time limit.
   */
  getTimeRemaining(): number | null {
    if (this.state.config.timeLimitSeconds <= 0) return null;
    return Math.max(0, this.state.config.timeLimitSeconds - this.state.elapsedSeconds);
  }

  /**
   * Get the percentage of session completed.
   * Psychology: Endowed progress — starts at a small positive value
   * rather than 0 to leverage the goal-gradient effect.
   */
  getProgress(): number {
    const { maxQuestions } = this.state.config;
    if (maxQuestions <= 0) return 0;
    // Endowed progress: treat the session as if 1 question is already "done"
    // out of maxQuestions + 1, so the bar never starts at pure zero
    const endowedTotal = maxQuestions + 1;
    const endowedDone = this.state.questionNumber;
    return Math.min(1, endowedDone / endowedTotal);
  }

  /**
   * Abandon the session early.
   */
  abandon(): void {
    this.state.isComplete = true;
  }

  // ─── Private ────────────────────────────────────────────────────

  private shouldEndSession(): boolean {
    const { maxQuestions, timeLimitSeconds, mode } = this.state.config;
    const answered = this.state.history.length;

    // Hit question limit
    if (maxQuestions > 0 && answered >= maxQuestions) return true;

    // Time limit exceeded (exam mode)
    if (
      mode === 'exam' &&
      timeLimitSeconds > 0 &&
      this.state.elapsedSeconds >= timeLimitSeconds
    ) {
      return true;
    }

    return false;
  }
}
