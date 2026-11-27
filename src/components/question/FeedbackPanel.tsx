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
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const iconName = result.isCorrect
    ? 'checkmark-circle-outline'
    : isPartial
    ? 'alert-circle-outline'
    : 'close-circle-outline';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: accentSoft, borderColor: accentColor },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Ionicons name={iconName} size={20} color={accentColor} />
          <ThemedText variant="h3" style={{ color: accentColor }}>
            {statusLabel}
          </ThemedText>
        </View>
        {!result.isCorrect && (
          <ThemedText variant="caption" muted style={styles.tabular}>
            {result.pointsEarned}/{result.pointsPossible} points
          </ThemedText>
        )}
      </View>

      {/* Rationale */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <ThemedText variant="label" muted>
          Rationale
        </ThemedText>
        <ThemedText variant="body" style={styles.rationale}>
          {question.rationale}
        </ThemedText>
      </View>

      {/* Per-option explanations */}
      {question.options.some((o) => o.explanation) && (
        <View style={[styles.explanations, { borderTopColor: colors.border }]}>
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
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  section: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    gap: spacing.xs,
  },
  rationale: {
    lineHeight: 24,
  },
  explanations: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
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
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
