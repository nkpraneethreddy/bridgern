import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { deleteAccount, signOut } from '../../src/services/auth';
import { useAuthStore } from '../../src/stores/authStore';
import { ThemePreference, useThemeStore } from '../../src/stores/themeStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { preference, setPreference } = useThemeStore();
  const [busy, setBusy] = useState<'signout' | 'delete' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSignOut() {
    setErrorMsg(null);
    setBusy('signout');
    try {
      await signOut();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sign out.');
    } finally {
      setBusy(null);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete Account Permanently',
      'This will permanently erase your BridgeRN profile, study plan, and practice history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setBusy('delete');
            setErrorMsg(null);
            try {
              await deleteAccount();
            } catch (err) {
              setErrorMsg(
                err instanceof Error ? err.message : 'Could not delete account.'
              );
            } finally {
              setBusy(null);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.section}>
        <ThemedText variant="h3">{profile?.full_name ?? 'Nurse Learner'}</ThemedText>
        <ThemedText variant="caption" muted>
          {user?.email ?? profile?.email ?? ''}
        </ThemedText>

        <View style={styles.metaList}>
          <ThemedText variant="body">
            Educated in: {profile?.country_of_education ?? '—'}
          </ThemedText>
          <ThemedText variant="body">
            Currently in: {profile?.current_country ?? '—'}
          </ThemedText>
          <ThemedText variant="body">
            Target State Board: {profile?.target_state ?? '—'}
          </ThemedText>
          <ThemedText variant="body">
            Weekly Study Goal: {profile?.weekly_study_hours ?? '—'} hours
          </ThemedText>
        </View>

        <Button
          title="Edit Study Profile"
          variant="outline"
          onPress={() => router.push('/(onboarding)/profile-setup')}
        />
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="h3">Legal</ThemedText>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open Privacy Policy"
          onPress={() => router.push('/(legal)/privacy')}
          style={styles.legalRow}
        >
          <ThemedText variant="body" tone="primary">Privacy Policy</ThemedText>
          <ThemedText variant="caption" muted>›</ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open Terms of Service"
          onPress={() => router.push('/(legal)/terms')}
          style={styles.legalRow}
        >
          <ThemedText variant="body" tone="primary">Terms of Service</ThemedText>
          <ThemedText variant="caption" muted>›</ThemedText>
        </Pressable>
      </Card>

      <Card style={styles.section}>
        <ThemedText variant="h3">Appearance</ThemedText>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((option) => {
            const active = preference === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={`${option.label} theme`}
                onPress={() => setPreference(option.value)}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: active
                      ? colors.primarySoft
                      : colors.surfaceElevated,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <ThemedText
                  variant="label"
                  tone={active ? 'primary' : 'default'}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <DisclaimerBanner
        onPressPrivacy={() => router.push('/(legal)/privacy')}
        onPressTerms={() => router.push('/(legal)/terms')}
      />

      {errorMsg ? (
        <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
          {errorMsg}
        </ThemedText>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Sign out"
          variant="outline"
          onPress={handleSignOut}
          loading={busy === 'signout'}
          disabled={busy !== null}
        />
        <Button
          title="Delete account & data"
          variant="danger"
          onPress={confirmDeleteAccount}
          loading={busy === 'delete'}
          disabled={busy !== null}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  metaList: {
    gap: 4,
    marginVertical: spacing.xs,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeChip: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    paddingVertical: 4,
  },
});
