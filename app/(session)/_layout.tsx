/**
 * Session route group layout — full-screen, no tabs.
 * Prevents accidental navigation during a practice session.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function SessionLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        gestureEnabled: false, // Prevent swipe-back during session
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="question"
        options={{
          title: 'Practice',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          title: 'Session results',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
