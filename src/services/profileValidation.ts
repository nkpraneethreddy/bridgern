export interface ProfileUpdateInput {
  full_name?: string;
  country_of_education: string;
  current_country: string;
  target_state: string;
  exam_date: string | null;
  weekly_study_hours: number;
  onboarding_completed?: boolean;
  consent_accepted_at?: string;
  disclaimer_acknowledged_at?: string;
}

export interface OnboardingValidationErrors {
  country_of_education?: string;
  current_country?: string;
  target_state?: string;
  exam_date?: string;
  weekly_study_hours?: string;
  consent?: string;
}

export function validateOnboardingInput(
  input: Partial<ProfileUpdateInput>,
  consentAccepted: boolean
): OnboardingValidationErrors {
  const errors: OnboardingValidationErrors = {};

  if (!input.country_of_education?.trim()) {
    errors.country_of_education = 'Select your country of nursing education.';
  }
  if (!input.current_country?.trim()) {
    errors.current_country = 'Select the country where you currently live or work.';
  }
  if (!input.target_state?.trim()) {
    errors.target_state = 'Select your target US State Board of Nursing.';
  }

  if (input.exam_date) {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(input.exam_date)) {
      errors.exam_date = 'Use YYYY-MM-DD format (for example, 2027-03-15).';
    } else {
      const parsed = new Date(`${input.exam_date}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) {
        errors.exam_date = 'Enter a valid calendar date.';
      }
    }
  }

  const hours = input.weekly_study_hours ?? 0;
  if (!Number.isInteger(hours) || hours < 1 || hours > 80) {
    errors.weekly_study_hours = 'Weekly study hours must be between 1 and 80.';
  }

  if (!consentAccepted) {
    errors.consent =
      'Please accept the privacy notice and educational disclaimer to continue.';
  }

  return errors;
}
