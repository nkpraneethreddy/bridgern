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
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';
import { useSessionStore } from '../../src/stores/sessionStore';
import { QuestionRenderer } from '../../src/components/question/QuestionRenderer';
import { FeedbackPanel } from '../../src/components/question/FeedbackPanel';
import { TimerBar } from '../../src/components/question/TimerBar';
import { SessionHeader } from '../../src/components/question/SessionHeader';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Button } from '../../src/components/ui/Button';
import type { QuestionResponse } from '../../src/engine/types';

export default function QuestionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    session,
    showingFeedback,
    submitAnswer,
    dismissFeedback,
    abandonSession,
  } = useSessionStore();

  // Navigate to results when session completes
  useEffect(() => {
    if (session?.isComplete) {
      router.replace('/(session)/results');
    }
  }, [session?.isComplete, router]);

  const handleSubmit = useCallback(
    (response: QuestionResponse) => {
      submitAnswer(response);
    },
    [submitAnswer],
  );

  const handleAbandon = useCallback(() => {
    Alert.alert(
      'End session early?',
      'Your progress so far will be saved.',
      [
        { text: 'Continue studying', style: 'cancel' },
        {
          text: 'End session',
          style: 'destructive',
          onPress: () => {
            abandonSession();
            router.replace('/(tabs)/practice');
          },
        },
      ],
    );
  }, [abandonSession, router]);

  if (!session || !session.currentQuestion) {
    return null;
  }

  const { currentQuestion, config, questionNumber, history, readiness } = session;
  const manager = useSessionStore.getState().manager;
  const timeRemaining = manager?.getTimeRemaining() ?? null;
  const progress = manager?.getProgress() ?? 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Session header with progress */}
      <SessionHeader
        questionNumber={questionNumber}
        totalQuestions={config.maxQuestions}
        progress={progress}
        mode={config.mode}
        correctCount={session.totalPointsEarned}
        answeredCount={history.length}
      />

      {/* Timer (exam mode) */}
      {config.mode === 'exam' && config.timeLimitSeconds > 0 && (
        <TimerBar
          timeRemaining={timeRemaining}
          timeTotal={config.timeLimitSeconds}
        />
      )}

      {/* Question */}
      <QuestionRenderer
        question={currentQuestion}
        onSubmit={handleSubmit}
        feedback={showingFeedback ? session.lastScoreResult : null}
        disabled={showingFeedback}
      />

      {/* Tutor mode feedback */}
      {showingFeedback && session.lastScoreResult && session.lastQuestion && (
        <FeedbackPanel
          question={session.lastQuestion}
          result={session.lastScoreResult}
          onContinue={dismissFeedback}
        />
      )}

      {/* End session button */}
      <View style={styles.footer}>
        <Button
          title="End session"
          variant="outline"
          onPress={handleAbandon}
        />
        <DisclaimerBanner compact />
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
  footer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
