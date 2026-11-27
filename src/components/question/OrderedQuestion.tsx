/**
 * Drag-and-drop ordering question renderer.
 *
 * Since React Native doesn't have native drag-and-drop easily,
 * this uses up/down arrow buttons to reorder items.
 * Clean, accessible, works on low-end devices.
 *
 * Psychology: Procedural memory — physically arranging items
 * reinforces sequence learning better than passive recognition.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from '../ui/ThemedText';
import { Button } from '../ui/Button';
import type { QuestionWithOptions, QuestionResponse, ScoreResult } from '../../engine/types';
import type { QuestionOption } from '../../types/database';

interface Props {
  question: QuestionWithOptions;
  onSubmit: (response: QuestionResponse) => void;
  feedback: ScoreResult | null;
  disabled: boolean;
}

export function OrderedQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();
  const [items, setItems] = useState<QuestionOption[]>([...question.options]);

  const moveUp = (index: number) => {
    if (index === 0 || disabled) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1 || disabled) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit({
      type: 'ordered_response',
      order: items.map((i) => i.option_key),
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.stem}>
        {question.stem}
      </ThemedText>

      <ThemedText variant="caption" muted>
        Arrange in the correct order
      </ThemedText>

      <View style={styles.items}>
        {items.map((opt, index) => {
          const fb = feedback?.optionFeedback[opt.option_key];

          let bgColor = colors.surface;
          let borderCol = colors.border;
          if (fb === 'correct') {
            bgColor = colors.successSoft;
            borderCol = colors.success;
          } else if (fb === 'incorrect') {
            bgColor = colors.dangerSoft;
            borderCol = colors.danger;
          }

          return (
            <View
              key={opt.id}
              style={[
                styles.item,
                { backgroundColor: bgColor, borderColor: borderCol },
              ]}
            >
              <View
                style={[
                  styles.position,
                  { backgroundColor: colors.surfaceElevated },
                ]}
              >
                <ThemedText variant="label" muted>
                  {index + 1}
                </ThemedText>
              </View>

              <ThemedText variant="body" style={styles.itemLabel}>
                {opt.label}
              </ThemedText>

              {!disabled && (
                <View style={styles.arrows}>
                  <Pressable
                    onPress={() => moveUp(index)}
                    disabled={index === 0}
                    accessibilityLabel={`Move ${opt.label} up`}
                    style={[
                      styles.arrowButton,
                      { borderColor: colors.border, opacity: index === 0 ? 0.3 : 1 },
                    ]}
                  >
                    <ThemedText variant="caption" muted>
                      ▲
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => moveDown(index)}
                    disabled={index >= items.length - 1}
                    accessibilityLabel={`Move ${opt.label} down`}
                    style={[
                      styles.arrowButton,
                      {
                        borderColor: colors.border,
                        opacity: index >= items.length - 1 ? 0.3 : 1,
                      },
                    ]}
                  >
                    <ThemedText variant="caption" muted>
                      ▼
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {!disabled && (
        <Button
          title="Submit answer"
          onPress={handleSubmit}
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
  items: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  position: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
  },
  arrows: {
    gap: 2,
  },
  arrowButton: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
  },
});
