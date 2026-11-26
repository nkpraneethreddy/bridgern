import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from './ThemedText';

interface InputProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string | null;
}

export function Input({ label, hint, error, style, ...rest }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.wrapper}>
      <ThemedText variant="label" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        allowFontScaling
        maxFontSizeMultiplier={1.5}
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor,
            color: colors.text,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="caption" muted>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
});
