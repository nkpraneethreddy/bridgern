import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SelectOption } from '../../config/ienOptions';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';
import { ThemedText } from './ThemedText';

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string | null | undefined;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string | null;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  error,
}: SelectFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrapper}>
      <ThemedText variant="label">{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${selected ? selected.label : placeholder}`}
        accessibilityHint="Opens selection list"
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        <ThemedText
          variant="body"
          muted={!selected}
          style={styles.triggerText}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </ThemedText>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error ? (
        <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: colors.background }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <ThemedText variant="h3">{label}</ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close selection list"
              onPress={() => setOpen(false)}
              style={styles.closeBtn}
            >
              <ThemedText variant="label" tone="primary">
                Done
              </ThemedText>
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={item.label}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected
                        ? colors.primarySoft
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={styles.optionTextWrap}>
                    <ThemedText variant="bodyMedium">{item.label}</ThemedText>
                    {item.subtitle ? (
                      <ThemedText variant="caption" muted>
                        {item.subtitle}
                      </ThemedText>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  triggerText: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionRow: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  optionTextWrap: {
    flex: 1,
    gap: 2,
  },
});
