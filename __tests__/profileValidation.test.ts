import { validateOnboardingInput } from '../src/services/profileValidation';

describe('validateOnboardingInput', () => {
  const validInput = {
    country_of_education: 'Philippines',
    current_country: 'United Arab Emirates',
    target_state: 'NY',
    exam_date: '2027-05-20',
    weekly_study_hours: 15,
  };

  it('passes when all required IEN fields and consent are provided', () => {
    const errors = validateOnboardingInput(validInput, true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('passes when optional exam_date is null', () => {
    const errors = validateOnboardingInput({ ...validInput, exam_date: null }, true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('requires education country, current country, target state, and consent', () => {
    const errors = validateOnboardingInput(
      {
        country_of_education: '',
        current_country: '',
        target_state: '',
        exam_date: null,
        weekly_study_hours: 0,
      },
      false
    );

    expect(errors.country_of_education).toBeDefined();
    expect(errors.current_country).toBeDefined();
    expect(errors.target_state).toBeDefined();
    expect(errors.weekly_study_hours).toBeDefined();
    expect(errors.consent).toBeDefined();
  });

  it('rejects malformed exam dates', () => {
    const errors = validateOnboardingInput(
      { ...validInput, exam_date: '05/20/2027' },
      true
    );
    expect(errors.exam_date).toBeDefined();
  });
});
