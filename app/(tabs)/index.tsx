import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useAuthStore } from '../../src/stores/authStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {/* Clinician Header */}
      <View style={styles.headerRow}>
        <View style={styles.greeting}>
          <ThemedText variant="caption" muted style={styles.monoLabel}>
            IEN PATHWAY · {profile?.target_state ?? 'NY-RN'}
          </ThemedText>
          <ThemedText variant="h1">
            {profile?.full_name ? profile.full_name : 'Maria Santos, BSN'}
          </ThemedText>
        </View>
        <View style={[styles.avatarBadge, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
          <ThemedText variant="label" tone="primary" style={styles.avatarText}>
            RN
          </ThemedText>
        </View>
      </View>

      {/* The One Craft Moment: Licensure Trajectory HUD */}
      <Card style={styles.hudCard}>
        <View style={styles.hudHeader}>
          <ThemedText variant="caption" muted style={styles.monoLabel}>
            EXAM RUNWAY
          </ThemedText>
          <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>
            <ThemedText variant="caption" tone="primary" style={styles.mono}>
              T-48 Days
            </ThemedText>
          </View>
        </View>

        {/* Milestone Steps */}
        <View style={styles.milestoneGrid}>
          <View style={[styles.milestoneItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <ThemedText variant="caption" muted style={styles.miniMono}>CGFNS</ThemedText>
            <ThemedText variant="caption" tone="success" style={styles.milestoneStatus}>Done</ThemedText>
          </View>
          <View style={[styles.milestoneItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <ThemedText variant="caption" muted style={styles.miniMono}>BOARD</ThemedText>
            <ThemedText variant="caption" tone="success" style={styles.milestoneStatus}>Done</ThemedText>
          </View>
          <View style={[styles.milestoneItem, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
            <ThemedText variant="caption" tone="primary" style={styles.miniMono}>ATT</ThemedText>
            <ThemedText variant="caption" tone="primary" style={styles.milestoneStatus}>Active</ThemedText>
          </View>
          <View style={[styles.milestoneItem, styles.milestonePending, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <ThemedText variant="caption" muted style={styles.miniMono}>NCLEX</ThemedText>
            <ThemedText variant="caption" muted style={styles.milestoneStatus}>Apr 15</ThemedText>
          </View>
        </View>

        <View style={[styles.hudFooter, { borderTopColor: colors.border }]}>
          <ThemedText variant="caption" muted>
            Target: {profile?.weekly_study_hours ?? 15}h/wk
          </ThemedText>
          <ThemedText variant="caption" tone="primary" style={styles.mono}>
            9.5h Logged
          </ThemedText>
        </View>
      </Card>

      {/* Primary Action Card */}
      <Card elevated style={styles.actionCard}>
        <View style={styles.actionHeader}>
          <View style={styles.actionTextGroup}>
            <ThemedText variant="h3">25-Item CAT Diagnostic</ThemedText>
            <ThemedText variant="caption" muted>
              Calibrate baseline accuracy across Client Needs categories.
            </ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.warningSoft }]}>
            <ThemedText variant="caption" tone="warning" style={styles.miniMono}>
              HIGH YIELD
            </ThemedText>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start calibration diagnostic"
          onPress={() => router.push('/(tabs)/practice')}
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        >
          <ThemedText variant="label" style={{ color: colors.primaryText }}>
            Begin Calibration →
          </ThemedText>
        </Pressable>
      </Card>

      {/* Subtle Micro-footer */}
      <View style={styles.footerNote}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} />
        <ThemedText variant="caption" muted style={styles.miniMono}>
          Pearson VUE Next Gen Format · Pearson-aligned Scoring
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  greeting: {
    gap: 2,
  },
  monoLabel: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  avatarBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },
  hudCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  mono: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  miniMono: {
    fontVariant: ['tabular-nums'],
    fontSize: 10,
    fontWeight: '700',
  },
  milestoneGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  milestoneItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
  },
  milestonePending: {
    opacity: 0.5,
  },
  milestoneStatus: {
    fontWeight: '700',
    fontSize: 12,
  },
  hudFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  actionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actionTextGroup: {
    flex: 1,
    gap: 2,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryButton: {
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
