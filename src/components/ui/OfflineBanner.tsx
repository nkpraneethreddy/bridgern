import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useOfflineStore } from '../../stores/offlineStore';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing } from '../../theme/typography';

export function OfflineBanner() {
  const { colors } = useTheme();
  const { isOffline, pendingSyncCount, isSyncing, syncNow, setOffline } = useOfflineStore();

  if (!isOffline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isOffline ? colors.warningSoft : colors.primarySoft,
          borderColor: isOffline ? colors.warning : colors.primary,
        },
      ]}
    >
      <View style={styles.leftRow}>
        <Ionicons
          name={isOffline ? 'cloud-offline-outline' : 'cloud-upload-outline'}
          size={16}
          color={isOffline ? colors.warning : colors.primary}
        />
        <ThemedText variant="caption" tone={isOffline ? 'warning' : 'primary'} style={styles.text}>
          {isOffline
            ? `Offline mode — ${pendingSyncCount} answers saved locally`
            : `${pendingSyncCount} offline answers pending upload`}
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isOffline ? 'Switch to online' : 'Sync pending answers now'}
        onPress={() => (isOffline ? setOffline(false) : syncNow())}
        style={[styles.actionBtn, { borderColor: isOffline ? colors.warning : colors.primary }]}
      >
        <ThemedText variant="caption" tone={isOffline ? 'warning' : 'primary'} style={styles.btnText}>
          {isOffline ? 'Go Online' : isSyncing ? 'Syncing...' : 'Sync Now'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginVertical: 4,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
