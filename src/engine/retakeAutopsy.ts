/**
 * Retake Diagnostic & Clinical Autopsy Engine.
 *
 * Implements advanced psychometric analysis of past failed NCLEX attempts based on:
 * 1. Pearson VUE CAT Shut-off Rule:
 *    - 85 items (Minimum): 95% Confidence Interval Rule — Clear deficit below passing standard.
 *    - 86-149 items: Variable length drop — Fluctuated near cutoff before dipping below.
 *    - 150 items (Maximum): Maximum Length Rule — Hovered on passing cutoff until the final item (marginal candidate).
 *    - Ran Out of Time (ROOT): Pacing breakdown (>2.5 min/item).
 *
 * 2. NCSBN 45-Day Mandatory Waiting Period Schedule:
 *    - Phase 1 (Days 1-14): Foundational Deficit Repair (Below-Passing areas only).
 *    - Phase 2 (Days 15-30): Borderline Stabilization (Near-Passing areas + CAT adaptation).
 *    - Phase 3 (Days 31-45): Full 85-150 item Stamina Simulators.
 */

export type ShutOffMechanism =
  | 'minimum_length_deficit' // 85 items
  | 'mid_length_drop'         // 86 - 149 items
  | 'maximum_length_marginal' // 150 items
  | 'ran_out_of_time';        // Timed out

export interface AutopsyInsight {
  mechanism: ShutOffMechanism;
  title: string;
  summary: string;
  clinicalImplication: string;
  prescribedStrategy: string[];
}

export interface RetakeRoadmapDay {
  dayNumber: number;
  phase: 1 | 2 | 3;
  phaseTitle: string;
  focusArea: string;
  targetItems: number;
}

export function diagnoseShutOffMechanism(stoppedAt: number): AutopsyInsight {
  if (stoppedAt <= 85) {
    return {
      mechanism: 'minimum_length_deficit',
      title: '95% Confidence Deficit at Minimum Length (85 Items)',
      summary:
        'The computerized adaptive test shut off at the earliest opportunity (85 items) because the algorithm achieved 95% statistical certainty that your ability level fell below the passing standard.',
      clinicalImplication:
        'This pattern typically indicates fundamental knowledge gaps in core clinical prioritization (Airway-Breathing-Circulation, Maslow hierarchy) and medication safety.',
      prescribedStrategy: [
        'Do NOT start with full 150-question mock exams.',
        'Focus exclusively on your diagnosed Below-Passing categories.',
        'Master the 5 Clinical Judgment steps: Recognize Cues, Prioritize Hypotheses, Take Action.',
      ],
    };
  }

  if (stoppedAt === 150) {
    return {
      mechanism: 'maximum_length_marginal',
      title: 'Marginal Candidate at Maximum Length (150 Items)',
      summary:
        'You took the exam to the absolute maximum limit (150 items)! This means you were extremely close to passing — you hovered right on the passing standard line until the final questions.',
      clinicalImplication:
        'You do not have deep knowledge deficits. You likely lost momentum due to mental fatigue, pacing panic, or second-guessing in the last 30 questions.',
      prescribedStrategy: [
        'Stamina conditioning: Practice 85-question and 150-question blocks without breaks.',
        'Pacing discipline: Target strictly 70-85 seconds per item to avoid running short.',
        'Confidence drills: Trust your first clinical instinct — do not change answers unless you misread the stem.',
      ],
    };
  }

  return {
    mechanism: 'mid_length_drop',
    title: `Variable Length Closure (${stoppedAt} Items)`,
    summary:
      `The test extended past the minimum length but ended at question ${stoppedAt} as ability estimate stabilized below the passing threshold.`,
    clinicalImplication:
      'You showed solid knowledge in several categories but consistency dipped when higher-difficulty analytical items (analysis, multi-system case studies) appeared.',
    prescribedStrategy: [
      'Remediate Below-Passing categories first to raise your baseline difficulty.',
      'Practice Next Gen NCLEX (NGN) Case Studies to build comfort with unstructured patient charts.',
    ],
  };
}

export function generate45DayRetakeRoadmap(
  weakCategories: string[],
  examDate?: string
): RetakeRoadmapDay[] {
  const days: RetakeRoadmapDay[] = [];
  const primaryWeak = weakCategories[0] ?? 'Pharmacological & Parenteral Therapies';
  const secondaryWeak = weakCategories[1] ?? 'Management of Care';

  for (let i = 1; i <= 45; i++) {
    if (i <= 14) {
      days.push({
        dayNumber: i,
        phase: 1,
        phaseTitle: 'Phase 1: Deficit Elimination',
        focusArea: primaryWeak,
        targetItems: 30,
      });
    } else if (i <= 30) {
      days.push({
        dayNumber: i,
        phase: 2,
        phaseTitle: 'Phase 2: Borderline Stabilization',
        focusArea: secondaryWeak,
        targetItems: 50,
      });
    } else {
      days.push({
        dayNumber: i,
        phase: 3,
        phaseTitle: 'Phase 3: Full Simulation & Stamina',
        focusArea: 'Comprehensive 85-150 Item CAT',
        targetItems: 85,
      });
    }
  }

  return days;
}
