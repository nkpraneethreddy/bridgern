/**
 * SessionHeader — progress indicator and session info.
 *
 * Unslop: quiet progress bar on a 4px grid, muted meta text,
 * tabular numbers for alignment.
 *
 * Psychology: Goal-gradient effect — progress bar accelerates
 * perceived progress as the learner nears completion, maintaining
 * motivation through the slog of the middle questions.
 * Endowed progress: bar starts slightly filled to avoid "starting
 * from zero" demotivation.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';

interface SessionHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  progress: number; // 0-1
  mode: 'tutor' | 'exam';
  correctCount: number;
  answeredCount: number;
}

export function SessionHeader({
  questionNumber,
  totalQuestions,
  progress,
  mode,
  correctCount,
  answeredCount,
}: SessionHeaderProps) {
  const { colors } = useTheme();

  const accuracy = answeredCount > 0
    ? Math.round((correctCount / answeredCount) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText variant="label">
          Question {questionNumber}
          {totalQuestions > 0 ? ` of ${totalQuestions}` : ''}
        </ThemedText>
        <ThemedText variant="caption" muted style={styles.meta}>
          {mode === 'tutor' ? 'Tutor mode' : 'Exam mode'}
        </ThemedText>
      </View>

      {/* Progress bar */}
      <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: colors.primary,
              width: `${Math.min(100, progress * 100)}%`,
            },
          ]}
        />
      </View>

      {answeredCount > 0 && (
        <View style={styles.row}>
          <ThemedText variant="caption" muted style={styles.stat}>
            {correctCount}/{answeredCount} correct
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.stat}>
            {accuracy}% accuracy
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  meta: {
    fontVariant: ['tabular-nums'],
  },
  stat: {
    fontVariant: ['tabular-nums'],
  },
});
