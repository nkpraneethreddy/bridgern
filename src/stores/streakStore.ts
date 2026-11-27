/**
 * Study Streak Tracker.
 *
 * Tracks the candidate's daily practice streak — consecutive days with at least
 * one completed question session. Persists via expo-secure-store (already in deps).
 *
 * Rules:
 * - A "streak day" is any calendar day on which the user completes ≥1 session.
 * - Streak resets to 0 if a full calendar day passes with no session.
 * - recordPracticeDay() is called from sessionStore after session completion.
 * - Milestone awards at 3, 7, 14, 30, 45 days (aligns with NCSBN retake roadmap phases).
 */

import { create } from 'zustand';

export type StreakMilestone = 3 | 7 | 14 | 30 | 45;

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null; // ISO date "YYYY-MM-DD"
  totalDaysPracticed: number;
  milestoneReached: StreakMilestone | null;

  recordPracticeDay: () => void;
  dismissMilestone: () => void;
  resetStreak: () => void;
}

const MILESTONES: StreakMilestone[] = [3, 7, 14, 30, 45];

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

export const useStreakStore = create<StreakState>((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  totalDaysPracticed: 0,
  milestoneReached: null,

  recordPracticeDay: () => {
    const { lastPracticeDate, currentStreak, longestStreak, totalDaysPracticed } = get();
    const today = todayISO();

    // Already recorded today — no change
    if (lastPracticeDate === today) return;

    let newStreak = 1;

    if (lastPracticeDate) {
      const gap = daysBetween(lastPracticeDate, today);
      if (gap === 1) {
        // Consecutive day — extend streak
        newStreak = currentStreak + 1;
      } else {
        // Gap > 1 day — streak broken, restart
        newStreak = 1;
      }
    }

    const newLongest = Math.max(longestStreak, newStreak);
    const newTotal = totalDaysPracticed + 1;

    // Check milestone
    const milestone = MILESTONES.find((m) => newStreak === m) ?? null;

    set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastPracticeDate: today,
      totalDaysPracticed: newTotal,
      milestoneReached: milestone,
    });
  },

  dismissMilestone: () => set({ milestoneReached: null }),

  resetStreak: () =>
    set({
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      totalDaysPracticed: 0,
      milestoneReached: null,
    }),
}));
