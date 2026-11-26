import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { env } from '../config/env';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

WebBrowser.maybeCompleteAuthSession();

function ensureConfigured(): void {
  if (!supabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

export async function signInWithEmail(email: string, password: string) {
  ensureConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  ensureConfigured();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  ensureConfigured();

  const redirectTo = makeRedirectUri({
    scheme: env.appScheme,
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) {
    throw new Error('Could not initialize Google sign-in URL.');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in was cancelled.');
  }

  const callbackUrl = new URL(result.url);
  const code = callbackUrl.searchParams.get('code');
  if (code) {
    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    return sessionData;
  }

  // Fallback for implicit hash fragments if returned by provider
  const hash = callbackUrl.hash.replace(/^#/, '');
  const hashParams = new URLSearchParams(hash);
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    const { data: sessionData, error: setSessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    if (setSessionError) throw setSessionError;
    return sessionData;
  }

  throw new Error('Google sign-in did not return an authorization code.');
}

export async function signOut(): Promise<void> {
  if (supabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  useAuthStore.getState().reset();
}

export async function deleteAccount(): Promise<void> {
  ensureConfigured();
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;
  await supabase.auth.signOut();
  useAuthStore.getState().reset();
}
