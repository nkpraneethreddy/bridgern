import { supabase, supabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';
import {
  OnboardingValidationErrors,
  ProfileUpdateInput,
  validateOnboardingInput,
} from './profileValidation';

export type { OnboardingValidationErrors, ProfileUpdateInput };
export { validateOnboardingInput };

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabaseConfigured) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(
  userId: string,
  payload: ProfileUpdateInput
): Promise<Profile> {
  if (!supabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...payload,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as Profile;
}
