/**
 * Case study question renderer — multi-step clinical scenario.
 *
 * Shows clinical background, then renders each step using the
 * appropriate question type. Steps are shown one at a time.
 *
 * Psychology: Narrative transport — the clinical scenario creates
 * immersion, making the learning more memorable than isolated questions.
 * Progressive disclosure reduces cognitive load by revealing one step
 * at a time.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';
import { Card } from '../ui/Card';
import { QuestionRenderer } from './QuestionRenderer';
import type { QuestionWithOptions, QuestionResponse, ScoreResult } from '../../engine/types';

interface Props {
  question: QuestionWithOptions;
  onSubmit: (response: QuestionResponse) => void;
  feedback: ScoreResult | null;
  disabled: boolean;
}

export function CaseStudyQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();

  const clinicalData = question.clinical_data as Record<string, unknown>;
  const scenario = (clinicalData?.scenario as string) ?? '';
  const stepLabel = question.case_study_step
    ? `Step ${question.case_study_step}`
    : 'Clinical scenario';

  const handleStepSubmit = (innerResponse: QuestionResponse) => {
    onSubmit({
      type: 'case_study',
      step: question.case_study_step ?? 1,
      inner: innerResponse,
    });
  };

  return (
    <View style={styles.container}>
      {/* Clinical scenario card */}
      <Card elevated style={styles.scenarioCard}>
        <View style={styles.stepHeader}>
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
          <ThemedText variant="label" tone="primary">
            {stepLabel}
          </ThemedText>
        </View>
        {scenario ? (
          <ThemedText variant="body" style={styles.scenario}>
            {scenario}
          </ThemedText>
        ) : null}
      </Card>

      {/* The actual question (could be MC, SATA, matrix, etc.) */}
      <QuestionRenderer
        question={question}
        onSubmit={handleStepSubmit}
        feedback={feedback}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  scenarioCard: {
    gap: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scenario: {
    lineHeight: 24,
  },
});
