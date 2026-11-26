import { isSupabaseConfigured } from '../src/config/env';

describe('env configuration', () => {
  it('returns false when placeholders or empty values are used', () => {
    expect(
      isSupabaseConfigured({
        supabaseUrl: '',
        supabaseAnonKey: '',
        appScheme: 'bridgern',
        googleWebClientId: '',
        posthogApiKey: '',
        posthogHost: 'https://us.i.posthog.com',
      })
    ).toBe(false);

    expect(
      isSupabaseConfigured({
        supabaseUrl: 'https://your-project-ref.supabase.co',
        supabaseAnonKey: 'your-supabase-anon-key',
        appScheme: 'bridgern',
        googleWebClientId: '',
        posthogApiKey: '',
        posthogHost: 'https://us.i.posthog.com',
      })
    ).toBe(false);
  });

  it('returns true when valid Supabase URL and anon key are set', () => {
    expect(
      isSupabaseConfigured({
        supabaseUrl: 'https://abcdefg.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample',
        appScheme: 'bridgern',
        googleWebClientId: '',
        posthogApiKey: '',
        posthogHost: 'https://us.i.posthog.com',
      })
    ).toBe(true);
  });
});
