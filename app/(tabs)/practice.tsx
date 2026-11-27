/**
 * Practice tab — session launcher.
 *
 * Unslop design:
 * - Quiet chrome with one teal accent on primary actions
 * - 4px grid spacing, sentence case labels
 * - No emoji, no "✨", no uppercase tracked labels
 * - Cards use nested radius (outer 16, inner 12)
 * - Tabular numbers for stats
 *
 * Psychology:
 * - Default effect: tutor mode is pre-selected (the safer,
 *   learning-oriented choice) to reduce decision paralysis.
 * - Anchoring: question counts are anchored to NCLEX-familiar
 *   values (25, 75, 145) so the practice feels exam-authentic.
 * - Autonomy support: mode selection respects the learner's
 *   agency rather than pushing them toward one option.
 * - Social proof (subtle): "Most IENs start with 25 questions"
 *   normalizes the smaller starting point to reduce overwhelm.
 * - Implementation intention: choosing settings = planning =
 *   higher follow-through (Gollwitzer, 1999).
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';
import { useSessionStore } from '../../src/stores/sessionStore';
import type { SessionConfig, QuestionWithOptions } from '../../src/engine/types';

// ─── Placeholder pool for local testing ─────────────────────────────
// In production this comes from fetchQuestions(); during MVP dev
// we generate a minimal set so the UI is testable without Supabase.
import { createPlaceholderPool } from '../../src/engine/placeholderPool';

type Mode = 'tutor' | 'exam';

const QUESTION_PRESETS = [
  { label: '10 questions', value: 10, hint: 'Quick review' },
  { label: '25 questions', value: 25, hint: 'Most IENs start here' },
  { label: '75 questions', value: 75, hint: 'NCLEX minimum' },
  { label: '145 questions', value: 145, hint: 'Full-length exam' },
];

export default function PracticeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const startSession = useSessionStore((s) => s.startSession);

  const [mode, setMode] = useState<Mode>('tutor');
  const [questionCount, setQuestionCount] = useState(25);

  const handleStart = () => {
    const pool = createPlaceholderPool();

    const config: SessionConfig = {
      mode,
      maxQuestions: questionCount,
      timeLimitSeconds: mode === 'exam' ? questionCount * 90 : 0, // ~90s per question in exam
      categoryFilter: [],
      startingDifficulty: 3,
    };

    startSession(config, pool);
    router.push('/(session)/question');
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <ThemedText variant="h2">Practice</ThemedText>
      <ThemedText variant="body" muted>
        Choose your practice mode and session length.
      </ThemedText>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        <Pressable
          onPress={() => setMode('tutor')}
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === 'tutor' }}
          accessibilityLabel="Tutor mode: instant feedback after each question"
          style={[
            styles.modeCard,
            {
              backgroundColor: mode === 'tutor' ? colors.primarySoft : colors.surface,
              borderColor: mode === 'tutor' ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons
            name="school-outline"
            size={20}
            color={mode === 'tutor' ? colors.primary : colors.textMuted}
          />
          <ThemedText
            variant="label"
            tone={mode === 'tutor' ? 'primary' : 'default'}
          >
            Tutor
          </ThemedText>
          <ThemedText variant="caption" muted>
            Instant feedback and rationale
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setMode('exam')}
          accessibilityRole="radio"
          accessibilityState={{ checked: mode === 'exam' }}
          accessibilityLabel="Exam mode: timed, no feedback until the end"
          style={[
            styles.modeCard,
            {
              backgroundColor: mode === 'exam' ? colors.primarySoft : colors.surface,
              borderColor: mode === 'exam' ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons
            name="timer-outline"
            size={20}
            color={mode === 'exam' ? colors.primary : colors.textMuted}
          />
          <ThemedText
            variant="label"
            tone={mode === 'exam' ? 'primary' : 'default'}
          >
            Exam
          </ThemedText>
          <ThemedText variant="caption" muted>
            Timed, adaptive, no feedback
          </ThemedText>
        </Pressable>
      </View>

      {/* Question count */}
      <Card>
        <ThemedText variant="label" muted>
          Session length
        </ThemedText>
        <View style={styles.presets}>
          {QUESTION_PRESETS.map((preset) => (
            <Pressable
              key={preset.value}
              onPress={() => setQuestionCount(preset.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: questionCount === preset.value }}
              style={[
                styles.preset,
                {
                  backgroundColor:
                    questionCount === preset.value
                      ? colors.primarySoft
                      : colors.surfaceElevated,
                  borderColor:
                    questionCount === preset.value
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <ThemedText
                variant="bodyMedium"
                tone={questionCount === preset.value ? 'primary' : 'default'}
                style={styles.tabular}
              >
                {preset.value}
              </ThemedText>
              <ThemedText variant="caption" muted>
                {preset.hint}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Session summary before launch */}
      <Card elevated>
        <View style={styles.summaryRow}>
          <ThemedText variant="body" muted>Mode</ThemedText>
          <ThemedText variant="bodyMedium">
            {mode === 'tutor' ? 'Tutor' : 'Exam'}
          </ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText variant="body" muted>Questions</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.tabular}>
            {questionCount}
          </ThemedText>
        </View>
        {mode === 'exam' && (
          <View style={styles.summaryRow}>
            <ThemedText variant="body" muted>Time limit</ThemedText>
            <ThemedText variant="bodyMedium" style={styles.tabular}>
              {Math.round((questionCount * 90) / 60)} min
            </ThemedText>
          </View>
        )}
      </Card>

      <Button
        title="Start session"
        onPress={handleStart}
        accessibilityLabel={`Start ${mode} session with ${questionCount} questions`}
      />

      <DisclaimerBanner compact />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    gap: spacing.xs,
    alignItems: 'center',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  preset: {
    flex: 1,
    minWidth: 80,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    gap: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
