/**
 * IENDrugGuideModal — Searchable US vs. International Drug Cross-Reference.
 *
 * Dedicated clinical reference modal for Internationally Educated Nurses:
 * - Search by US Generic or International/Brand name (e.g. Paracetamol -> Acetaminophen)
 * - Phonetic pronunciation guide
 * - ISMP High-Alert badges
 * - NCLEX Priority Nursing Rules
 */

import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from './ThemedText';
import { Card } from './Card';
import {
  IENDrugEntry,
  searchIENPharmacopeia,
} from '../../services/ienPharmacopeia';

interface IENDrugGuideModalProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function IENDrugGuideModal({
  visible,
  onClose,
  initialQuery = '',
}: IENDrugGuideModalProps) {
  const { colors } = useTheme();
  const [search, setSearch] = useState(initialQuery);

  if (!visible) return null;

  const results = searchIENPharmacopeia(search);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Top Header Bar */}
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <View style={{ gap: 2, flex: 1 }}>
            <ThemedText variant="caption" muted style={styles.monoHeading}>
              IEN PHARMACOPEIA · US DRUG CONVERTER
            </ThemedText>
            <ThemedText variant="h2">US vs. International Drugs</ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close IEN drug guide"
            onPress={onClose}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search US generic or international name (e.g., Paracetamol)…"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search drug cross-reference"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          <ThemedText variant="caption" muted style={styles.searchCount}>
            Showing {results.length} NCLEX High-Yield Medications
          </ThemedText>
        </View>

        {/* Drug Cards Scroll Area */}
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((drug) => (
            <DrugCard key={drug.usGeneric} drug={drug} />
          ))}

          {results.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="medical-outline" size={32} color={colors.textMuted} />
              <ThemedText variant="body" muted>
                No medication matches found for "{search}".
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function DrugCard({ drug }: { drug: IENDrugEntry }) {
  const { colors } = useTheme();

  return (
    <Card style={styles.card}>
      {/* Title & High Alert Badge */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.titleRow}>
            <ThemedText variant="h3">{drug.usGeneric}</ThemedText>
            {drug.isHighAlert && (
              <View style={[styles.highAlertBadge, { backgroundColor: colors.dangerSoft }]}>
                <Ionicons name="warning-outline" size={12} color={colors.danger} />
                <ThemedText variant="caption" tone="danger" style={styles.highAlertText}>
                  HIGH ALERT
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText variant="caption" tone="primary" style={styles.phonetic}>
            Phonetic: /{drug.phonetic}/
          </ThemedText>
        </View>
      </View>

      {/* Class & International Equivalents */}
      <View style={styles.metaSection}>
        <ThemedText variant="caption" muted>
          Drug Class: <ThemedText variant="caption">{drug.drugClass}</ThemedText>
        </ThemedText>

        <View style={styles.intlRow}>
          <ThemedText variant="caption" muted>
            Intl / Commonwealth Equivalents:{' '}
          </ThemedText>
          <View style={styles.intlChips}>
            {drug.intlEquivalents.map((intl) => (
              <View
                key={intl}
                style={[
                  styles.intlChip,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <ThemedText variant="caption" style={{ fontWeight: '600' }}>
                  {intl}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* NCLEX Priority Rule */}
      <View
        style={[
          styles.ruleBox,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        ]}
      >
        <View style={styles.ruleHeader}>
          <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
          <ThemedText variant="label" tone="primary">
            NCLEX Must-Know Nursing Rule:
          </ThemedText>
        </View>
        <ThemedText variant="caption" style={styles.ruleText}>
          {drug.nclexPriorityRule}
        </ThemedText>
      </View>
    </Card>
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
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  monoHeading: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  searchCount: {
    paddingLeft: 2,
    fontVariant: ['tabular-nums'],
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  highAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  highAlertText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  phonetic: {
    fontStyle: 'italic',
  },
  metaSection: {
    gap: 4,
  },
  intlRow: {
    gap: 4,
  },
  intlChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  intlChip: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ruleBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleText: {
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
});
