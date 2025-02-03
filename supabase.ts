import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Supabase Credentials
const SUPABASE_URL = 'https://eafvmrjhdcuhjmlcysuc.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZnZtcmpoZGN1aGptbGN5c3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMjE2MjUsImV4cCI6MjA1Mzc5NzYyNX0.jOFHX8NDkZ6wXiDJa4x6iwLcyh9wqa1SK7SRvZB9D4U';

const isWeb = Platform.OS === 'web';
const storage = isWeb
  ? undefined
  : {
      getItem: async (key: string) => SecureStore.getItemAsync(key),
      setItem: async (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: async (key: string) => SecureStore.deleteItemAsync(key),
    };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});

/* -------------------------
   Profile Helper Functions
------------------------- */

export async function getUserProfile() {
  // First, get the current authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error('Error getting user:', userError);
    return null;
  }
  // Query the "profiles" table for the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, email, avatar_url')
    .eq('id', userData.user.id)
    .single();
  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }
  return profile;
}

export async function updateUserProfile(name: string, avatarUrl: string) {
  // Retrieve the authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { error: userError || 'User not found' };
  }
  // Update the profile in the "profiles" table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ name, avatar_url: avatarUrl })
    .eq('id', userData.user.id);
  if (profileError) return { error: profileError };

  // Update the user's auth metadata (for example, to update the display name)
  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: name },
  });
  return { error: authError };
}

/* -------------------------
   Cars & Repairs Helpers (existing code)
------------------------- */

export async function getCarsForUser() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getCarById(carId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export async function createCar(carData: { make_id: number; model_id: number; engine: string; year: number; vin?: string; color?: string; }) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return { error: { message: 'User not authenticated' } };
  const { data, error } = await supabase
    .from('cars')
    .insert([{ ...carData, user_id: userId }])
    .single();
  return { data, error };
}

export async function updateCar(carId: string, carData: { make_id?: number; model_id?: number; engine?: string; year?: number; vin?: string; color?: string; }) {
  const { data, error } = await supabase
    .from('cars')
    .update(carData)
    .eq('id', carId)
    .single();
  return { data, error };
}

export async function deleteCar(carId: string) {
  const { data, error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId)
    .single();
  return { data, error };
}

export async function getRepairsForCar(carId: string) {
  const { data, error } = await supabase
    .from('repairs')
    .select('*')
    .eq('car_id', carId);
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

/* -------------------------
   Car Makes & Models Helpers
------------------------- */

export async function getCarMakes() {
  const { data, error } = await supabase
    .from('car_makes')
    .select('*')
    .order('name');
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getCarModelsForMake(makeId: number) {
  const { data, error } = await supabase
    .from('car_models')
    .select('*')
    .eq('make_id', makeId)
    .order('name');
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getAllCarModels() {
  const { data, error } = await supabase.from('car_models').select('*').order('name');
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// ... existing supabase.ts code ...

// Workshop Profile Helpers

export async function getWorkshopProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error('Error getting user:', userError);
    return null;
  }
  const { data, error } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', userData.user.id)
    .single();
  if (error) {
    console.error('Error fetching workshop profile:', error);
    return null;
  }
  return data;
}

export async function createWorkshopProfile(workshopData: { logo?: string; name: string; address?: string; phone?: string; webpage?: string; }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { error: userError || 'User not authenticated' };
  }
  const { data, error } = await supabase
    .from('workshops')
    .insert([{ ...workshopData, id: userData.user.id }])
    .single();
  return { data, error };
}

export async function updateWorkshopProfile(workshopData: { logo?: string; name?: string; address?: string; phone?: string; webpage?: string; }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return { error: userError || 'User not authenticated' };
  }
  const { data, error } = await supabase
    .from('workshops')
    .update(workshopData)
    .eq('id', userData.user.id)
    .single();
  return { data, error };
}
