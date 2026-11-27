/**
 * Active question screen — the core practice experience.
 *
 * Shows the session header, timer (exam mode), current question,
 * and tutor feedback panel.
 *
 * Psychology principles embedded throughout:
 * - Commitment/consistency: "Question X of Y" reinforces the
 *   commitment to finish the session.
 * - Zeigarnik effect: in-progress sessions feel incomplete,
 *   driving the learner to continue.
 * - Spacing effect: difficulty adjustment spaces easy/hard
 *   questions to optimize retention.
 */

import React, { useCallback, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';
import { useSessionStore } from '../../src/stores/sessionStore';
import { QuestionRenderer } from '../../src/components/question/QuestionRenderer';
import { FeedbackPanel } from '../../src/components/question/FeedbackPanel';
import { ThemedText } from '../../src/components/ui/ThemedText';
import type { QuestionResponse } from '../../src/engine/types';

export default function QuestionScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    session,
    showingFeedback,
    submitAnswer,
    dismissFeedback,
    abandonSession,
  } = useSessionStore();

  useEffect(() => {
    if (session?.isComplete) {
      router.replace('/(session)/results');
    }
  }, [session?.isComplete, router]);

  const handleSubmit = useCallback(
    (response: QuestionResponse) => {
      submitAnswer(response);
    },
    [submitAnswer]
  );

  const handleAbandon = useCallback(() => {
    Alert.alert(
      'Suspend Examination?',
      'Your answered items and ability estimate are retained.',
      [
        { text: 'Resume Exam', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: () => {
            abandonSession();
            router.replace('/(tabs)/practice');
          },
        },
      ]
    );
  }, [abandonSession, router]);

  if (!session || !session.currentQuestion) {
    return null;
  }

  const { currentQuestion, config, questionNumber, history } = session;
  const manager = useSessionStore.getState().manager;
  const timeRemaining = manager?.getTimeRemaining();

  const formattedTime = timeRemaining != null
    ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`
    : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Pearson VUE Inspired Test Strip */}
      <View style={[styles.telemetryBar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={styles.telemetryLeft}>
          <ThemedText variant="caption" tone="primary" style={styles.monoItem}>
            QUESTION {questionNumber.toString().padStart(2, '0')}
            {config.maxQuestions > 0 ? ` / ${config.maxQuestions}` : ''}
          </ThemedText>
          <ThemedText variant="caption" muted style={styles.monoDivider}>|</ThemedText>
          <ThemedText variant="caption" muted style={styles.monoItem}>
            DIFFICULTY: LEVEL {currentQuestion.difficulty}/5
          </ThemedText>
        </View>

        {formattedTime ? (
          <View style={styles.timerPill}>
            <View style={[styles.pulseDot, { backgroundColor: colors.warning }]} />
            <ThemedText variant="caption" tone="warning" style={styles.mono}>
              {formattedTime}
            </ThemedText>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Suspend examination"
            onPress={handleAbandon}
            style={styles.suspendButton}
          >
            <ThemedText variant="caption" muted>
              Suspend
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: spacing.xl + insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <QuestionRenderer
          question={currentQuestion}
          onSubmit={handleSubmit}
          feedback={showingFeedback ? session.lastScoreResult : null}
          disabled={showingFeedback}
        />

        {showingFeedback && session.lastScoreResult && session.lastQuestion && (
          <FeedbackPanel
            question={session.lastQuestion}
            result={session.lastScoreResult}
            onContinue={dismissFeedback}
          />
        )}
      </ScrollView>

      {/* Persistent Bottom Bar when in Exam mode to Suspend cleanly */}
      {config.mode === 'exam' && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Suspend exam"
            onPress={handleAbandon}
            style={styles.exitLink}
          >
            <Ionicons name="exit-outline" size={16} color={colors.textMuted} />
            <ThemedText variant="caption" muted>
              Suspend Exam
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  telemetryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monoItem: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  monoDivider: {
    marginHorizontal: 2,
    opacity: 0.4,
  },
  mono: {
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  suspendButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  exitLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
});
