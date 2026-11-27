/**
 * Hot spot question renderer.
 *
 * Displays labeled regions as tappable areas.
 * In a full implementation, this would overlay an image;
 * for the MVP, regions are shown as a grid of labeled zones.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';
import { Button } from '../ui/Button';
import type { QuestionWithOptions, QuestionResponse, ScoreResult } from '../../engine/types';

interface Props {
  question: QuestionWithOptions;
  onSubmit: (response: QuestionResponse) => void;
  feedback: ScoreResult | null;
  disabled: boolean;
}

export function HotSpotQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit({ type: 'hot_spot', selected });
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.stem}>
        {question.stem}
      </ThemedText>

      <ThemedText variant="caption" muted>
        Select the correct region
      </ThemedText>

      <View style={styles.grid}>
        {question.options.map((opt) => {
          const isSelected = selected === opt.option_key;
          const fb = feedback?.optionFeedback[opt.option_key];

          let bgColor = colors.surfaceElevated;
          let borderCol = colors.border;
          if (fb === 'correct') {
            bgColor = colors.successSoft;
            borderCol = colors.success;
          } else if (fb === 'incorrect') {
            bgColor = colors.dangerSoft;
            borderCol = colors.danger;
          } else if (fb === 'missed') {
            bgColor = colors.successSoft;
            borderCol = colors.success;
          } else if (isSelected) {
            bgColor = colors.primarySoft;
            borderCol = colors.primary;
          }

          return (
            <Pressable
              key={opt.id}
              onPress={() => !disabled && setSelected(opt.option_key)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Region: ${opt.label}`}
              style={[
                styles.zone,
                { backgroundColor: bgColor, borderColor: borderCol },
              ]}
            >
              <ThemedText variant="label" style={{ textAlign: 'center' }}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {!disabled && (
        <Button
          title="Submit answer"
          onPress={handleSubmit}
          disabled={!selected}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  stem: {
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  zone: {
    width: '47%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
