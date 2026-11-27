import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';
import { useSessionStore } from '../../src/stores/sessionStore';
import { createPlaceholderPool } from '../../src/engine/placeholderPool';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { useRetakeStore } from '../../src/stores/retakeStore';
import { PaywallModal } from '../../src/components/ui/PaywallModal';
import { CPRIntakeModal } from '../../src/components/ui/CPRIntakeModal';
import { OfflineBanner } from '../../src/components/ui/OfflineBanner';
import type { SessionConfig } from '../../src/engine/types';

type Mode = 'tutor' | 'exam';

const PRESETS = [
  { count: 10, label: 'Quick Diagnostic', duration: '15 min' },
  { count: 25, label: 'Standard CAT Block', duration: '35 min' },
  { count: 85, label: 'NGN Minimum Length', duration: '2 hr' },
  { count: 150, label: 'Full NGN Simulation', duration: '4 hr' },
];

const BLUEPRINT = [
  { name: 'Management of Care', weight: 18, color: '#0D6E6E' },
  { name: 'Pharmacological & Parenteral', weight: 16, color: '#2563EB' },
  { name: 'Physiological Adaptation', weight: 14, color: '#DB2777' },
  { name: 'Safety & Infection Control', weight: 13, color: '#7C3AED' },
  { name: 'Reduction of Risk Potential', weight: 12, color: '#EA580C' },
  { name: 'Basic Care & Comfort', weight: 9, color: '#059669' },
  { name: 'Psychosocial Integrity', weight: 9, color: '#4B5563' },
  { name: 'Health Promotion & Maint.', weight: 9, color: '#65A30D' },
];

export default function PracticeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const startSession = useSessionStore((s) => s.startSession);
  const { isEntitledToLength, openPaywall } = useSubscriptionStore();
  const { isRetakeModeActive, pastReport, openModal: openRetakeModal } = useRetakeStore();

  const [mode, setMode] = useState<Mode>('tutor');
  const [selectedCount, setSelectedCount] = useState<number>(25);

  const handleLaunch = (customCount?: number, categoryOverride?: string[]) => {
    const countToUse = customCount ?? selectedCount;

    // Check subscription entitlement
    if (!isEntitledToLength(countToUse)) {
      openPaywall();
      return;
    }

    const pool = createPlaceholderPool();
    const config: SessionConfig = {
      mode,
      maxQuestions: countToUse,
      timeLimitSeconds: mode === 'exam' ? countToUse * 90 : 0,
      categoryFilter:
        categoryOverride ??
        (isRetakeModeActive ? (pastReport?.weakCategories ?? []) : []),
      startingDifficulty: 3,
    };
    startSession(config, pool);
    router.push('/(session)/question');
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Clinician Header */}
      <View style={styles.header}>
        <ThemedText variant="caption" muted style={styles.monoHeading}>
          ADAPTIVE QUESTION WORKSTATION
        </ThemedText>
        <ThemedText variant="h1">Adaptive Practice</ThemedText>
        <ThemedText variant="caption" muted>
          Every question adapts to your ability level using Pearson VUE CAT algorithms.
        </ThemedText>
      </View>

      {/* Offline Status */}
      <OfflineBanner />

      {/* Retake Mode CPR Remediation Banner */}
      <View
        style={[
          styles.retakeCard,
          {
            backgroundColor: isRetakeModeActive ? colors.warningSoft : colors.surfaceElevated,
            borderColor: isRetakeModeActive ? colors.warning : colors.border,
          },
        ]}
      >
        <View style={styles.retakeLeft}>
          <Ionicons
            name={isRetakeModeActive ? 'medkit' : 'document-text-outline'}
            size={18}
            color={isRetakeModeActive ? colors.warning : colors.textMuted}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText variant="label" tone={isRetakeModeActive ? 'warning' : 'default'}>
              {isRetakeModeActive ? 'Retake Mode Active' : 'Repeat NCLEX Candidate?'}
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.microText}>
              {isRetakeModeActive
                ? `Remediating ${pastReport?.weakCategories.length ?? 0} deficit categories from your CPR`
                : 'Input your Pearson VUE CPR results for automatic deficit targeting'}
            </ThemedText>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isRetakeModeActive ? 'Edit CPR ratings' : 'Input CPR'}
          onPress={openRetakeModal}
          style={[
            styles.retakeBtn,
            { borderColor: isRetakeModeActive ? colors.warning : colors.primary },
          ]}
        >
          <ThemedText variant="caption" tone={isRetakeModeActive ? 'warning' : 'primary'}>
            {isRetakeModeActive ? 'Edit CPR' : 'Input CPR'}
          </ThemedText>
        </Pressable>
      </View>

      {/* CPR Emergency Drill (Retake Mode 1-Tap Quick Action) */}
      {isRetakeModeActive && pastReport && pastReport.weakCategories.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Launch CPR Emergency Drill targeting below-passing categories"
          onPress={() => handleLaunch(25, pastReport.weakCategories)}
          style={[
            styles.drillButton,
            { backgroundColor: colors.surface, borderColor: colors.warning },
          ]}
        >
          <View style={styles.drillButtonLeft}>
            <Ionicons name="flash-outline" size={18} color={colors.warning} />
            <View style={{ gap: 2, flex: 1 }}>
              <ThemedText variant="label" tone="warning">
                CPR Deficit Drill
              </ThemedText>
              <ThemedText variant="caption" muted style={styles.microText}>
                25 rapid questions targeted strictly to your {pastReport.weakCategories.length} weak categories
              </ThemedText>
            </View>
          </View>
          <ThemedText variant="caption" tone="warning" style={styles.mono}>
            Start Drill →
          </ThemedText>
        </Pressable>
      )}

      {/* Retake Autopsy Insight Tip (When active) */}
      {isRetakeModeActive && pastReport?.autopsyInsight && (
        <View
          style={[
            styles.autopsyBox,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <View style={styles.autopsyHeader}>
            <Ionicons name="bulb-outline" size={16} color={colors.primary} />
            <ThemedText variant="label" tone="primary">
              Clinical Strategy: {pastReport.autopsyInsight.title}
            </ThemedText>
          </View>
          <ThemedText variant="caption" muted style={{ lineHeight: 18 }}>
            {pastReport.autopsyInsight.summary}
          </ThemedText>
        </View>
      )}

      {/* Practice Mode Switcher */}
      <View style={[styles.modeSegment, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutor mode with instant rationale"
          onPress={() => setMode('tutor')}
          style={[
            styles.segmentButton,
            mode === 'tutor' && [
              styles.segmentActive,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ],
          ]}
        >
          <Ionicons
            name="school-outline"
            size={16}
            color={mode === 'tutor' ? colors.primary : colors.textMuted}
          />
          <View style={{ flex: 1 }}>
            <ThemedText variant="label" tone={mode === 'tutor' ? 'primary' : 'default'}>
              Tutor Mode
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.microText}>
              Immediate clinical rationales
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exam CAT mode without feedback"
          onPress={() => setMode('exam')}
          style={[
            styles.segmentButton,
            mode === 'exam' && [
              styles.segmentActive,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ],
          ]}
        >
          <Ionicons
            name="timer-outline"
            size={16}
            color={mode === 'exam' ? colors.primary : colors.textMuted}
          />
          <View style={{ flex: 1 }}>
            <ThemedText variant="label" tone={mode === 'exam' ? 'primary' : 'default'}>
              Exam (CAT)
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.microText}>
              Timed, zero feedback until end
            </ThemedText>
          </View>
        </Pressable>
      </View>

      {/* Session Length Selector */}
      <View style={styles.presetsSection}>
        <ThemedText variant="label" style={styles.sectionLabel}>
          Session Length
        </ThemedText>
        <View style={styles.presetsList}>
          {PRESETS.map((p) => {
            const isSelected = selectedCount === p.count;
            return (
              <Pressable
                key={p.count}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => setSelectedCount(p.count)}
                style={[
                  styles.presetRow,
                  {
                    backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.presetLeft}>
                  <ThemedText
                    variant="label"
                    tone={isSelected ? 'primary' : 'default'}
                    style={styles.presetCount}
                  >
                    {p.count} Questions
                  </ThemedText>
                  <ThemedText variant="caption" muted>
                    {p.label}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" muted style={styles.mono}>
                  {p.duration}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Launch Action */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Begin ${selectedCount} item ${mode} session`}
        onPress={() => handleLaunch()}
        style={[styles.launchButton, { backgroundColor: colors.primary }]}
      >
        <ThemedText variant="label" style={{ color: colors.primaryText, fontSize: 16 }}>
          Begin {selectedCount}-Question {mode === 'tutor' ? 'Tutor' : 'CAT Exam'} →
        </ThemedText>
      </Pressable>

      {/* Blueprint Distribution Strip */}
      <View
        style={[
          styles.blueprintBlock,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.blueprintTitleRow}>
          <ThemedText variant="label">Client Needs Blueprint</ThemedText>
          <ThemedText variant="caption" muted style={styles.miniMono}>
            NCSBN TEST PLAN
          </ThemedText>
        </View>

        <View style={styles.stripTrack}>
          {BLUEPRINT.map((b) => (
            <View
              key={b.name}
              style={[
                styles.stripSegment,
                { width: `${b.weight}%`, backgroundColor: b.color },
              ]}
            />
          ))}
        </View>

        <View style={styles.legendGrid}>
          {BLUEPRINT.map((b) => (
            <View key={b.name} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: b.color }]} />
              <ThemedText variant="caption" muted style={styles.legendLabel}>
                {b.name} ({b.weight}%)
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Modals */}
      <PaywallModal />
      <CPRIntakeModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontWeight: '600',
  },
  miniMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    letterSpacing: 0.5,
  },
  microText: {
    fontSize: 11,
    marginTop: 2,
  },
  modeSegment: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
    minHeight: 48,
  },
  segmentActive: {
    borderWidth: 1,
  },
  blueprintBlock: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  blueprintTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stripTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 1,
  },
  stripSegment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
  },
  presetsSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    marginBottom: 2,
  },
  presetsList: {
    gap: spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 50,
  },
  presetLeft: {
    gap: 2,
  },
  presetCount: {
    fontWeight: '700',
  },
  launchButton: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  retakeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  retakeBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    minHeight: 32,
    justifyContent: 'center',
  },
  drillButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 52,
  },
  drillButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  autopsyBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  autopsyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
