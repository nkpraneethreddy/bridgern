/**
 * Study Plan generator and store.
 *
 * Implements Phase 3 dynamic study plan calculations based on:
 * - Diagnostic baseline readiness & weak Client Needs categories
 * - User's target exam date & runway (days remaining)
 * - Weekly study hour commitment
 * - Generates targeted daily question pacing and weekly focus blocks
 */

import { create } from 'zustand';

export interface CategoryBreakdown {
  category: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number; // 0 - 100
  status: 'below_passing' | 'near_passing' | 'above_passing';
}

export interface StudyPlan {
  id: string;
  source: 'diagnostic' | 'retake' | 'manual';
  examDate: string | null;
  daysRemaining: number;
  weeklyHours: number;
  dailyQuestionGoal: number;
  estimatedCompletionWeeks: number;
  focusCategories: string[];
  scheduleBlocks: {
    day: string;
    category: string;
    targetQuestions: number;
  }[];
  createdAt: string;
}

interface StudyPlanState {
  currentPlan: StudyPlan | null;
  diagnosticCompleted: boolean;
  categoryBreakdowns: Record<string, CategoryBreakdown>;
  
  // Actions
  generatePlanFromDiagnostic: (
    results: {
      examDate: string | null;
      weeklyHours: number;
      categoryScores: Record<string, { answered: number; correct: number }>;
    }
  ) => StudyPlan;
  setDiagnosticCompleted: (completed: boolean) => void;
  recordCategoryAnswer: (category: string, isCorrect: boolean) => void;
}

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Pharmacological & Parenteral Therapies',
  'Physiological Adaptation',
  'Safety & Infection Control',
  'Reduction of Risk Potential',
  'Basic Care & Comfort',
  'Psychosocial Integrity',
  'Health Promotion & Maintenance',
];

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  currentPlan: null,
  diagnosticCompleted: false,
  categoryBreakdowns: {},

  generatePlanFromDiagnostic: ({ examDate, weeklyHours, categoryScores }) => {
    // 1. Calculate runway days
    let daysRemaining = 45; // Default 45 days if no date set
    if (examDate) {
      const target = new Date(examDate).getTime();
      const now = Date.now();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (diff > 0) daysRemaining = diff;
    }

    // 2. Identify weak categories (<65% accuracy or lowest score)
    const breakdowns: Record<string, CategoryBreakdown> = {};
    const weakList: { category: string; accuracy: number }[] = [];

    for (const cat of NCLEX_CATEGORIES) {
      const stats = categoryScores[cat] ?? { answered: 0, correct: 0 };
      const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 50;
      
      let status: CategoryBreakdown['status'] = 'near_passing';
      if (accuracy < 60) status = 'below_passing';
      else if (accuracy >= 70) status = 'above_passing';

      breakdowns[cat] = {
        category: cat,
        totalAnswered: stats.answered,
        totalCorrect: stats.correct,
        accuracy,
        status,
      };

      weakList.push({ category: cat, accuracy });
    }

    // Sort to prioritize lowest accuracy
    weakList.sort((a, b) => a.accuracy - b.accuracy);
    const focusCategories = weakList.slice(0, 3).map((w) => w.category);

    // 3. Daily question goal: target 1500 practice questions over runway
    // clamped between 15 and 80 items/day
    const targetBankSize = 1500;
    const rawDaily = Math.round(targetBankSize / Math.max(14, daysRemaining));
    const dailyQuestionGoal = Math.min(80, Math.max(15, rawDaily));

    // 4. Schedule blocks for 7 days
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const scheduleBlocks = days.map((day, idx) => ({
      day,
      category: focusCategories[idx % focusCategories.length],
      targetQuestions: dailyQuestionGoal,
    }));

    const newPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      source: 'diagnostic',
      examDate,
      daysRemaining,
      weeklyHours: weeklyHours || 15,
      dailyQuestionGoal,
      estimatedCompletionWeeks: Math.ceil(daysRemaining / 7),
      focusCategories,
      scheduleBlocks,
      createdAt: new Date().toISOString(),
    };

    set({
      currentPlan: newPlan,
      diagnosticCompleted: true,
      categoryBreakdowns: breakdowns,
    });

    return newPlan;
  },

  setDiagnosticCompleted: (completed) => set({ diagnosticCompleted: completed }),

  recordCategoryAnswer: (category, isCorrect) => {
    const { categoryBreakdowns } = get();
    const existing = categoryBreakdowns[category] ?? {
      category,
      totalAnswered: 0,
      totalCorrect: 0,
      accuracy: 0,
      status: 'near_passing',
    };

    const totalAnswered = existing.totalAnswered + 1;
    const totalCorrect = existing.totalCorrect + (isCorrect ? 1 : 0);
    const accuracy = Math.round((totalCorrect / totalAnswered) * 100);

    let status: CategoryBreakdown['status'] = 'near_passing';
    if (accuracy < 60) status = 'below_passing';
    else if (accuracy >= 70) status = 'above_passing';

    set({
      categoryBreakdowns: {
        ...categoryBreakdowns,
        [category]: {
          category,
          totalAnswered,
          totalCorrect,
          accuracy,
          status,
        },
      },
    });
  },
}));
