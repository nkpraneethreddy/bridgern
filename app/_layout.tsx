import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';
import { supabase, supabaseConfigured } from '../src/lib/supabase';
import { fetchProfile } from '../src/services/profile';
import { useAuthStore } from '../src/stores/authStore';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

function AuthNavigationGate() {
  const router = useRouter();
  const segments = useSegments();
  const { colors, isDark } = useTheme();
  const { session, profile, initialized, setSession, setProfile, setInitialized } =
    useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      if (!supabaseConfigured) {
        if (mounted) {
          setSession(null);
          setProfile(null);
          setInitialized(true);
        }
        return;
      }

      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(initialSession);

        if (initialSession?.user) {
          const userProfile = await fetchProfile(initialSession.user.id);
          if (mounted) setProfile(userProfile);
        }
      } catch (err) {
        if (__DEV__) console.warn('Session bootstrap failed', err);
      } finally {
        if (mounted) setInitialized(true);
      }
    }

    bootstrapSession();

    if (!supabaseConfigured) {
      return () => {
        mounted = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);

      if (nextSession?.user) {
        try {
          const nextProfile = await fetchProfile(nextSession.user.id);
          if (mounted) setProfile(nextProfile);
        } catch (err) {
          if (__DEV__) console.warn('Profile load failed', err);
        }
      } else {
        setProfile(null);
      }
      setInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setInitialized, setProfile, setSession]);

  useEffect(() => {
    if (!initialized) return;

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === '(auth)';
    const inOnboardingGroup = firstSegment === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
      return;
    }

    if (!profile?.onboarding_completed) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/profile-setup');
      }
      return;
    }

    if (inAuthGroup || inOnboardingGroup || !firstSegment) {
      router.replace('/(tabs)');
    }
  }, [initialized, profile?.onboarding_completed, router, segments, session]);

  if (!initialized) {
    return (
      <View style={[styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthNavigationGate />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
