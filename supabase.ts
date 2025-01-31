import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase Credentials
const SUPABASE_URL = 'https://eafvmrjhdcuhjmlcysuc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZnZtcmpoZGN1aGptbGN5c3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjE2MjUsImV4cCI6MjA1Mzc5NzYyNX0.jOFHX8NDkZ6wXiDJa4x6iwLcyh9wqa1SK7SRvZB9D4U';

// Secure storage setup
const isWeb = Platform.OS === 'web';
const storage = isWeb
  ? undefined // Web uses cookies
  : {
      getItem: SecureStore.getItemAsync,
      setItem: SecureStore.setItemAsync,
      removeItem: SecureStore.deleteItemAsync,
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Function to fetch user profile from Supabase
export async function getUserProfile() {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('name, email, avatar_url')
    .eq('id', user.user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(name: string, avatarUrl: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "User not found" };

  const { error } = await supabase
    .from('profiles')
    .update({ name, avatar_url: avatarUrl })
    .eq('id', user.user.id);

  return { error };
}
