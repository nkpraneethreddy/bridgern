import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';
import { useStudyPlanStore } from '../../src/stores/studyPlanStore';

const BLUEPRINT_CATEGORIES = [
  { name: 'Management of Care', weight: 18, color: '#0D6E6E' },
  { name: 'Pharmacological & Parenteral Therapies', weight: 16, color: '#2563EB' },
  { name: 'Physiological Adaptation', weight: 14, color: '#DB2777' },
  { name: 'Safety & Infection Control', weight: 13, color: '#7C3AED' },
  { name: 'Reduction of Risk Potential', weight: 12, color: '#EA580C' },
  { name: 'Basic Care & Comfort', weight: 9, color: '#059669' },
  { name: 'Psychosocial Integrity', weight: 9, color: '#4B5563' },
  { name: 'Health Promotion & Maintenance', weight: 9, color: '#65A30D' },
];

export default function ProgressScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentPlan, diagnosticCompleted, categoryBreakdowns } = useStudyPlanStore();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Clinician Header */}
      <View style={styles.header}>
        <ThemedText variant="caption" muted style={styles.monoHeading}>
          CANDIDATE PERFORMANCE REPORT (CPR) Â· ANALYTICS
        </ThemedText>
        <ThemedText variant="h1">Readiness & Trajectory</ThemedText>
      </View>

      {/* Primary Readiness Card */}
      <Card style={styles.mainCard}>
        <View style={styles.cardHeaderRow}>
          <View>
            <ThemedText variant="label">Baseline Readiness Interval</ThemedText>
            <ThemedText variant="caption" muted>
              95% Wilson confidence score vs. 65% NCLEX standard
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: diagnosticCompleted ? colors.successSoft : colors.primarySoft,
              },
            ]}
          >
            <ThemedText
              variant="caption"
              tone={diagnosticCompleted ? 'success' : 'primary'}
              style={styles.monoTag}
            >
              {diagnosticCompleted ? 'CALIBRATED' : 'DIAGNOSTIC PENDING'}
            </ThemedText>
          </View>
        </View>

        {/* Visual Passing Meter */}
        <View style={styles.meterContainer}>
          <View style={[styles.meterTrack, { backgroundColor: colors.surfaceElevated }]}>
            {/* Standard Pass Cutoff line at 65% */}
            <View style={[styles.passLine, { left: '65%', backgroundColor: colors.border }]} />
            {/* User Readiness Bar */}
            <View
              style={[
                styles.readinessBar,
                {
                  width: diagnosticCompleted ? '72%' : '0%',
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>

          <View style={styles.meterScaleRow}>
            <ThemedText variant="caption" muted style={styles.mono}>
              0%
            </ThemedText>
            <View style={styles.cutoffMarker}>
              <ThemedText variant="caption" muted style={styles.monoCutoff}>
                Pass Standard (65%)
              </ThemedText>
            </View>
            <ThemedText variant="caption" muted style={styles.mono}>
              100%
            </ThemedText>
          </View>
        </View>

        {!diagnosticCompleted && (
          <View style={[styles.actionBanner, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <ThemedText variant="body">
              Take the 25-item Diagnostic Exam to establish your baseline ability estimate.
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start 25-item diagnostic"
              onPress={() => router.push('/(tabs)/practice')}
              style={[styles.smallBtn, { backgroundColor: colors.primary }]}
            >
              <ThemedText variant="label" style={{ color: colors.primaryText }}>
                Start Diagnostic â†’
              </ThemedText>
            </Pressable>
          </View>
        )}
      </Card>

      {/* Client Needs Category Breakdown */}
      <View style={styles.sectionHeader}>
        <ThemedText variant="h3">Client Needs Performance</ThemedText>
        <ThemedText variant="caption" muted>
          Accuracy vs. Pearson VUE passing cutoff
        </ThemedText>
      </View>

      <View style={styles.categoryList}>
        {BLUEPRINT_CATEGORIES.map((cat) => {
          const breakdown = categoryBreakdowns[cat.name];
          const accuracy = breakdown ? breakdown.accuracy : 0;
          const status = breakdown ? breakdown.status : 'near_passing';

          let statusLabel = 'Near Passing';
          let statusTone: 'success' | 'warning' | 'danger' = 'warning';

          if (status === 'above_passing') {
            statusLabel = 'Above Passing';
            statusTone = 'success';
          } else if (status === 'below_passing') {
            statusLabel = 'Below Passing';
            statusTone = 'danger';
          }

          return (
            <Card key={cat.name} style={styles.categoryCard}>
              <View style={styles.categoryTitleRow}>
                <View style={styles.categoryTitleLeft}>
                  <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                  <ThemedText variant="label" style={styles.categoryName}>
                    {cat.name}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" tone={statusTone} style={styles.monoStatus}>
                  {diagnosticCompleted ? statusLabel : 'Not Tested'}
                </ThemedText>
              </View>

              <View style={styles.progressRow}>
                <View style={[styles.barTrack, { backgroundColor: colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: diagnosticCompleted ? `${accuracy}%` : '0%',
                        backgroundColor:
                          statusTone === 'success'
                            ? colors.success
                            : statusTone === 'danger'
                            ? colors.danger
                            : colors.warning,
                      },
                    ]}
                  />
                </View>
                <ThemedText variant="caption" muted style={styles.monoPercent}>
                  {diagnosticCompleted ? `${accuracy}%` : '—'}
                </ThemedText>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Active Study Plan Block */}
      {currentPlan && (
        <Card style={styles.studyPlanCard}>
          <View style={styles.studyPlanHeader}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <ThemedText variant="h3">Personalized Study Prescription</ThemedText>
          </View>

          <View style={styles.planStatsRow}>
            <View style={styles.planStat}>
              <ThemedText variant="caption" muted style={styles.miniMono}>
                DAILY TARGET
              </ThemedText>
              <ThemedText variant="h2" style={styles.mono}>
                {currentPlan.dailyQuestionGoal} items
              </ThemedText>
            </View>
            <View style={styles.planStat}>
              <ThemedText variant="caption" muted style={styles.miniMono}>
                EXAM RUNWAY
              </ThemedText>
              <ThemedText variant="h2" style={styles.mono}>
                {currentPlan.daysRemaining} days
              </ThemedText>
            </View>
          </View>

          <View style={styles.focusList}>
            <ThemedText variant="label">Prescribed Priority Focus:</ThemedText>
            {currentPlan.focusCategories.map((focus, idx) => (
              <ThemedText key={focus} variant="body" muted>
                {idx + 1}. {focus}
              </ThemedText>
            ))}
          </View>
        </Card>
      )}

      <DisclaimerBanner
        onPressPrivacy={() => router.push('/(legal)/privacy')}
        onPressTerms={() => router.push('/(legal)/terms')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
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
    fontWeight: '700',
  },
  monoCutoff: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '600',
  },
  monoStatus: {
    fontVariant: ['tabular-nums'],
    fontSize: 11,
    fontWeight: '700',
  },
  monoTag: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  monoPercent: {
    fontVariant: ['tabular-nums'],
    width: 36,
    textAlign: 'right',
    fontWeight: '600',
  },
  miniMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    letterSpacing: 0.5,
  },
  mainCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  meterContainer: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  meterTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  passLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
  },
  readinessBar: {
    height: '100%',
    borderRadius: 6,
  },
  meterScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  cutoffMarker: {
    alignItems: 'center',
  },
  actionBanner: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  smallBtn: {
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    gap: 2,
    marginTop: spacing.xs,
  },
  categoryList: {
    gap: spacing.xs,
  },
  categoryCard: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  studyPlanCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  studyPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  planStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: spacing.sm,
  },
  planStat: {
    alignItems: 'center',
    gap: 2,
  },
  focusList: {
    gap: spacing.xs,
  },
});
