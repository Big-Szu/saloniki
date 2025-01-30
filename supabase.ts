import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase Credentials
const SUPABASE_URL = 'https://eafvmrjhdcuhjmlcysuc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZnZtcmpoZGN1aGptbGN5c3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjE2MjUsImV4cCI6MjA1Mzc5NzYyNX0.jOFHX8NDkZ6wXiDJa4x6iwLcyh9wqa1SK7SRvZB9D4U';

// Secure storage for tokens
const isWeb = Platform.OS === 'web';

const storage = isWeb
  ? undefined // Web uses cookies automatically
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
