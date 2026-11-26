export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

export const EDUCATION_COUNTRIES: SelectOption[] = [
  { value: 'Philippines', label: 'Philippines', subtitle: 'BSN / PRC-licensed' },
  { value: 'India', label: 'India', subtitle: 'BSc Nursing / GNM / INC-registered' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Kenya', label: 'Kenya' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Other', label: 'Other country' },
];

export const CURRENT_COUNTRIES: SelectOption[] = [
  { value: 'United Arab Emirates', label: 'United Arab Emirates (UAE)', subtitle: 'DHA / DOH / MOHAP' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', subtitle: 'SCFHS' },
  { value: 'Qatar', label: 'Qatar', subtitle: 'DHP' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Oman', label: 'Oman' },
  { value: 'Bahrain', label: 'Bahrain', subtitle: 'NHRA' },
  { value: 'Philippines', label: 'Philippines' },
  { value: 'India', label: 'India' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Other', label: 'Other country' },
];

export const US_TARGET_STATES: SelectOption[] = [
  { value: 'NY', label: 'New York (NYSED)', subtitle: 'Popular for direct IEN licensure' },
  { value: 'TX', label: 'Texas (Texas BON)', subtitle: 'Compact state' },
  { value: 'CA', label: 'California (CA BRN)', subtitle: 'Strict concurrency review' },
  { value: 'FL', label: 'Florida (FL BON)', subtitle: 'Compact state' },
  { value: 'IL', label: 'Illinois (IDFPR)' },
  { value: 'NJ', label: 'New Jersey (NJ BON)' },
  { value: 'WA', label: 'Washington (WA BON)' },
  { value: 'MN', label: 'Minnesota (MN BON)' },
  { value: 'PA', label: 'Pennsylvania (PA BON)' },
  { value: 'NM', label: 'New Mexico (NM BON)' },
  { value: 'OTHER', label: 'Other US State / Territory' },
];

export const WEEKLY_STUDY_HOUR_OPTIONS: SelectOption[] = [
  { value: '5', label: '5 hours / week', subtitle: 'Light pace (~45 min/day)' },
  { value: '10', label: '10 hours / week', subtitle: 'Steady pace (~1.5 hr/day)' },
  { value: '15', label: '15 hours / week', subtitle: 'Focused pace (~2 hr/day)' },
  { value: '20', label: '20 hours / week', subtitle: 'Intensive (~3 hr/day)' },
  { value: '30', label: '30+ hours / week', subtitle: 'Full-time prep' },
];
