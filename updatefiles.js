#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration for file updates
const fileUpdates = {
  // Update root layout to include providers and proper setup
  'app/_layout.tsx': `import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';

function AuthChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useAuthStore();

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();
      
      const noUser = !data?.user || (error && error.message === "Auth session missing!");
      const allowedRoutes = ['/(auth)/login', '/(auth)/signup', '/(auth)/forgot-password', '/workshops/signup'];

      if (noUser) {
        if (!allowedRoutes.some(route => pathname.startsWith(route))) {
          setTimeout(() => router.replace('/(auth)/login'), 0);
        }
      } else {
        setUser(data.user);
        
        // Check if user is a workshop
        const { data: workshop } = await supabase
          .from('workshops')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (workshop) {
          if (!pathname.startsWith('/(workshop)')) {
            setTimeout(() => router.replace('/(workshop)/dashboard'), 0);
          }
        } else {
          if (allowedRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
            setTimeout(() => router.replace('/(user)/dashboard'), 0);
          }
        }
      }
    }
    
    checkUser();
  }, [pathname, router, setUser]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ErrorBoundary>
          <View style={{ flex: 1 }}>
            <AuthChecker />
            <Slot />
          </View>
        </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}`,

  // Update login screen with proper types and imports
  'app/(auth)/login.tsx': `import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/services/supabase/client';
import { TextInput, Button, Text, Card, Divider } from 'react-native-paper';
import { useAuthStore } from '@/stores/auth.store';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(\`Login Error: \${error.message}\`);
    } else if (data?.user) {
      setUser(data.user);
      router.replace('/(user)/dashboard');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const redirectUrl = AuthSession.makeRedirectUri();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      alert(\`Google Login Failed: \${error.message}\`);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 24 }}>
        <Card style={{ width: '100%', maxWidth: 400, padding: 20 }}>
          <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
            Welcome to VeraAuto
          </Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={{ marginBottom: 12 }}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 16 }}
            disabled={loading}
          />
          
          <Button 
            mode="contained" 
            style={{ marginBottom: 12, backgroundColor: '#3B82F6' }} 
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>
          
          <Divider style={{ marginVertical: 16 }} />
          
          <Button 
            mode="contained" 
            style={{ backgroundColor: '#DB4437', marginBottom: 8 }} 
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            Login with Google
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => router.push('/(auth)/signup')}
            disabled={loading}
          >
            Sign Up
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => router.push('/(auth)/forgot-password')}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            Forgot Password?
          </Button>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  // Update signup screen
  'app/(auth)/signup.tsx': `import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password: password.trim(), 
      options: { 
        data: { full_name: name.trim() } 
      } 
    });
    
    if (error) {
      Alert.alert('Sign-up Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for a confirmation link!');
      router.replace('/(auth)/login');
    }
    
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <Card style={{ padding: 16 }}>
          <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
            Create an Account
          </Text>
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={{ marginBottom: 12 }}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 16 }}
            disabled={loading}
          />
          
          <Button
            mode="contained"
            style={{ marginBottom: 12, backgroundColor: '#3B82F6' }}
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
          >
            Sign Up
          </Button>
          
          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
          >
            Back to Login
          </Button>
          
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text>Want to sign up as a workshop?</Text>
            <Button 
              mode="text" 
              onPress={() => router.push('/workshops/signup')}
              disabled={loading}
            >
              Sign Up as Workshop
            </Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}`,

  // Update car list screen with proper types
  'app/(user)/cars/index.tsx': `import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { Car, CarMake, CarModel } from '@/types';
import { CarCard } from './_components/CarCard';

export default function CarsListScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's cars
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const [carsResponse, makesResponse, modelsResponse] = await Promise.all([
        supabase.from('cars').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false }),
        supabase.from('car_makes').select('*').order('name'),
        supabase.from('car_models').select('*').order('name')
      ]);
      
      if (carsResponse.data) setCars(carsResponse.data);
      if (makesResponse.data) setMakes(makesResponse.data);
      if (modelsResponse.data) setModels(modelsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getMakeName = (makeId: number) => makes.find(m => m.id === makeId)?.name || 'Unknown';
  const getModelName = (modelId: number) => models.find(m => m.id === modelId)?.name || 'Unknown';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <CarCard
            car={{
              ...item,
              make: getMakeName(item.make_id),
              model: getModelName(item.model_id)
            }}
            onPress={() => router.push(\`/(user)/cars/\${item.id}\`)}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>No cars added yet</Text>
            <Text variant="bodyMedium" style={{ color: '#6B7280' }}>Add your first car to start tracking maintenance</Text>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        style={{ 
          position: 'absolute', 
          right: 16, 
          bottom: 16,
          backgroundColor: '#3B82F6'
        }}
        onPress={() => router.push('/(user)/cars/new')}
      />
    </View>
  );
}`,

  // Update the types index file
  'types/index.ts': `// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Car Related Types
export interface Car {
  id: string;
  user_id: string;
  make_id: number;
  model_id: number;
  engine: string;
  year: number;
  vin?: string;
  color?: string;
  created_at: string;
  updated_at: string;
  // Virtual fields for display
  make?: string;
  model?: string;
}

export interface CarMake {
  id: number;
  name: string;
  logo?: string;
}

export interface CarModel {
  id: number;
  make_id: number;
  name: string;
}

// Repair Types
export interface Repair {
  id: string;
  car_id: string;
  workshop_id?: string;
  repair_date: string;
  description: string;
  cost: number;
  currency: string;
  mileage: number;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields
  workshop?: Workshop;
}

// Workshop Types
export interface Workshop {
  id: string;
  logo?: string;
  name: string;
  street_address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  webpage?: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface CarFormData {
  make_id: number;
  model_id: number;
  engine: string;
  year: number;
  vin?: string;
  color?: string;
}

export interface RepairFormData {
  description: string;
  repair_date: string;
  cost: number;
  currency: string;
  mileage: number;
  workshop_id?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}`,

  // Update supabase client with proper types
  'services/supabase/client.ts': `import { createClient } from '@supabase/supabase-js';
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
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
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
});`,

  // Update theme colors with better organization
  'theme/colors.ts': `export const colors = {
  // Brand Colors
  primary: '#3B82F6', // Blue
  secondary: '#10B981', // Green
  accent: '#F59E0B', // Amber
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Neutral Colors
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic Colors
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
    disabled: '#9CA3AF',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F3F4F6',
    tertiary: '#E5E7EB',
    inverse: '#1F2937',
  },
  
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Dark Mode Colors (if needed later)
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
  },
  
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: '#3B82F6',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#3B82F6',
  },
};

// Helper function to get colors with opacity
export const withOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return \`rgba(\${r}, \${g}, \${b}, \${opacity})\`;
};`,

  // Update Breadcrumbs component with better styling
  'components/common/Breadcrumbs.tsx': `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface BreadcrumbPath {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  paths: BreadcrumbPath[];
}

export function Breadcrumbs({ paths }: BreadcrumbsProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {paths.map((item, index) => (
        <View key={item.path} style={styles.item}>
          <TouchableOpacity 
            onPress={() => router.push(item.path as any)}
            disabled={index === paths.length - 1}
          >
            <Text style={[
              styles.text,
              index === paths.length - 1 && styles.activeText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
          
          {index < paths.length - 1 && (
            <MaterialIcons 
              name="chevron-right" 
              size={20} 
              color={colors.text.secondary} 
              style={styles.separator}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: colors.primary,
    fontSize: 14,
  },
  activeText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 4,
  },
});`,

  // Add CarCard component
  'app/(user)/cars/_components/CarCard.tsx': `import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Car } from '@/types';
import { colors } from '@/theme/colors';

interface CarCardProps {
  car: Car & { make?: string; model?: string };
  onPress: () => void;
}

export function CarCard({ car, onPress }: CarCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title}>
                {car.make} {car.model}
              </Text>
              <Text variant="bodyLarge" style={styles.year}>
                {car.year}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary} />
          </View>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <MaterialIcons name="settings" size={16} color={colors.text.secondary} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {car.engine}
              </Text>
            </View>
            
            {car.vin && (
              <View style={styles.detailItem}>
                <MaterialIcons name="fingerprint" size={16} color={colors.text.secondary} />
                <Text variant="bodySmall" style={styles.detailText}>
                  {car.vin}
                </Text>
              </View>
            )}
            
            {car.color && (
              <View style={styles.detailItem}>
                <MaterialIcons name="palette" size={16} color={colors.text.secondary} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {car.color}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.background.primary,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  year: {
    color: colors.text.secondary,
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: colors.text.secondary,
  },
});`,

  // Update workshop dashboard
  'app/(workshop)/dashboard/index.tsx': `import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { Workshop, Repair } from '@/types';
import { colors } from '@/theme/colors';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function WorkshopDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Workshop | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRepairs: 0,
    pendingConfirmations: 0,
    thisMonthRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Fetch workshop profile
      const { data: workshopData } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (workshopData) {
        setProfile(workshopData);

        // Fetch repairs
        const { data: repairsData } = await supabase
          .from('repairs')
          .select('*')
          .eq('workshop_id', workshopData.id)
          .order('repair_date', { ascending: false })
          .limit(10);

        if (repairsData) {
          setRepairs(repairsData);
          
          // Calculate stats
          const pending = repairsData.filter(r => !r.confirmed).length;
          const thisMonth = new Date();
          thisMonth.setDate(1);
          const monthRevenue = repairsData
            .filter(r => new Date(r.repair_date) >= thisMonth && r.confirmed)
            .reduce((sum, r) => sum + r.cost, 0);
          
          setStats({
            totalRepairs: repairsData.length,
            pendingConfirmations: pending,
            thisMonthRevenue: monthRevenue,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome, {profile?.name || 'Workshop'}!
        </Text>
        <Button mode="text" onPress={handleLogout} textColor={colors.danger}>
          Logout
        </Button>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">{stats.totalRepairs}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Repairs</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, stats.pendingConfirmations > 0 && styles.warningCard]}>
          <Card.Content>
            <Text variant="titleMedium">{stats.pendingConfirmations}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Pending</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">{formatCurrency(stats.thisMonthRevenue)}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>This Month</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Repairs */}
      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Repairs</Text>
      
      <FlatList
        data={repairs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(\`/(workshop)/repairs/\${item.id}\`)}>
            <Card style={styles.repairCard}>
              <Card.Content>
                <View style={styles.repairHeader}>
                  <Text variant="titleMedium">{formatDate(item.repair_date)}</Text>
                  <Text variant="titleMedium">{formatCurrency(item.cost, item.currency)}</Text>
                </View>
                <Text numberOfLines={2} style={styles.description}>
                  {item.description}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.status,
                    item.confirmed ? styles.confirmedStatus : styles.pendingStatus
                  ]}>
                    {item.confirmed ? 'Confirmed' : 'Pending Confirmation'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No repairs yet</Text>
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(workshop)/repairs/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  warningCard: {
    backgroundColor: colors.warning + '20',
  },
  statLabel: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    fontWeight: '600',
  },
  repairCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  description: {
    color: colors.text.secondary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confirmedStatus: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  pendingStatus: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
    padding: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});`,

  // Add formatters
  'utils/formatters/index.ts': `export * from './date';
export * from './currency';
export * from './text';`,
  
  'utils/formatters/date.ts': `export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return \`\${Math.floor(diffInSeconds / 60)} minutes ago\`;
  if (diffInSeconds < 86400) return \`\${Math.floor(diffInSeconds / 3600)} hours ago\`;
  if (diffInSeconds < 604800) return \`\${Math.floor(diffInSeconds / 86400)} days ago\`;
  
  return formatDate(date);
}`,

  'utils/formatters/currency.ts': `const currencySymbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  PLN: 'zł',
};

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const symbol = currencySymbols[currency] || currency;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency;
}`,
};

// Function to update files
function updateFiles() {
  console.log('🔄 Updating file contents...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  Object.entries(fileUpdates).forEach(([filePath, content]) => {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the file
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
      errors.push({ file: filePath, error: error.message });
      errorCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully updated: ${successCount} files`);
  console.log(`   ❌ Errors: ${errorCount} files`);
  
  if (errors.length > 0) {
    console.log('\n❌ Error details:');
    errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }
  
  console.log(`\n📝 Next steps:
  1. Run: npm install
  2. Run: npm audit fix
  3. Update your .env file with Supabase credentials
  4. Test the app: npm start
  `);
}

// Add a safety check
if (process.argv.includes('--force') || process.argv.includes('-f')) {
  updateFiles();
} else {
  console.log(`⚠️  This script will update ${Object.keys(fileUpdates).length} files.`);
  console.log('   Run with --force or -f flag to proceed.');
  console.log('   Example: node update-file-contents.js --force\n');
  
  console.log('Files that will be updated:');
  Object.keys(fileUpdates).forEach(file => {
    console.log(`   - ${file}`);
  });
}