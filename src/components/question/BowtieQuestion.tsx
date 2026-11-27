/**
 * Bowtie question renderer (NGN item type).
 *
 * Layout: three columns — Actions (left), Condition (center), Parameters (right).
 * User picks one condition, 2 actions, and 2 parameters.
 *
 * Psychology: Structural visualization — the bowtie shape maps to clinical
 * reasoning (actions → condition → monitoring), reinforcing the mental model
 * rather than treating it as an abstract selection task.
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

export function BowtieQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();
  const [center, setCenter] = useState<string | null>(null);
  const [left, setLeft] = useState<Set<string>>(new Set());
  const [right, setRight] = useState<Set<string>>(new Set());

  // Group options by bowtie zone
  const zones: Record<string, QuestionOption[]> = { center: [], left: [], right: [] };
  for (const o of question.options) {
    const zone = (o.metadata as Record<string, unknown>)?.bowtie_zone as string;
    if (zone && zones[zone]) zones[zone].push(o);
  }

  const toggleSet = (set: Set<string>, key: string, maxSize: number): Set<string> => {
    const next = new Set(set);
    if (next.has(key)) {
      next.delete(key);
    } else if (next.size < maxSize) {
      next.add(key);
    }
    return next;
  };

  const handleSubmit = () => {
    if (!center || left.size === 0 || right.size === 0) return;
    onSubmit({
      type: 'bowtie',
      center,
      left: Array.from(left),
      right: Array.from(right),
    });
  };

  const renderZone = (
    title: string,
    options: QuestionOption[],
    selectedSet: Set<string> | null,
    singleSelect: string | null,
    onSelect: (key: string) => void,
  ) => (
    <View style={styles.zone}>
      <ThemedText variant="label" muted style={styles.zoneTitle}>
        {title}
      </ThemedText>
      {options.map((opt) => {
        const isSelected = singleSelect
          ? singleSelect === opt.option_key
          : selectedSet?.has(opt.option_key) ?? false;
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
            onPress={() => !disabled && onSelect(opt.option_key)}
            disabled={disabled}
            accessibilityRole={singleSelect !== undefined ? 'radio' : 'checkbox'}
            accessibilityState={{ checked: isSelected }}
            style={[
              styles.zoneOption,
              { backgroundColor: bgColor, borderColor: borderCol },
            ]}
          >
            <ThemedText variant="caption">{opt.label}</ThemedText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.stem}>
        {question.stem}
      </ThemedText>

      <View style={styles.bowtie}>
        {renderZone('Actions', zones.left, left, null, (key) =>
          setLeft((prev) => toggleSet(prev, key, 2)),
        )}
        {renderZone('Condition', zones.center, null, center, (key) =>
          setCenter(key),
        )}
        {renderZone('Parameters', zones.right, right, null, (key) =>
          setRight((prev) => toggleSet(prev, key, 2)),
        )}
      </View>

      {!disabled && (
        <Button
          title="Submit answer"
          onPress={handleSubmit}
          disabled={!center || left.size === 0 || right.size === 0}
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
  bowtie: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  zone: {
    flex: 1,
    gap: spacing.xs,
  },
  zoneTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  zoneOption: {
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
});
