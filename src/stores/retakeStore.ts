/**
 * Retake Mode store & Candidate Performance Report (CPR) Intake.
 *
 * Designed specifically for repeat test-takers (46-50% of IENs):
 * Takes past Pearson VUE CPR performance ratings across the 8 Client Needs categories:
 * - 'below_passing' (Needs significant remediation)
 * - 'near_passing' (Borderline)
 * - 'above_passing' (Standard met)
 *
 * Configures focused study blocks prioritizing 'below_passing' areas and
 * records outcomes in the database (outcome_reports table).
 */

import { create } from 'zustand';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useStudyPlanStore } from './studyPlanStore';

export type CPRRating = 'below_passing' | 'near_passing' | 'above_passing';

export interface CPRCategoryRating {
  category: string;
  rating: CPRRating;
}

export interface PastExamReport {
  examDate: string;
  targetState: string;
  questionsStoppedAt: number; // 85, 150, etc.
  ratings: Record<string, CPRRating>;
  weakCategories: string[];
  submittedAt: string;
}

interface RetakeState {
  pastReport: PastExamReport | null;
  isRetakeModeActive: boolean;
  isModalOpen: boolean;

  openModal: () => void;
  closeModal: () => void;
  submitCPR: (report: Omit<PastExamReport, 'weakCategories' | 'submittedAt'>, userId?: string) => Promise<void>;
  resetRetakeMode: () => void;
}

export const NCLEX_CATEGORIES = [
  'Management of Care',
  'Pharmacological & Parenteral Therapies',
  'Physiological Adaptation',
  'Safety & Infection Control',
  'Reduction of Risk Potential',
  'Basic Care & Comfort',
  'Psychosocial Integrity',
  'Health Promotion & Maintenance',
];

export const useRetakeStore = create<RetakeState>((set, get) => ({
  pastReport: null,
  isRetakeModeActive: false,
  isModalOpen: false,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  submitCPR: async (reportData, userId) => {
    // 1. Identify weak categories based on CPR rating
    const weakCategories = Object.entries(reportData.ratings)
      .filter(([_, rating]) => rating === 'below_passing' || rating === 'near_passing')
      .map(([cat]) => cat);

    const fullReport: PastExamReport = {
      ...reportData,
      weakCategories,
      submittedAt: new Date().toISOString(),
    };

    // 2. Set active state
    set({
      pastReport: fullReport,
      isRetakeModeActive: true,
      isModalOpen: false,
    });

    // 3. Inject into study plan store as a targeted retake prescription
    const fakeCategoryScores: Record<string, { answered: number; correct: number }> = {};
    for (const cat of NCLEX_CATEGORIES) {
      const rating = reportData.ratings[cat] ?? 'near_passing';
      if (rating === 'below_passing') {
        fakeCategoryScores[cat] = { answered: 20, correct: 8 }; // 40% accuracy
      } else if (rating === 'near_passing') {
        fakeCategoryScores[cat] = { answered: 20, correct: 13 }; // 65% accuracy
      } else {
        fakeCategoryScores[cat] = { answered: 20, correct: 17 }; // 85% accuracy
      }
    }

    useStudyPlanStore.getState().generatePlanFromDiagnostic({
      examDate: reportData.examDate,
      weeklyHours: 20,
      categoryScores: fakeCategoryScores,
    });

    // 4. Persist to Supabase outcome_reports table if authenticated
    if (supabaseConfigured && userId) {
      try {
        await supabase.from('outcome_reports').insert({
          user_id: userId,
          exam_date: reportData.examDate,
          target_state: reportData.targetState,
          outcome: 'did_not_pass',
          questions_stopped_at: reportData.questionsStoppedAt,
          weak_categories: weakCategories,
        });
      } catch (e) {
        if (__DEV__) console.warn('Failed to persist outcome report', e);
      }
    }
  },

  resetRetakeMode: () => {
    set({
      pastReport: null,
      isRetakeModeActive: false,
    });
  },
}));
