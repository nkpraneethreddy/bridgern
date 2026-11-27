/**
 * Zustand store for the in-flight practice session.
 *
 * Wraps SessionManager and exposes reactive state to the UI.
 * Keeps the engine pure and the store thin.
 */

import { create } from 'zustand';
import { SessionManager, SessionState } from '../engine/sessionManager';
import type { QuestionResponse, QuestionWithOptions, ScoreResult, SessionConfig } from '../engine/types';
import { offlineStorage } from '../services/offlineStorage';
import { useOfflineStore } from './offlineStore';

interface SessionStoreState {
  /** The underlying session manager (null when no session active) */
  manager: SessionManager | null;
  /** Snapshot of session state for the UI */
  session: SessionState | null;
  /** Whether tutor feedback is currently being shown */
  showingFeedback: boolean;
  /** Timer interval ID */
  timerId: ReturnType<typeof setInterval> | null;

  /** Start a new session */
  startSession: (config: SessionConfig, pool: QuestionWithOptions[]) => void;
  /** Submit an answer for the current question */
  submitAnswer: (response: QuestionResponse) => ScoreResult | null;
  /** Dismiss tutor feedback and advance to next question */
  dismissFeedback: () => void;
  /** Abandon the current session */
  abandonSession: () => void;
  /** Clean up (stop timer, clear state) */
  cleanup: () => void;
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  manager: null,
  session: null,
  showingFeedback: false,
  timerId: null,

  startSession: (config, pool) => {
    // Clean up any existing session
    get().cleanup();

    const manager = new SessionManager(config, pool);

    // Start a timer for exam mode
    let timerId: ReturnType<typeof setInterval> | null = null;
    if (config.mode === 'exam' && config.timeLimitSeconds > 0) {
      timerId = setInterval(() => {
        const mgr = get().manager;
        if (!mgr) return;
        mgr.tick(1);
        set({ session: { ...mgr.getState() } });

        // Auto-end when time runs out
        if (mgr.getState().isComplete) {
          const tid = get().timerId;
          if (tid) clearInterval(tid);
          set({ timerId: null });
        }
      }, 1000);
    }

    set({
      manager,
      session: { ...manager.getState() },
      showingFeedback: false,
      timerId,
    });
  },

  submitAnswer: (response) => {
    const mgr = get().manager;
    if (!mgr) return null;

    const currentQ = mgr.getState().currentQuestion;
    const result = mgr.submitAnswer(response);
    const state = mgr.getState();

    // If offline or offline storage active, enqueue answer for sync
    if (result && currentQ) {
      offlineStorage.enqueueAnswer({
        userId: 'anonymous-learner',
        sessionId: 'local-session',
        questionId: currentQ.id,
        response,
        score: {
          pointsEarned: result.pointsEarned,
          pointsPossible: result.pointsPossible,
          isCorrect: result.isCorrect,
        },
        timeSpentSeconds: 45,
      });
      useOfflineStore.getState().updatePendingCount();
    }

    if (state.config.mode === 'tutor' && result && !state.isComplete) {
      // Tutor mode: show feedback before advancing
      set({ session: { ...state }, showingFeedback: true });
    } else {
      // Exam mode: advance immediately
      if (!state.isComplete) {
        mgr.advanceToNextQuestion();
      }
      set({ session: { ...mgr.getState() }, showingFeedback: false });
    }

    return result;
  },

  dismissFeedback: () => {
    const mgr = get().manager;
    if (!mgr) return;

    mgr.advanceToNextQuestion();
    set({
      session: { ...mgr.getState() },
      showingFeedback: false,
    });
  },

  abandonSession: () => {
    const mgr = get().manager;
    if (mgr) mgr.abandon();
    get().cleanup();
  },

  cleanup: () => {
    const tid = get().timerId;
    if (tid) clearInterval(tid);
    set({ manager: null, session: null, showingFeedback: false, timerId: null });
  },
}));
