import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/typography';
import { ThemedText } from './ui/ThemedText';

interface DisclaimerBannerProps {
  compact?: boolean;
  /** Optional callback when user taps Privacy Policy */
  onPressPrivacy?: () => void;
  /** Optional callback when user taps Terms */
  onPressTerms?: () => void;
}

export function DisclaimerBanner({
  compact = false,
  onPressPrivacy,
  onPressTerms,
}: DisclaimerBannerProps) {
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
      <View style={styles.textBlock}>
        <ThemedText variant="caption" muted>
          {compact
            ? 'Exam preparation only — not clinical advice. Scores do not guarantee passing. '
            : 'Medical-Education Disclaimer: BridgeRN content is designed strictly for NCLEX-RN exam preparation and does not constitute clinical advice, diagnosis, or treatment. Practice readiness scores include a confidence range and never guarantee exam passage. '}
        </ThemedText>
        {(onPressPrivacy || onPressTerms) && (
          <View style={styles.linkRow}>
            {onPressPrivacy && (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open Privacy Policy"
                onPress={onPressPrivacy}
                style={styles.linkTouch}
              >
                <ThemedText variant="caption" tone="primary">
                  Privacy Policy
                </ThemedText>
              </Pressable>
            )}
            {onPressPrivacy && onPressTerms && (
              <ThemedText variant="caption" muted>
                {' · '}
              </ThemedText>
            )}
            {onPressTerms && (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Open Terms of Service"
                onPress={onPressTerms}
                style={styles.linkTouch}
              >
                <ThemedText variant="caption" tone="primary">
                  Terms
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}
      </View>
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
  textBlock: {
    flex: 1,
    gap: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  linkTouch: {
    minHeight: 32,
    justifyContent: 'center',
  },
});
