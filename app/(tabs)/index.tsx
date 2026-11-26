import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { useAuthStore } from '../../src/stores/authStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function HomeScreen() {
  const { colors } = useTheme();
  const profile = useAuthStore((s) => s.profile);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.greeting}>
        <ThemedText variant="h1">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
        </ThemedText>
        <ThemedText variant="body" muted>
          {profile?.country_of_education ?? 'IEN'} → Target Board:{' '}
          {profile?.target_state ?? 'Not set'}
        </ThemedText>
      </View>

      <Card>
        <ThemedText variant="label" tone="primary">
          STUDY SNAPSHOT
        </ThemedText>
        <View style={styles.row}>
          <View style={styles.metric}>
            <ThemedText variant="caption" muted>
              Current Location
            </ThemedText>
            <ThemedText variant="bodyMedium">
              {profile?.current_country ?? '—'}
            </ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText variant="caption" muted>
              Weekly Goal
            </ThemedText>
            <ThemedText variant="bodyMedium">
              {profile?.weekly_study_hours ?? 10} hrs/wk
            </ThemedText>
          </View>
          <View style={styles.metric}>
            <ThemedText variant="caption" muted>
              Exam Date
            </ThemedText>
            <ThemedText variant="bodyMedium">
              {profile?.exam_date ?? 'Pending ATT'}
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card elevated>
        <ThemedText variant="h3">Next Milestone: 25-Question Diagnostic</ThemedText>
        <ThemedText variant="body" muted style={styles.cardBody}>
          Coming in Phase 2 & 3: take a calm baseline assessment across all NCLEX-RN
          Client Needs categories to generate your tailored study plan.
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
  greeting: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  cardBody: {
    marginTop: spacing.xs,
  },
});
