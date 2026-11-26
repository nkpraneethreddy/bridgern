import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function PracticeScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <ThemedText variant="h2">Practice Modes</ThemedText>
      <ThemedText variant="body" muted>
        Exam-faithful Next Gen NCLEX practice is being wired in Phase 2.
      </ThemedText>

      <Card>
        <ThemedText variant="h3">Tutor Mode</ThemedText>
        <ThemedText variant="body" muted>
          Untimed questions with instant rationale and per-option explanations.
        </ThemedText>
      </Card>

      <Card>
        <ThemedText variant="h3">Timed Adaptive Exam</ThemedText>
        <ThemedText variant="body" muted>
          Computerized-adaptive item selection across all NCLEX item types.
        </ThemedText>
      </Card>

      <Card>
        <ThemedText variant="h3">Offline Question Packs</ThemedText>
        <ThemedText variant="body" muted>
          Download categories to SQLite for low-bandwidth or shift-break study (Phase 4).
        </ThemedText>
      </Card>

      <DisclaimerBanner compact />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
});
