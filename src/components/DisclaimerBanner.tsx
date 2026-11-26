import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/typography';
import { ThemedText } from './ui/ThemedText';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel="Educational notice: BridgeRN is for NCLEX-RN exam preparation only, not clinical advice, and does not guarantee exam passage."
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          padding: compact ? spacing.sm : spacing.md,
        },
      ]}
    >
      <Ionicons
        name="information-circle-outline"
        size={18}
        color={colors.textMuted}
        style={styles.icon}
      />
      <ThemedText variant="caption" muted style={styles.text}>
        {compact
          ? 'Exam preparation only — not clinical advice. Readiness estimates include uncertainty and do not guarantee passing.'
          : 'Medical-Education Disclaimer: BridgeRN content is designed strictly for NCLEX-RN exam preparation and does not constitute clinical advice, diagnosis, or treatment. Practice readiness scores include a confidence range and never guarantee exam passage.'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
  },
});
