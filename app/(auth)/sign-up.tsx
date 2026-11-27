import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { ThemedText } from '../../src/components/ui/ThemedText';
import { signInWithGoogle, signUpWithEmail } from '../../src/services/auth';
import { useTheme } from '../../src/theme/ThemeProvider';
import { spacing } from '../../src/theme/typography';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  async function handleSignUp() {
    setErrorMessage(null);
    setConfirmationNotice(null);

    if (!fullName.trim()) {
      setErrorMessage('Enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Use a password with at least 8 characters.');
      return;
    }

    setLoading('email');
    try {
      const result = await signUpWithEmail(email, password, fullName);
      if (!result.session) {
        setConfirmationNotice(
          'Account created. Check your email inbox to confirm your address before signing in.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not create account.'
      );
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogleSignUp() {
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
            <ThemedText variant="caption" muted style={styles.monoHeading}>
              CANDIDATE REGISTRATION
            </ThemedText>
            <ThemedText variant="h1">Start Licensure Pathway</ThemedText>
            <ThemedText variant="body" muted>
              Profile data is encrypted in transit and used solely for CAT calibration.
            </ThemedText>
          </View>

          <Card style={styles.card}>
            <Input
              label="Full name"
              placeholder="Maria Santos, RN"
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              textContentType="name"
            />
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
              placeholder="Minimum 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
            />

            {errorMessage ? (
              <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
                {errorMessage}
              </ThemedText>
            ) : null}

            {confirmationNotice ? (
              <ThemedText variant="caption" tone="success" accessibilityRole="status">
                {confirmationNotice}
              </ThemedText>
            ) : null}

            <Button
              title="Create account"
              onPress={handleSignUp}
              loading={loading === 'email'}
              disabled={loading !== null}
            />

            <Button
              title="Sign up with Google"
              variant="outline"
              onPress={handleGoogleSignUp}
              loading={loading === 'google'}
              disabled={loading !== null}
            />
          </Card>

          <View style={styles.footerRow}>
            <ThemedText variant="body" muted>
              Already have an account?{' '}
            </ThemedText>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable accessibilityRole="link" style={styles.linkTouch}>
                <ThemedText variant="label" tone="primary">
                  Sign in
                </ThemedText>
              </Pressable>
            </Link>
          </View>

          <View style={styles.legalRow}>
            <ThemedText variant="caption" muted>
              By creating an account you agree to our{' '}
            </ThemedText>
            <Link href="/(legal)/terms" asChild>
              <Pressable accessibilityRole="link" style={styles.linkTouch}>
                <ThemedText variant="caption" tone="primary">Terms of Service</ThemedText>
              </Pressable>
            </Link>
            <ThemedText variant="caption" muted>{' '}and{' '}</ThemedText>
            <Link href="/(legal)/privacy" asChild>
              <Pressable accessibilityRole="link" style={styles.linkTouch}>
                <ThemedText variant="caption" tone="primary">Privacy Policy</ThemedText>
              </Pressable>
            </Link>
            <ThemedText variant="caption" muted>.</ThemedText>
          </View>

          <DisclaimerBanner
              compact
              onPressPrivacy={() => router.push('/(legal)/privacy')}
              onPressTerms={() => router.push('/(legal)/terms')}
            />
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
  monoHeading: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  card: {
    gap: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTouch: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});
