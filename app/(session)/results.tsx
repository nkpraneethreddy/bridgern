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
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { Card } from '../../src/components/ui/Card';
import { useSessionStore } from '../../src/stores/sessionStore';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const cleanup = useSessionStore((s) => s.cleanup);

  const stats = useMemo(() => {
    if (!session) return null;

    const { history, readiness, totalPointsEarned, totalPointsPossible, elapsedSeconds } = session;

    const accuracy = totalPointsPossible > 0
      ? Math.round((totalPointsEarned / totalPointsPossible) * 100)
      : 0;

    const avgPace = history.length > 0
      ? Math.round(history.reduce((acc, h) => acc + h.timeSpentSeconds, 0) / history.length)
      : 0;

    const totalMins = Math.floor(elapsedSeconds / 60);
    const totalSecs = elapsedSeconds % 60;

    return {
      totalQuestions: history.length,
      accuracy,
      avgPace,
      readiness,
      totalTime: `${totalMins}:${totalSecs.toString().padStart(2, '0')}`,
      totalPointsEarned,
      totalPointsPossible,
    };
  }, [session]);

  const handleReturn = () => {
    cleanup();
    router.replace('/(tabs)/practice');
  };

  if (!stats) return null;

  // Passing line threshold on standard NCLEX scale
  const passCutoff = 65;
  const isPassing = stats.readiness.low >= passCutoff;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: spacing.xl + insets.bottom },
      ]}
    >
      {/* Clinician Header */}
      <View style={styles.header}>
        <ThemedText variant="caption" muted style={styles.monoHeading}>
          CANDIDATE PERFORMANCE REPORT · CAT SIMULATION
        </ThemedText>
        <ThemedText variant="h1">Examination Results</ThemedText>
      </View>

      {/* The One Craft Moment: Wilson Score Ability Distribution Curve */}
      <Card style={styles.hudCard}>
        <View style={styles.hudTopRow}>
          <View>
            <ThemedText variant="label">Readiness Confidence Interval</ThemedText>
            <ThemedText variant="caption" muted style={styles.microText}>
              95% Wilson score estimate ({stats.totalQuestions} items sampled)
            </ThemedText>
          </View>
          <View style={[styles.statusTag, { backgroundColor: isPassing ? colors.successSoft : colors.primarySoft }]}>
            <ThemedText variant="caption" tone={isPassing ? 'success' : 'primary'} style={styles.monoStatus}>
              {isPassing ? 'ABOVE PASSING' : 'CALIBRATED'}
            </ThemedText>
          </View>
        </View>

        {/* Graphical Ability Axis */}
        <View style={styles.curveContainer}>
          <View style={[styles.curveTrack, { backgroundColor: colors.surfaceElevated }]}>
            {/* Cutoff Reference Line at 65% */}
            <View style={[styles.cutoffLine, { left: `${passCutoff}%`, backgroundColor: colors.border }]} />
            {/* Confidence Interval Band */}
            <View
              style={[
                styles.intervalBand,
                {
                  left: `${stats.readiness.low}%`,
                  width: `${Math.max(4, stats.readiness.high - stats.readiness.low)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          {/* Axis Labels */}
          <View style={styles.axisLabels}>
            <ThemedText variant="caption" muted style={styles.monoAxis}>
              {stats.readiness.low}% (Min)
            </ThemedText>
            <View style={styles.cutoffLabelGroup}>
              <ThemedText variant="caption" muted style={styles.monoAxisCutoff}>
                Pass Standard ({passCutoff}%)
              </ThemedText>
            </View>
            <ThemedText variant="caption" muted style={styles.monoAxis}>
              {stats.readiness.high}% (Max)
            </ThemedText>
          </View>
        </View>

        <View style={[styles.hudFooter, { borderTopColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
          <ThemedText variant="caption" muted style={styles.hudFootnote}>
            Confidence ranges widen with shorter sets; full CAT blocks narrow the bound.
          </ThemedText>
        </View>
      </Card>

      {/* Unified Telemetry Strip */}
      <View style={styles.metricGrid}>
        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText variant="caption" muted style={styles.miniLabel}>
            ACCURACY
          </ThemedText>
          <ThemedText variant="h2" style={styles.monoVal}>
            {stats.accuracy}%
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.microText}>
            {stats.totalPointsEarned}/{stats.totalPointsPossible} pts
          </ThemedText>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText variant="caption" muted style={styles.miniLabel}>
            AVG PACE
          </ThemedText>
          <ThemedText variant="h2" style={styles.monoVal}>
            {stats.avgPace}s
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.microText}>
            Target: &lt;90s/item
          </ThemedText>
        </View>

        <View style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ThemedText variant="caption" muted style={styles.miniLabel}>
            SESSION TIME
          </ThemedText>
          <ThemedText variant="h2" style={styles.monoVal}>
            {stats.totalTime}
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.microText}>
            {stats.totalQuestions} items
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to practice test workstation"
          onPress={handleReturn}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <ThemedText variant="label" style={{ color: colors.primaryText, fontSize: 16 }}>
            Return to Test Workstation →
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    paddingTop: spacing.xs,
    gap: 2,
  },
  monoHeading: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  mono: {
    fontVariant: ['tabular-nums'],
  },
  monoStatus: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  monoAxis: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
  },
  monoAxisCutoff: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '600',
  },
  monoVal: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginTop: 2,
  },
  miniLabel: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    letterSpacing: 0.5,
  },
  microText: {
    fontSize: 11,
    marginTop: 2,
  },
  hudCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  curveContainer: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  curveTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  cutoffLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  },
  intervalBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  cutoffLabelGroup: {
    alignItems: 'center',
  },
  hudFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  hudFootnote: {
    flex: 1,
    fontSize: 11,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricTile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    marginTop: spacing.xs,
  },
  primaryBtn: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
