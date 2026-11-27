import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useAuthStore } from '../../src/stores/authStore';
import { useStudyPlanStore } from '../../src/stores/studyPlanStore';
import { useStreakStore } from '../../src/stores/streakStore';
import { useRetakeStore } from '../../src/stores/retakeStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { currentPlan, diagnosticCompleted } = useStudyPlanStore();
  const { currentStreak } = useStreakStore();
  const { isRetakeModeActive } = useRetakeStore();

  const daysRemaining = currentPlan?.daysRemaining ?? 48;
  const dailyTarget = currentPlan?.dailyQuestionGoal ?? 25;
  const displayName = profile?.full_name ? profile.full_name : 'Nurse Candidate';
  const targetState = profile?.target_state ?? 'NY-RN';

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clinician Header */}
      <View style={styles.headerRow}>
        <View style={styles.greeting}>
          <ThemedText variant="caption" muted style={styles.monoLabel}>
            NCLEX-RN PREPARATION · {targetState}
          </ThemedText>
          <ThemedText variant="h1">{displayName}</ThemedText>
        </View>
        {currentStreak > 0 && (
          <View
            style={[
              styles.streakBadge,
              { backgroundColor: colors.warningSoft, borderColor: colors.warning },
            ]}
          >
            <Ionicons name="flame" size={14} color={colors.warning} />
            <ThemedText variant="caption" tone="warning" style={styles.streakText}>
              {currentStreak}d streak
            </ThemedText>
          </View>
        )}
      </View>

      {/* Retake Mode Status Notice (if active) */}
      {isRetakeModeActive && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/progress')}
          style={[
            styles.retakeNotice,
            { backgroundColor: colors.warningSoft, borderColor: colors.warning },
          ]}
        >
          <Ionicons name="medical" size={16} color={colors.warning} />
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText variant="label" tone="warning">
              Retake Remediation Active
            </ThemedText>
            <ThemedText variant="caption" muted>
              Study plan tuned to your Pearson VUE deficit areas.
            </ThemedText>
          </View>
          <ThemedText variant="caption" tone="warning" style={styles.mono}>
            View Plan →
          </ThemedText>
        </Pressable>
      )}

      {/* Primary Action Card: Next Clear Step for the Learner */}
      <Card elevated style={styles.actionCard}>
        <View style={styles.actionHeader}>
          <View style={styles.actionTextGroup}>
            <ThemedText variant="label" tone="primary" style={styles.miniMono}>
              {diagnosticCompleted ? "TODAY'S STUDY GOAL" : 'STEP 1: BASELINE'}
            </ThemedText>
            <ThemedText variant="h2">
              {diagnosticCompleted ? 'Adaptive Practice Block' : 'Diagnostic Assessment'}
            </ThemedText>
            <ThemedText variant="body" muted style={styles.actionSubtitle}>
              {diagnosticCompleted
                ? `Focus: ${currentPlan?.focusCategories[0] ?? 'Pharmacological Therapies'} · ${dailyTarget} questions`
                : 'Complete 25 questions to gauge your baseline ability across the 8 Client Needs categories.'}
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            diagnosticCompleted ? 'Start adaptive practice' : 'Start baseline diagnostic'
          }
          onPress={() => router.push('/(tabs)/practice')}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <ThemedText variant="label" style={{ color: colors.primaryText, fontSize: 16 }}>
            {diagnosticCompleted ? 'Start Daily Practice →' : 'Begin Assessment (25 Items) →'}
          </ThemedText>
        </Pressable>
      </Card>

      {/* Overview Metric HUD */}
      <Card style={styles.hudCard}>
        <ThemedText variant="label" style={styles.sectionHeading}>
          Study Runway & Milestones
        </ThemedText>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <ThemedText variant="caption" muted style={styles.miniMono}>
              EXAM COUNTDOWN
            </ThemedText>
            <ThemedText variant="h2" style={styles.mono}>
              {daysRemaining}
            </ThemedText>
            <ThemedText variant="caption" muted>
              days remaining
            </ThemedText>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricItem}>
            <ThemedText variant="caption" muted style={styles.miniMono}>
              DAILY TARGET
            </ThemedText>
            <ThemedText variant="h2" style={styles.mono}>
              {dailyTarget}
            </ThemedText>
            <ThemedText variant="caption" muted>
              items / day
            </ThemedText>
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metricItem}>
            <ThemedText variant="caption" muted style={styles.miniMono}>
              STATUS
            </ThemedText>
            <ThemedText
              variant="h3"
              style={[
                styles.mono,
                { color: diagnosticCompleted ? colors.success : colors.warning },
              ]}
            >
              {diagnosticCompleted ? 'Calibrated' : 'Pending'}
            </ThemedText>
            <ThemedText variant="caption" muted>
              {diagnosticCompleted ? 'plan active' : 'needs test'}
            </ThemedText>
          </View>
        </View>
      </Card>

      {/* Trajectory Analytics Link Card */}
      <Card style={[styles.analyticsCard, { borderColor: colors.border }]}>
        <View style={styles.analyticsHeader}>
          <View style={{ gap: 2, flex: 1 }}>
            <ThemedText variant="label">Candidate Performance Report</ThemedText>
            <ThemedText variant="caption" muted>
              {diagnosticCompleted
                ? 'Your readiness trajectory is tracked against the 65% passing standard.'
                : 'Take the diagnostic to unlock your 8-category accuracy breakdown.'}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="View full analytics report"
            onPress={() => router.push('/(tabs)/progress')}
            style={styles.analyticsLink}
          >
            <ThemedText variant="caption" tone="primary" style={styles.mono}>
              View Analytics →
            </ThemedText>
          </Pressable>
        </View>
      </Card>

      {/* Clean Footer Note */}
      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
        <ThemedText variant="caption" muted style={styles.miniMono}>
          Pearson VUE Next Generation NCLEX (NGN) Aligned
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  greeting: {
    gap: 2,
    flex: 1,
  },
  monoLabel: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  streakText: {
    fontWeight: '700',
    fontSize: 12,
  },
  retakeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  actionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  actionHeader: {
    gap: spacing.xs,
  },
  actionTextGroup: {
    gap: 4,
  },
  actionSubtitle: {
    lineHeight: 20,
    marginTop: 2,
  },
  primaryButton: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionHeading: {
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 40,
  },
  mono: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  miniMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    letterSpacing: 0.5,
  },
  analyticsCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  analyticsLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
