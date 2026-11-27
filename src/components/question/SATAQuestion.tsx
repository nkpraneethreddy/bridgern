/**
 * Select All That Apply (SATA) question renderer.
 *
 * Psychology: Checkbox affordance signals "multiple answers possible"
 * immediately, reducing anxiety about whether to pick more than one.
 * The count badge uses anchoring — showing "Select all that apply"
 * nudges completeness rather than satisficing.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export function SATAQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    onSubmit({ type: 'sata', selected: Array.from(selected) });
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.stem}>
        {question.stem}
      </ThemedText>

      <ThemedText variant="caption" muted>
        Select all that apply
      </ThemedText>

      <View style={styles.options}>
        {question.options.map((opt) => {
          const isSelected = selected.has(opt.option_key);
          const fb = feedback?.optionFeedback[opt.option_key];

          let bgColor = colors.surface;
          let borderCol = colors.border;

          if (fb === 'correct') {
            bgColor = colors.successSoft;
            borderCol = colors.success;
          } else if (fb === 'incorrect') {
            bgColor = colors.dangerSoft;
            borderCol = colors.danger;
          } else if (fb === 'missed') {
            bgColor = colors.warningSoft;
            borderCol = colors.warning;
          } else if (isSelected) {
            bgColor = colors.primarySoft;
            borderCol = colors.primary;
          }

          return (
            <Pressable
              key={opt.id}
              onPress={() => toggle(opt.option_key)}
              disabled={disabled}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Option ${opt.option_key}: ${opt.label}`}
              style={[
                styles.option,
                { backgroundColor: bgColor, borderColor: borderCol },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isSelected || fb ? borderCol : colors.textMuted,
                    backgroundColor: isSelected || fb === 'correct' ? borderCol : 'transparent',
                  },
                ]}
              >
                {(isSelected || fb === 'correct') && (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={colors.primaryText}
                  />
                )}
              </View>
              <View style={styles.optionContent}>
                <ThemedText variant="body" style={styles.optionLabel}>
                  {opt.label}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      {!disabled && (
        <View style={styles.submitRow}>
          <ThemedText variant="caption" muted>
            {selected.size} selected
          </ThemedText>
          <Button
            title="Submit answer"
            onPress={handleSubmit}
            disabled={selected.size === 0}
            style={styles.submitButton}
          />
        </View>
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    flex: 1,
  },
  submitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    flex: 0,
    paddingHorizontal: 24,
  },
});
