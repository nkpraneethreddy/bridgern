import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { ThemedText } from './ThemedText';
import { CPRRating, NCLEX_CATEGORIES, useRetakeStore } from '../../stores/retakeStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { parseCPRText } from '../../services/cprParser';

const RATING_OPTIONS: { value: CPRRating; label: string; tone: 'danger' | 'warning' | 'success' }[] = [
  { value: 'below_passing', label: 'Below', tone: 'danger' },
  { value: 'near_passing', label: 'Near', tone: 'warning' },
  { value: 'above_passing', label: 'Above', tone: 'success' },
];

type InputMode = 'manual' | 'paste';

export function CPRIntakeModal() {
  const { colors } = useTheme();
  const { isModalOpen, closeModal, submitCPR } = useRetakeStore();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [pasteText, setPasteText] = useState('');
  const [parseConfidence, setParseConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [parseFeedback, setParseFeedback] = useState<string | null>(null);

  const [stoppedAt, setStoppedAt] = useState<number>(85);
  const [ratings, setRatings] = useState<Record<string, CPRRating>>(() => {
    const initial: Record<string, CPRRating> = {};
    for (const cat of NCLEX_CATEGORIES) {
      initial[cat] = 'near_passing';
    }
    return initial;
  });

  if (!isModalOpen) return null;

  const handleRatingChange = (cat: string, rating: CPRRating) => {
    setRatings((prev) => ({ ...prev, [cat]: rating }));
  };

  const handleParsePaste = () => {
    const result = parseCPRText(pasteText);
    if (!result.success) {
      setParseFeedback('Could not detect CPR categories. Try the Manual tab or check your pasted text.');
      setParseConfidence('low');
      return;
    }
    // Merge parsed ratings into state
    setRatings((prev) => ({ ...prev, ...result.ratings }));
    if (result.questionsStoppedAt) setStoppedAt(result.questionsStoppedAt);
    setParseConfidence(result.confidence);
    const count = Object.keys(result.ratings).length;
    setParseFeedback(
      `Auto-extracted ${count}/8 categories (${result.confidence} confidence). Review below and submit.`
    );
    // Switch to manual mode so user can review/tweak
    setInputMode('manual');
  };

  const handleSubmit = async () => {
    await submitCPR(
      {
        examDate: new Date().toISOString().split('T')[0],
        targetState: profile?.target_state ?? 'NY-RN',
        questionsStoppedAt: stoppedAt,
        ratings,
      },
      user?.id
    );
  };

  return (
    <Modal visible={isModalOpen} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Dismiss Bar */}
        <View style={styles.topBar}>
          <ThemedText variant="caption" muted style={styles.monoHeading}>
            RETAKE MODE · CPR INTAKE
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close CPR intake"
            onPress={closeModal}
            style={styles.closeTouch}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText variant="h1">Upload Past NCLEX Results</ThemedText>
            <ThemedText variant="body" muted>
              Input the ratings from your official Pearson VUE Candidate Performance Report (CPR).
              BridgeRN will recalibrate your study engine to focus directly on below-passing
              areas.
            </ThemedText>
          </View>

          {/* Input Mode Switcher */}
          <View style={[styles.modeSegment, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setInputMode('paste')}
              style={[
                styles.modeBtn,
                inputMode === 'paste' && { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
              ]}
            >
              <Ionicons name="clipboard-outline" size={14} color={inputMode === 'paste' ? colors.primary : colors.textMuted} />
              <ThemedText variant="caption" tone={inputMode === 'paste' ? 'primary' : 'default'}>
                Smart Paste
              </ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setInputMode('manual')}
              style={[
                styles.modeBtn,
                inputMode === 'manual' && { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
              ]}
            >
              <Ionicons name="create-outline" size={14} color={inputMode === 'manual' ? colors.primary : colors.textMuted} />
              <ThemedText variant="caption" tone={inputMode === 'manual' ? 'primary' : 'default'}>
                Manual Entry
              </ThemedText>
            </Pressable>
          </View>

          {/* Smart Paste Panel */}
          {inputMode === 'paste' && (
            <Card style={styles.sectionCard}>
              <ThemedText variant="label">Paste your Pearson VUE CPR text:</ThemedText>
              <ThemedText variant="caption" muted>
                Open your CPR PDF, select all text (Ctrl+A), copy, and paste below. The parser
                auto-detects all 8 Client Needs ratings and your exam stop count.
              </ThemedText>
              <TextInput
                multiline
                numberOfLines={8}
                value={pasteText}
                onChangeText={setPasteText}
                placeholder="Paste CPR text here…"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.pasteInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
                accessibilityLabel="Paste CPR PDF text"
              />
              {parseFeedback && (
                <View style={[
                  styles.parseFeedback,
                  {
                    backgroundColor: parseConfidence === 'high' ? colors.successSoft : parseConfidence === 'medium' ? colors.warningSoft : colors.dangerSoft,
                    borderColor: parseConfidence === 'high' ? colors.success : parseConfidence === 'medium' ? colors.warning : colors.danger,
                  },
                ]}>
                  <ThemedText variant="caption" tone={parseConfidence === 'high' ? 'success' : parseConfidence === 'medium' ? 'warning' : 'danger'}>
                    {parseFeedback}
                  </ThemedText>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Parse pasted CPR text"
                onPress={handleParsePaste}
                style={[styles.parseBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="analytics-outline" size={16} color={colors.primaryText} />
                <ThemedText variant="label" style={{ color: colors.primaryText }}>
                  Auto-Extract Ratings
                </ThemedText>
              </Pressable>
            </Card>
          )}

          {/* Stopped At Segment */}
          <Card style={styles.sectionCard}>
            <ThemedText variant="label">Number of questions before exam shut off:</ThemedText>
            <View style={styles.stoppedRow}>
              {[85, 115, 135, 150].map((num) => {
                const isSelected = stoppedAt === num;
                return (
                  <Pressable
                    key={num}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    onPress={() => setStoppedAt(num)}
                    style={[
                      styles.stoppedChip,
                      {
                        backgroundColor: isSelected ? colors.primarySoft : colors.surfaceElevated,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <ThemedText variant="label" tone={isSelected ? 'primary' : 'default'}>
                      {num} {num === 85 ? '(Min)' : num === 150 ? '(Max)' : ''}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Category CPR Ratings */}
          <View style={styles.categorySection}>
            <ThemedText variant="label" style={styles.sectionTitle}>
              Client Needs Performance on CPR:
            </ThemedText>

            {NCLEX_CATEGORIES.map((cat) => {
              const currentRating = ratings[cat] ?? 'near_passing';
              return (
                <Card key={cat} style={styles.categoryCard}>
                  <ThemedText variant="body" style={styles.categoryName}>
                    {cat}
                  </ThemedText>
                  <View style={styles.ratingSegment}>
                    {RATING_OPTIONS.map((opt) => {
                      const active = currentRating === opt.value;
                      return (
                        <Pressable
                          key={opt.value}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`${cat}: ${opt.label} passing`}
                          onPress={() => handleRatingChange(cat, opt.value)}
                          style={[
                            styles.ratingChip,
                            {
                              backgroundColor: active
                                ? opt.tone === 'danger'
                                  ? colors.dangerSoft
                                  : opt.tone === 'warning'
                                  ? colors.warningSoft
                                  : colors.successSoft
                                : colors.surfaceElevated,
                              borderColor: active
                                ? opt.tone === 'danger'
                                  ? colors.danger
                                  : opt.tone === 'warning'
                                  ? colors.warning
                                  : colors.success
                                : colors.border,
                            },
                          ]}
                        >
                          <ThemedText
                            variant="caption"
                            tone={active ? opt.tone : 'default'}
                            style={styles.chipText}
                          >
                            {opt.label}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </Card>
              );
            })}
          </View>

          {/* Submit Action */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Apply CPR remediation prescription"
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            <ThemedText variant="label" style={{ color: colors.primaryText, fontSize: 16 }}>
              Calibrate Retake Study Plan →
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  monoHeading: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  closeTouch: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  modeSegment: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    minHeight: 40,
  },
  pasteInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 140,
    textAlignVertical: 'top',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  parseFeedback: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  parseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 46,
    borderRadius: radius.md,
  },
  sectionCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  stoppedRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stoppedChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySection: {
    gap: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  categoryCard: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingSegment: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  ratingChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '700',
    fontSize: 12,
  },
  submitButton: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
