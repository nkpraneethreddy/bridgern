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
import { PaywallModal } from '../../src/components/ui/PaywallModal';
import { OfflineBanner } from '../../src/components/ui/OfflineBanner';
import type { SessionConfig } from '../../src/engine/types';

type Mode = 'tutor' | 'exam';

const PRESETS = [
  { count: 10, label: 'Quick Diagnostic', duration: '15 min' },
  { count: 25, label: 'Standard CAT Block', duration: '38 min' },
  { count: 75, label: 'NCLEX Minimum Length', duration: '1 hr 52 min' },
  { count: 145, label: 'Full Adaptive Simulation', duration: '3 hr 38 min' },
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

  const [mode, setMode] = useState<Mode>('tutor');
  const [selectedCount, setSelectedCount] = useState<number>(25);

  const handleLaunch = () => {
    // Check if user is entitled to selected session length
    if (!isEntitledToLength(selectedCount)) {
      openPaywall();
      return;
    }

    const pool = createPlaceholderPool();
    const config: SessionConfig = {
      mode,
      maxQuestions: selectedCount,
      timeLimitSeconds: mode === 'exam' ? selectedCount * 90 : 0,
      categoryFilter: [],
      startingDifficulty: 3,
    };
    startSession(config, pool);
    router.push('/(session)/question');
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Clinician Header Strip */}
      <View style={styles.header}>
        <ThemedText variant="caption" muted style={styles.monoHeading}>
          TEST WORKSTATION · CAT ENGINE v2.4
        </ThemedText>
        <ThemedText variant="h1">Adaptive Practice</ThemedText>
      </View>

      {/* Offline Status & Pending Sync Banner */}
      <OfflineBanner />

      {/* Mode Switcher: Physical Segmented Control */}
      <View style={[styles.modeSegment, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tutor mode with instant rationale"
          onPress={() => setMode('tutor')}
          style={[
            styles.segmentButton,
            mode === 'tutor' && [styles.segmentActive, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}
        >
          <Ionicons
            name="school-outline"
            size={16}
            color={mode === 'tutor' ? colors.primary : colors.textMuted}
          />
          <View>
            <ThemedText variant="label" tone={mode === 'tutor' ? 'primary' : 'default'}>
              Tutor Mode
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.microText}>
              Instant clinical rationale & debrief
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exam CAT mode without feedback"
          onPress={() => setMode('exam')}
          style={[
            styles.segmentButton,
            mode === 'exam' && [styles.segmentActive, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}
        >
          <Ionicons
            name="timer-outline"
            size={16}
            color={mode === 'exam' ? colors.primary : colors.textMuted}
          />
          <View>
            <ThemedText variant="label" tone={mode === 'exam' ? 'primary' : 'default'}>
              Exam (CAT)
            </ThemedText>
            <ThemedText variant="caption" muted style={styles.microText}>
              Timed, zero feedback until completion
            </ThemedText>
          </View>
        </Pressable>
      </View>

      {/* The One Craft Moment: Blueprint Distribution Strip */}
      <View style={[styles.blueprintBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.blueprintTitleRow}>
          <ThemedText variant="label">Client Needs Blueprint</ThemedText>
          <ThemedText variant="caption" tone="primary" style={styles.mono}>
            100% Calibrated
          </ThemedText>
        </View>

        {/* Proportional Segmented Strip */}
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

        {/* Blueprint Legend Grid */}
        <View style={styles.legendGrid}>
          {BLUEPRINT.slice(0, 4).map((b) => (
            <View key={b.name} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: b.color }]} />
              <ThemedText variant="caption" muted style={styles.legendLabel}>
                {b.name} ({b.weight}%)
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Session Length: Linear Selectors */}
      <View style={styles.presetsSection}>
        <ThemedText variant="label" style={styles.sectionLabel}>
          Session Target
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
                  <ThemedText variant="label" tone={isSelected ? 'primary' : 'default'} style={styles.presetCount}>
                    {p.count} Items
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
        onPress={handleLaunch}
        style={[styles.launchButton, { backgroundColor: colors.primary }]}
      >
        <ThemedText variant="label" style={{ color: colors.primaryText, fontSize: 16 }}>
          Begin {selectedCount}-Item Session →
        </ThemedText>
      </Pressable>

      <View style={styles.footerNote}>
        <ThemedText variant="caption" muted style={styles.miniMono}>
          Pearson VUE Next Gen Format · Pearson-aligned Scoring
        </ThemedText>
      </View>

      {/* Paywall Upgrade Modal */}
      <PaywallModal />
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
  },
  microText: {
    fontSize: 11,
    marginTop: 2,
  },
  modeSegment: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.sm,
    minHeight: 48,
  },
  segmentActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 52,
  },
  presetLeft: {
    gap: 2,
  },
  presetCount: {
    fontWeight: '700',
  },
  launchButton: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
