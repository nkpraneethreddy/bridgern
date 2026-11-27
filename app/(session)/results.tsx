/**
 * Session results screen — shown at the end of a practice session.
 *
 * Unslop design: clean data presentation with one accent moment
 * (the readiness range), quiet surfaces, tabular numbers.
 * No confetti, no celebration animations, no emoji.
 *
 * Psychology:
 * - Self-efficacy: show concrete improvement areas, not just a score.
 * - Growth mindset framing: "areas to focus on" not "weaknesses".
 * - Anchoring: readiness range is anchored to real NCLEX passing
 *   standards, grounding expectations in reality.
 * - Commitment: "Continue studying" CTA leverages consistency bias.
 * - Loss aversion: "You've answered X questions today" frames
 *   quitting as losing accumulated progress.
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { useSessionStore } from '../../src/stores/sessionStore';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const cleanup = useSessionStore((s) => s.cleanup);

  const stats = useMemo(() => {
    if (!session) return null;

    const { history, readiness, totalPointsEarned, totalPointsPossible, elapsedSeconds } =
      session;

    const accuracy =
      totalPointsPossible > 0
        ? Math.round((totalPointsEarned / totalPointsPossible) * 100)
        : 0;

    const avgTime =
      history.length > 0
        ? Math.round(
            history.reduce((sum, a) => sum + a.timeSpentSeconds, 0) /
              history.length,
          )
        : 0;

    // Category breakdown
    const categoryStats: Record<
      string,
      { correct: number; total: number }
    > = {};
    for (const a of history) {
      if (!categoryStats[a.categoryId]) {
        categoryStats[a.categoryId] = { correct: 0, total: 0 };
      }
      categoryStats[a.categoryId].total += 1;
      if (a.wasCorrect) categoryStats[a.categoryId].correct += 1;
    }

    const totalMins = Math.floor(elapsedSeconds / 60);
    const totalSecs = elapsedSeconds % 60;

    return {
      totalQuestions: history.length,
      accuracy,
      avgTime,
      readiness,
      categoryStats,
      totalTime: `${totalMins}:${totalSecs.toString().padStart(2, '0')}`,
      totalPointsEarned,
      totalPointsPossible,
    };
  }, [session]);

  const handleDone = () => {
    cleanup();
    router.replace('/(tabs)/practice');
  };

  const handleStudyMore = () => {
    cleanup();
    router.replace('/(tabs)/practice');
  };

  if (!stats) return null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: spacing.xl + insets.bottom },
      ]}
    >
      <ThemedText variant="h2">Session complete</ThemedText>

      {/* Readiness estimate — primary visual moment */}
      <Card>
        <ThemedText variant="h3">Readiness estimate</ThemedText>
        <View style={styles.readinessRow}>
          <View style={styles.readinessRange}>
            <View
              style={[
                styles.readinessBar,
                { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <View
                style={[
                  styles.readinessRangeBar,
                  {
                    backgroundColor: colors.primary,
                    left: `${stats.readiness.low}%`,
                    width: `${Math.max(1, stats.readiness.high - stats.readiness.low)}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.readinessLabels}>
              <ThemedText variant="caption" muted style={styles.tabular}>
                {stats.readiness.low}%
              </ThemedText>
              <ThemedText variant="label" tone="primary" style={styles.tabular}>
                {stats.readiness.mid}%
              </ThemedText>
              <ThemedText variant="caption" muted style={styles.tabular}>
                {stats.readiness.high}%
              </ThemedText>
            </View>
          </View>
        </View>
        <ThemedText variant="caption" muted style={styles.disclaimer}>
          Confidence range based on {stats.totalQuestions} questions.
          This is not a prediction of exam outcome.
        </ThemedText>
      </Card>

      {/* Single unified session breakdown */}
      <Card>
        <ThemedText variant="h3">Session breakdown</ThemedText>
        <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
          <ThemedText variant="body" muted>Questions answered</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.tabular}>
            {stats.totalQuestions}
          </ThemedText>
        </View>
        <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
          <ThemedText variant="body" muted>Accuracy</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.tabular}>
            {stats.accuracy}%
          </ThemedText>
        </View>
        <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
          <ThemedText variant="body" muted>Average pace</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.tabular}>
            {stats.avgTime}s / item
          </ThemedText>
        </View>
        <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
          <ThemedText variant="body" muted>Total time</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.tabular}>
            {stats.totalTime}
          </ThemedText>
        </View>
        <View style={styles.summaryRowLast}>
          <ThemedText variant="body" muted>Points earned</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.tabular}>
            {stats.totalPointsEarned}/{stats.totalPointsPossible}
          </ThemedText>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Continue studying"
          onPress={handleStudyMore}
          accessibilityLabel="Start another practice session"
        />
        <Button
          title="Back to practice"
          variant="outline"
          onPress={handleDone}
        />
      </View>

      <DisclaimerBanner />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  readinessRow: {
    marginTop: spacing.sm,
  },
  readinessRange: {
    gap: spacing.xs,
  },
  readinessBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  readinessRangeBar: {
    position: 'absolute',
    top: 0,
    height: 8,
    borderRadius: 4,
  },
  readinessLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  disclaimer: {
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  summaryRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  actions: {
    gap: spacing.sm,
  },
});
