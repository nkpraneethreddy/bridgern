/**
 * FeedbackPanel — shown in tutor mode after submitting an answer.
 *
 * Shows whether the answer was correct, the rationale, and
 * per-option explanations.
 *
 * Unslop: quiet surfaces, one accent bar on the left edge,
 * muted explanatory text. No emoji, no confetti, no "Great job!".
 *
 * Psychology:
 * - Elaborative interrogation: rationale forces the learner
 *   to understand WHY, not just memorize the answer.
 * - Desirable difficulty: showing what was missed alongside
 *   what was correct strengthens long-term retention.
 * - Self-determination: neutral tone respects autonomy —
 *   no patronizing praise or discouraging language.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';
import { Button } from '../ui/Button';
import type { QuestionWithOptions, ScoreResult } from '../../engine/types';

interface FeedbackPanelProps {
  question: QuestionWithOptions;
  result: ScoreResult;
  onContinue: () => void;
}

export function FeedbackPanel({ question, result, onContinue }: FeedbackPanelProps) {
  const { colors } = useTheme();

  const isPartial =
    result.pointsEarned > 0 && result.pointsEarned < result.pointsPossible;

  const accentColor = result.isCorrect
    ? colors.success
    : isPartial
    ? colors.warning
    : colors.danger;

  const accentSoft = result.isCorrect
    ? colors.successSoft
    : isPartial
    ? colors.warningSoft
    : colors.dangerSoft;

  const statusLabel = result.isCorrect
    ? 'Correct'
    : isPartial
    ? `Partial credit: ${result.pointsEarned}/${result.pointsPossible}`
    : 'Incorrect';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: accentSoft, borderLeftColor: accentColor },
      ]}
    >
      <View style={styles.header}>
        <ThemedText variant="h3" style={{ color: accentColor }}>
          {statusLabel}
        </ThemedText>
        {!result.isCorrect && (
          <ThemedText variant="caption" muted>
            {result.pointsEarned}/{result.pointsPossible} points
          </ThemedText>
        )}
      </View>

      {/* Rationale */}
      <View style={[styles.rationaleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText variant="label" muted>
          Rationale
        </ThemedText>
        <ThemedText variant="body" style={styles.rationale}>
          {question.rationale}
        </ThemedText>
      </View>

      {/* Per-option explanations */}
      {question.options.some((o) => o.explanation) && (
        <View style={styles.explanations}>
          <ThemedText variant="label" muted>
            Option explanations
          </ThemedText>
          {question.options.map((opt) => {
            if (!opt.explanation) return null;
            const fb = result.optionFeedback[opt.option_key];
            const dotColor =
              fb === 'correct'
                ? colors.success
                : fb === 'incorrect'
                ? colors.danger
                : fb === 'missed'
                ? colors.warning
                : colors.textMuted;

            return (
              <View key={opt.id} style={styles.explanationRow}>
                <View style={[styles.feedbackDot, { backgroundColor: dotColor }]} />
                <View style={styles.explanationContent}>
                  <ThemedText variant="caption" style={{ fontWeight: '600' }}>
                    {opt.option_key}. {opt.label}
                  </ThemedText>
                  <ThemedText variant="caption" muted>
                    {opt.explanation}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Button
        title="Next question"
        onPress={onContinue}
        accessibilityLabel="Continue to next question"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  rationaleCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  rationale: {
    lineHeight: 24,
  },
  explanations: {
    gap: spacing.sm,
  },
  explanationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  feedbackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  explanationContent: {
    flex: 1,
    gap: 2,
  },
});
