import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { env, isSupabaseConfigured } from '../config/env';

const CHUNK_SIZE = 1800;

/**
 * SecureStore limits single values to ~2048 bytes on some Android devices.
 * Chunk large Supabase session payloads transparently across numbered keys.
 */
const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }

    const chunkCountStr = await SecureStore.getItemAsync(`${key}__chunks`);
    if (!chunkCountStr) {
      return SecureStore.getItemAsync(key);
    }

    const chunkCount = Number.parseInt(chunkCountStr, 10);
    if (!Number.isFinite(chunkCount) || chunkCount <= 0) {
      return null;
    }

    const parts: string[] = [];
    for (let i = 0; i < chunkCount; i += 1) {
      const part = await SecureStore.getItemAsync(`${key}__${i}`);
      if (part === null) {
        return null;
      }
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }

    await secureStoreAdapter.removeItem(key);

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }

    await Promise.all(
      chunks.map((chunk, idx) => SecureStore.setItemAsync(`${key}__${idx}`, chunk))
    );
    await SecureStore.setItemAsync(`${key}__chunks`, String(chunks.length));
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }

    const chunkCountStr = await SecureStore.getItemAsync(`${key}__chunks`);
    if (chunkCountStr) {
      const chunkCount = Number.parseInt(chunkCountStr, 10);
      if (Number.isFinite(chunkCount) && chunkCount > 0) {
        await Promise.all(
          Array.from({ length: chunkCount }, (_, i) =>
            SecureStore.deleteItemAsync(`${key}__${i}`)
          )
        );
      }
      await SecureStore.deleteItemAsync(`${key}__chunks`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabaseConfigured = isSupabaseConfigured();

const isTestEnv = process.env.NODE_ENV === 'test';

export const supabase: SupabaseClient = createClient(
  supabaseConfigured ? env.supabaseUrl : fallbackUrl,
  supabaseConfigured ? env.supabaseAnonKey : fallbackKey,
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: !isTestEnv,
      persistSession: !isTestEnv,
      detectSessionInUrl: false,
    },
  }
);
