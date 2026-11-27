/**
 * TimerBar — exam mode countdown display.
 *
 * Unslop: quiet bar that only draws attention when time is low.
 * Uses a surface step, not a bright color, until < 20% remains.
 *
 * Psychology: Loss aversion — framed as "time remaining" rather
 * than "time elapsed" so running out feels like losing something.
 * Urgency only escalates in the last 20%, avoiding premature anxiety.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';

interface TimerBarProps {
  /** Time remaining in seconds (null = no time limit) */
  timeRemaining: number | null;
  /** Total time limit in seconds */
  timeTotal: number;
}

export function TimerBar({ timeRemaining, timeTotal }: TimerBarProps) {
  const { colors } = useTheme();

  if (timeRemaining === null) return null;

  const fraction = timeTotal > 0 ? timeRemaining / timeTotal : 1;
  const isUrgent = fraction < 0.2;
  const isCritical = fraction < 0.1;

  const barColor = isCritical
    ? colors.danger
    : isUrgent
    ? colors.warning
    : colors.primary;

  const formatted = useMemo(() => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: `${Math.max(0, fraction * 100)}%`,
            },
          ]}
        />
      </View>
      <ThemedText
        variant="caption"
        tone={isCritical ? 'danger' : isUrgent ? 'warning' : 'default'}
        style={styles.label}
      >
        {formatted} remaining
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
  label: {
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
