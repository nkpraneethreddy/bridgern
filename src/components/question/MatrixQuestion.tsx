/**
 * Matrix / Grid question renderer.
 *
 * Rows are option keys, columns are defined in clinical_data.columns.
 * User picks one column per row.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

export function MatrixQuestion({ question, onSubmit, feedback, disabled }: Props) {
  const { colors } = useTheme();
  const [selections, setSelections] = useState<Record<string, string>>({});

  const columns = ((question.clinical_data as Record<string, unknown>)?.columns as string[]) ?? [];

  const selectCell = (rowKey: string, colKey: string) => {
    if (disabled) return;
    setSelections((prev) => ({ ...prev, [rowKey]: colKey }));
  };

  const handleSubmit = () => {
    if (Object.keys(selections).length < question.options.length) return;
    onSubmit({ type: 'matrix', selections });
  };

  const allFilled = Object.keys(selections).length >= question.options.length;

  return (
    <View style={styles.container}>
      <ThemedText variant="body" style={styles.stem}>
        {question.stem}
      </ThemedText>

      <ThemedText variant="caption" muted>
        Select one answer per row
      </ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.rowLabel} />
            {columns.map((col) => (
              <View key={col} style={styles.colHeader}>
                <ThemedText variant="caption" muted style={styles.colHeaderText}>
                  {col}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {question.options.map((opt, rowIdx) => {
            const fb = feedback?.optionFeedback[opt.option_key];
            const correctCol = (opt.metadata as Record<string, unknown>)?.correct_column as string | undefined;

            return (
              <View
                key={opt.id}
                style={[
                  styles.dataRow,
                  {
                    backgroundColor: rowIdx % 2 === 0 ? colors.surface : colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.rowLabel}>
                  <ThemedText variant="body">{opt.label}</ThemedText>
                </View>
                {columns.map((col) => {
                  const isSelected = selections[opt.option_key] === col;
                  const isCorrectCell = fb && correctCol === col;
                  const isWrongCell = fb === 'incorrect' && isSelected && correctCol !== col;

                  let cellBg = 'transparent';
                  let cellBorder = colors.border;
                  if (isCorrectCell) {
                    cellBg = colors.successSoft;
                    cellBorder = colors.success;
                  } else if (isWrongCell) {
                    cellBg = colors.dangerSoft;
                    cellBorder = colors.danger;
                  } else if (isSelected) {
                    cellBg = colors.primarySoft;
                    cellBorder = colors.primary;
                  }

                  return (
                    <Pressable
                      key={col}
                      onPress={() => selectCell(opt.option_key, col)}
                      disabled={disabled}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isSelected }}
                      style={[styles.cell, { backgroundColor: cellBg, borderColor: cellBorder }]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: cellBorder },
                          ]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {!disabled && (
        <Button
          title="Submit answer"
          onPress={handleSubmit}
          disabled={!allFilled}
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
  headerRow: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  rowLabel: {
    width: 160,
    paddingRight: spacing.sm,
    justifyContent: 'center',
  },
  colHeader: {
    width: 80,
    alignItems: 'center',
  },
  colHeaderText: {
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  cell: {
    width: 80,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    marginHorizontal: 4,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
