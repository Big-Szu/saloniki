import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase Credentials
const SUPABASE_URL = 'https://eafvmrjhdcuhjmlcysuc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZnZtcmpoZGN1aGptbGN5c3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjE2MjUsImV4cCI6MjA1Mzc5NzYyNX0.jOFHX8NDkZ6wXiDJa4x6iwLcyh9wqa1SK7SRvZB9D4U';

// Check if running on the web
const isWeb = Platform.OS === 'web';

// For native platforms, wrap SecureStore methods so that they match Supabase's storage interface.
const storage = isWeb
  ? undefined // On web, Supabase uses cookies/localStorage by default.
  : {
      getItem: async (key: string) => {
        return await SecureStore.getItemAsync(key);
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
      },
      removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
      },
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // Enable session detection from URL only for web environments.
    detectSessionInUrl: isWeb,
  },
});

// Function to fetch user profile from Supabase
export async function getUserProfile() {
  // Get the current user session.
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data?.user) {
    console.error('Error getting user:', userError);
    // Optionally, trigger a redirect to a login or welcome screen here.
    return null;
  }

  // Query the 'profiles' table for user data.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, email, avatar_url')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }

  return profile;
}

// Function to update the user's profile data in Supabase.
export async function updateUserProfile(name: string, avatarUrl: string) {
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data?.user) {
    console.error('Error getting user:', userError);
    return { error: userError || 'User not found' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name, avatar_url: avatarUrl })
    .eq('id', data.user.id);

  return { error };
}
