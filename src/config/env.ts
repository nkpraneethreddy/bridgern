export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appScheme: string;
  googleWebClientId: string;
  posthogApiKey: string;
  posthogHost: string;
}

export const env: EnvConfig = {
  supabaseUrl: (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim(),
  supabaseAnonKey: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
  appScheme: (process.env.EXPO_PUBLIC_APP_SCHEME ?? 'bridgern').trim(),
  googleWebClientId: (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '').trim(),
  posthogApiKey: (process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '').trim(),
  posthogHost: (process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com').trim(),
};

export function isSupabaseConfigured(config: EnvConfig = env): boolean {
  return (
    Boolean(config.supabaseUrl) &&
    Boolean(config.supabaseAnonKey) &&
    !config.supabaseUrl.includes('your-project-ref') &&
    !config.supabaseAnonKey.includes('your-supabase-anon-key')
  );
}
