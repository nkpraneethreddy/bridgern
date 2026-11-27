import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DisclaimerBanner } from '../../src/components/DisclaimerBanner';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { SelectField } from '../../src/components/ui/SelectField';
import { ThemedText } from '../../src/components/ui/ThemedText';
import {
  CURRENT_COUNTRIES,
  EDUCATION_COUNTRIES,
  US_TARGET_STATES,
  WEEKLY_STUDY_HOUR_OPTIONS,
} from '../../src/config/ienOptions';
import {
  OnboardingValidationErrors,
  upsertProfile,
  validateOnboardingInput,
} from '../../src/services/profile';
import { useAuthStore } from '../../src/stores/authStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { radius, spacing } from '../../src/theme/typography';

export default function ProfileSetupScreen() {
  const { colors } = useTheme();
  const { user, profile, setProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [countryOfEducation, setCountryOfEducation] = useState(
    profile?.country_of_education ?? ''
  );
  const [currentCountry, setCurrentCountry] = useState(
    profile?.current_country ?? ''
  );
  const [targetState, setTargetState] = useState(profile?.target_state ?? '');
  const [examDate, setExamDate] = useState(profile?.exam_date ?? '');
  const [weeklyHours, setWeeklyHours] = useState(
    profile?.weekly_study_hours ? String(profile.weekly_study_hours) : '10'
  );
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState<OnboardingValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSubmitError(null);

    const parsedHours = Number.parseInt(weeklyHours, 10);
    const payload = {
      full_name: fullName.trim() || undefined,
      country_of_education: countryOfEducation,
      current_country: currentCountry,
      target_state: targetState,
      exam_date: examDate.trim() ? examDate.trim() : null,
      weekly_study_hours: parsedHours,
      onboarding_completed: true,
      consent_accepted_at: new Date().toISOString(),
      disclaimer_acknowledged_at: new Date().toISOString(),
    };

    const validation = validateOnboardingInput(payload, consentAccepted);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSaving(true);
    try {
      const updated = await upsertProfile(user.id, payload);
      setProfile(updated);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not save your study profile.'
      );
    } finally {
      setSaving(false);
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
            <ThemedText variant="h1">Personalize your NCLEX plan</ThemedText>
            <ThemedText variant="body" muted>
              We use these details to tailor your state licensure checklist and daily study pace.
            </ThemedText>
          </View>

          <Card style={styles.card}>
            <Input
              label="Full name (optional)"
              placeholder="e.g., Priya Nair, RN"
              value={fullName}
              onChangeText={setFullName}
            />

            <SelectField
              label="Country of nursing education"
              placeholder="Select country where you graduated"
              value={countryOfEducation}
              options={EDUCATION_COUNTRIES}
              onChange={setCountryOfEducation}
              error={errors.country_of_education}
            />

            <SelectField
              label="Current country"
              placeholder="Where you currently live or practice"
              value={currentCountry}
              options={CURRENT_COUNTRIES}
              onChange={setCurrentCountry}
              error={errors.current_country}
            />

            <SelectField
              label="Target US State Board of Nursing"
              placeholder="Select target state"
              value={targetState}
              options={US_TARGET_STATES}
              onChange={setTargetState}
              error={errors.target_state}
            />

            <Input
              label="Target exam date (optional)"
              placeholder="YYYY-MM-DD (e.g., 2027-04-15)"
              hint="Leave blank if you do not have your ATT yet."
              value={examDate}
              onChangeText={setExamDate}
              error={errors.exam_date}
              autoCapitalize="none"
            />

            <SelectField
              label="Weekly study hours"
              placeholder="Select realistic weekly hours"
              value={weeklyHours}
              options={WEEKLY_STUDY_HOUR_OPTIONS}
              onChange={setWeeklyHours}
              error={errors.weekly_study_hours}
            />
          </Card>

          <DisclaimerBanner />

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consentAccepted }}
            accessibilityLabel="Accept privacy notice and educational disclaimer"
            onPress={() => setConsentAccepted((prev) => !prev)}
            style={[
              styles.consentRow,
              {
                backgroundColor: colors.surface,
                borderColor: errors.consent ? colors.danger : colors.border,
              },
            ]}
          >
            <Ionicons
              name={consentAccepted ? 'checkbox' : 'square-outline'}
              size={24}
              color={consentAccepted ? colors.primary : colors.textMuted}
            />
            <ThemedText variant="caption" style={styles.consentText}>
              I understand BridgeRN is for exam preparation only (not clinical advice)
              and consent to storing my study profile data with encrypted transit and
              self-service deletion at any time.
            </ThemedText>
          </Pressable>

          {errors.consent ? (
            <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
              {errors.consent}
            </ThemedText>
          ) : null}

          {submitError ? (
            <ThemedText variant="caption" tone="danger" accessibilityRole="alert">
              {submitError}
            </ThemedText>
          ) : null}

          <Button
            title="Save profile & continue"
            onPress={handleSave}
            loading={saving}
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
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  consentRow: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  consentText: {
    flex: 1,
  },
});
