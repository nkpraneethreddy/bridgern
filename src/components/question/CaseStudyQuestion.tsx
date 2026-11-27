/**
 * Case study question renderer — multi-step clinical scenario.
 *
 * Implements the authentic Next Generation NCLEX (NGN) Clinical Judgment
 * Measurement Model (CJMM) interface:
 * 1. Interactive Electronic Health Record (EHR) Patient Chart (EHRChartViewer)
 * 2. 6-Step CJMM Step Badge (Recognize Cues -> Analyze Cues -> Prioritize Hypotheses ->
 *    Generate Solutions -> Take Action -> Evaluate Outcomes)
 * 3. Interactive response interface matching the step's specific question type
 *    (Multiple Choice, SATA, Matrix) with NO recursive loop.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { EHRChartData, EHRChartViewer } from './EHRChartViewer';
import { MCQuestion } from './MCQuestion';
import { SATAQuestion } from './SATAQuestion';
import { MatrixQuestion } from './MatrixQuestion';
import type { QuestionWithOptions, QuestionResponse, ScoreResult } from '../../engine/types';
import type { QuestionItemType } from '../../types/database';

interface Props {
  question: QuestionWithOptions;
  onSubmit: (response: QuestionResponse) => void;
  feedback: ScoreResult | null;
  disabled: boolean;
}

const CJMM_STEPS: Record<number, { title: string; desc: string }> = {
  1: { title: 'Step 1: Recognize Cues', desc: 'Identify relevant and urgent clinical findings' },
  2: { title: 'Step 2: Analyze Cues', desc: 'Connect findings to client pathophysiology' },
  3: { title: 'Step 3: Prioritize Hypotheses', desc: 'Identify the priority client condition or risk' },
  4: { title: 'Step 4: Generate Solutions', desc: 'Establish clinical interventions and goals' },
  5: { title: 'Step 5: Take Action', desc: 'Implement nursing orders and interventions' },
  6: { title: 'Step 6: Evaluate Outcomes', desc: 'Assess client response to clinical actions' },
};

export function CaseStudyQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();

  const clinicalData = (question.clinical_data as unknown as EHRChartData & { sub_type?: QuestionItemType }) ?? {};
  const stepNum = question.case_study_step ?? 1;
  const cjmm = CJMM_STEPS[stepNum] ?? {
    title: `Step ${stepNum}: Clinical Judgment`,
    desc: 'Analyze clinical cues to form nursing decisions',
  };

  // Determine sub question type (MC, SATA, Matrix)
  const subType: QuestionItemType =
    clinicalData.sub_type ??
    (question.options.filter((o) => o.is_correct).length > 1 ? 'sata' : 'multiple_choice');

  const handleInnerSubmit = (innerResponse: QuestionResponse) => {
    onSubmit({
      type: 'case_study',
      step: stepNum,
      inner: innerResponse,
    });
  };

  return (
    <View style={styles.container}>
      {/* CJMM Clinical Judgment Step Badge */}
      <View
        style={[
          styles.cjmmCard,
          { backgroundColor: colors.primarySoft, borderColor: colors.primary },
        ]}
      >
        <View style={styles.cjmmTop}>
          <Ionicons name="git-network-outline" size={16} color={colors.primary} />
          <ThemedText variant="label" tone="primary" style={styles.cjmmTitle}>
            {cjmm.title}
          </ThemedText>
        </View>
        <ThemedText variant="caption" muted style={styles.cjmmDesc}>
          {cjmm.desc}
        </ThemedText>
      </View>

      {/* Interactive Electronic Health Record (EHR) Chart */}
      <EHRChartViewer data={clinicalData} />

      {/* Interactive Sub-Question Component */}
      <Card style={styles.questionCard}>
        {subType === 'sata' ? (
          <SATAQuestion
            question={{ ...question, item_type: 'sata' }}
            onSubmit={handleInnerSubmit}
            feedback={feedback}
            disabled={disabled}
          />
        ) : subType === 'matrix' ? (
          <MatrixQuestion
            question={{ ...question, item_type: 'matrix' }}
            onSubmit={handleInnerSubmit}
            feedback={feedback}
            disabled={disabled}
          />
        ) : (
          <MCQuestion
            question={{ ...question, item_type: 'multiple_choice' }}
            onSubmit={handleInnerSubmit}
            feedback={feedback}
            disabled={disabled}
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  cjmmCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
  },
  cjmmTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cjmmTitle: {
    fontWeight: '700',
  },
  cjmmDesc: {
    fontSize: 11,
    paddingLeft: 22,
  },
  questionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
