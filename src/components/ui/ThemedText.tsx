import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/typography';

export type TextVariant = keyof typeof typography;

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  muted?: boolean;
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function ThemedText({
  variant = 'body',
  muted = false,
  tone = 'default',
  style,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();

  const resolvedColor =
    tone === 'primary'
      ? colors.primary
      : tone === 'success'
      ? colors.success
      : tone === 'warning'
      ? colors.warning
      : tone === 'danger'
      ? colors.danger
      : muted
      ? colors.textMuted
      : colors.text;

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={1.6}
      style={[typography[variant], { color: resolvedColor }, style]}
      {...rest}
    />
  );
}
