import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { supabaseConfigured } from '../../src/lib/supabase';
import { signInWithEmail, signInWithGoogle } from '../../src/services/auth';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function SignInScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEmailSignIn() {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Enter both your email address and password.');
      return;
    }

    setLoading('email');
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to complete Google sign-in.'
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText variant="label" tone="primary">
              BRIDGERN
            </ThemedText>
            <ThemedText variant="display">Calm, structured NCLEX-RN prep</ThemedText>
            <ThemedText variant="body" muted>
              Built for internationally educated nurses transitioning to US licensure.
            </ThemedText>
          </View>

          {!supabaseConfigured ? (
            <Card
              style={{
                borderColor: colors.warning,
                backgroundColor: colors.warningSoft,
              }}
            >
              <ThemedText variant="label" tone="warning">
                Supabase Setup Needed
              </ThemedText>
              <ThemedText variant="caption" style={styles.bannerText}>
                Copy .env.example to .env and add EXPO_PUBLIC_SUPABASE_URL and
                EXPO_PUBLIC_SUPABASE_ANON_KEY to enable live sign-in.
              </ThemedText>
            </Card>
          ) : null}

          <Card style={styles.card}>
            <Input
              label="Email address"
              placeholder="nurse@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
            />

            {errorMessage ? (
              <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
                {errorMessage}
              </ThemedText>
            ) : null}

            <Button
              title="Sign in with email"
              onPress={handleEmailSignIn}
              loading={loading === 'email'}
              disabled={loading !== null}
            />

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <ThemedText variant="caption" muted>
                or
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Continue with Google"
              variant="outline"
              onPress={handleGoogleSignIn}
              loading={loading === 'google'}
              disabled={loading !== null}
            />
          </Card>

          <View style={styles.footerRow}>
            <ThemedText variant="body" muted>
              New to BridgeRN?{' '}
            </ThemedText>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable accessibilityRole="link" style={styles.linkTouch}>
                <ThemedText variant="label" tone="primary">
                  Create an account
                </ThemedText>
              </Pressable>
            </Link>
          </View>

          <DisclaimerBanner compact />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    gap: spacing.xs,
  },
  bannerText: {
    marginTop: 4,
  },
  card: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTouch: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
