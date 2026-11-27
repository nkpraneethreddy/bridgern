import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <ThemedText variant="h2">Readiness and analytics</ThemedText>

      <Card>
        <ThemedText variant="label" muted>
          Baseline readiness range
        </ThemedText>
        <ThemedText variant="h1" style={styles.rangeValue}>
          Pending diagnostic
        </ThemedText>
        <ThemedText variant="caption" muted>
          Once you complete the 25-question diagnostic in Phase 3, you will see an
          estimated readiness confidence interval (never a pass guarantee) along with
          accuracy by Client Needs category.
        </ThemedText>
      </Card>

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
  },
  rangeValue: {
    marginVertical: spacing.xs,
  },
});
