import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function LegalLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy Policy',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Terms of Service',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
