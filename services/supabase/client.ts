// services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get environment variables
const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Custom storage for React Native
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    // Check if we're in a browser environment
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    // For SSR or native, use SecureStore
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      // SecureStore might not be available during SSR
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    // Check if we're in a browser environment
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        // SecureStore might not be available during SSR
        console.warn('Unable to set item in secure storage:', error);
      }
    }
  },
  removeItem: async (key: string) => {
    // Check if we're in a browser environment
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        // SecureStore might not be available during SSR
        console.warn('Unable to remove item from secure storage:', error);
      }
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});