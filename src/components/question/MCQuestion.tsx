/**
 * Multiple choice question renderer.
 *
 * Unslop design: quiet options with a single teal accent on selection,
 * subtle surface-step feedback states, no emoji or decorative elements.
 *
 * Psychology: Serial position effect — options are presented in a clean
 * vertical list with equal spacing so each gets fair cognitive weight.
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

export function MCQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit({ type: 'multiple_choice', selected });
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.stem}>
        {question.stem}
      </ThemedText>

      <View style={styles.options}>
        {question.options.map((opt, index) => {
          const isSelected = selected === opt.option_key;
          const fb = feedback?.optionFeedback[opt.option_key];

          let bgColor = colors.surface;
          let borderCol = colors.border;
          let labelTone: 'default' | 'primary' | 'success' | 'danger' = 'default';

          if (fb === 'correct') {
            bgColor = colors.successSoft;
            borderCol = colors.success;
            labelTone = 'success';
          } else if (fb === 'incorrect') {
            bgColor = colors.dangerSoft;
            borderCol = colors.danger;
            labelTone = 'danger';
          } else if (fb === 'missed') {
            bgColor = colors.successSoft;
            borderCol = colors.success;
          } else if (isSelected) {
            bgColor = colors.primarySoft;
            borderCol = colors.primary;
            labelTone = 'primary';
          }

          return (
            <Pressable
              key={opt.id}
              onPress={() => !disabled && setSelected(opt.option_key)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Option ${opt.option_key}: ${opt.label}`}
              style={[
                styles.option,
                {
                  backgroundColor: bgColor,
                  borderColor: borderCol,
                },
              ]}
            >
              <View
                style={[
                  styles.optionKey,
                  {
                    backgroundColor: isSelected || fb ? borderCol : colors.surfaceElevated,
                  },
                ]}
              >
                <ThemedText
                  variant="label"
                  style={{
                    color: isSelected || fb ? colors.primaryText : colors.textMuted,
                  }}
                >
                  {opt.option_key}
                </ThemedText>
              </View>
              <ThemedText
                variant="body"
                tone={labelTone}
                style={styles.optionLabel}
              >
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
          accessibilityLabel="Submit your answer"
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
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  optionKey: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
  },
});
