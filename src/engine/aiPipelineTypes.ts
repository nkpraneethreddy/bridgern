/**
 * Dual-AI Question Generation & Evaluation Pipeline Schema.
 *
 * Architecture:
 * 1. AI-Generator (Writer):
 *    - Produces original clinical scenarios & options tailored to NCLEX-RN categories.
 *    - Strict adherence: Never reproduces copyrighted NCSBN questions.
 *    - Authors full per-option rationales and clinical data.
 *
 * 2. AI-Evaluator (Auditor):
 *    - Independently reviews the generated item against a strict 5-point NCSBN rubric:
 *      a) Clinical Accuracy (Current evidence-based practice)
 *      b) Pedagogical Validity (Tests nurse judgment, not rote recall)
 *      c) Plausibility of Distractors (No trivial or "obviously wrong" options)
 *      d) Quality of Rationales (Explains why correct is right AND why distractors are wrong)
 *      e) Non-Infringement (Ensures item is original)
 *    - Assigns approval score (1-10); items with score >= 8 and zero critical flags are approved.
 */

import { CognitiveLevel, QuestionItemType, QuestionScoringRule } from '../types/database';

export interface GeneratedQuestionDraft {
  categorySlug: string;
  topic: string;
  itemType: QuestionItemType;
  difficulty: number; // 1 - 5
  cognitiveLevel: CognitiveLevel;
  stem: string;
  clinicalData: Record<string, unknown>;
  rationale: string;
  scoringRule: QuestionScoringRule;
  options: {
    optionKey: string;
    label: string;
    explanation: string;
    isCorrect: boolean;
    correctOrder?: number;
  }[];
}

export interface EvaluationRubricResult {
  clinicalAccuracyScore: number; // 1 - 10
  distractorQualityScore: number; // 1 - 10
  rationaleQualityScore: number; // 1 - 10
  ncsbnAlignmentScore: number; // 1 - 10
  overallScore: number; // 1 - 10
  approved: boolean; // true if overallScore >= 8 and no flags
  criticalFlags: string[];
  feedbackForRevision: string | null;
  reviewedAt: string;
}

export interface PipelineBatchReport {
  totalGenerated: number;
  approvedCount: number;
  rejectedCount: number;
  averageScore: number;
  items: {
    question: GeneratedQuestionDraft;
    evaluation: EvaluationRubricResult;
  }[];
}
