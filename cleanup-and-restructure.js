#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Backup directory name
const BACKUP_DIR = `backup_${new Date().toISOString().replace(/:/g, '-').split('.')[0]}`;

// Files to delete (unused/outdated)
const filesToDelete = [
  'App.tsx', // Not needed with Expo Router
  'components/Collapsible.tsx', // Example component, not used
  'components/HelloWave.tsx', // Example component
  'components/ParallaxScrollView.tsx', // Example component
  'components/HapticTab.tsx', // Example component
  'components/ExternalLink.tsx', // Example component
  'assets/images/partial-react-logo.png',
  'assets/images/react-logo.png',
  'assets/images/react-logo@2x.png',
  'assets/images/react-logo@3x.png',
  'scripts/reset-project.js', // Will be replaced
];

// File moves (from -> to)
const fileMoves = {
  // Auth screens
  'app/login.tsx': 'app/(auth)/login.tsx',
  'app/signup.tsx': 'app/(auth)/signup.tsx',
  
  // User screens
  'app/dashboard.tsx': 'app/(user)/dashboard/index.tsx',
  'app/profile.tsx': 'app/(user)/profile/index.tsx',
  'app/edit-profile.tsx': 'app/(user)/profile/edit.tsx',
  
  // Cars - keeping in the same place but organizing better
  'app/cars/index.tsx': 'app/(user)/cars/index.tsx',
  'app/cars/new.tsx': 'app/(user)/cars/new.tsx',
  'app/cars/[id].tsx': 'app/(user)/cars/[id]/index.tsx',
  'app/cars/edit/[id].tsx': 'app/(user)/cars/[id]/edit.tsx',
  'app/cars/[id]/repairs/new.tsx': 'app/(user)/cars/[id]/repairs/new.tsx',
  'app/cars/[id]/repairs/[repairId].tsx': 'app/(user)/cars/[id]/repairs/[repairId].tsx',
  
  // Workshop screens
  'app/workshops/dashboard.tsx': 'app/(workshop)/dashboard/index.tsx',
  'app/workshops/edit.tsx': 'app/(workshop)/profile/edit.tsx',
  'app/workshops/repairs/index.tsx': 'app/(workshop)/repairs/index.tsx',
  
  // Workshop public routes
  'app/workshops/signup.tsx': 'app/workshops/signup.tsx',
  
  // Components reorganization
  'components/Breadcrumbs.tsx': 'components/common/Breadcrumbs.tsx',
  'components/ThemedText.tsx': 'components/themed/ThemedText.tsx',
  'components/ThemedView.tsx': 'components/themed/ThemedView.tsx',
  
  // Supabase to services
  'supabase.ts': 'services/supabase/client.ts',
  
  // Keep colors in theme
  'constants/Colors.ts': 'theme/colors.ts',
};

// New directory structure to create
const newStructure = {
  'app': {
    '(auth)': {
      '_layout.tsx': `import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
    </Stack>
  );
}`,
      'forgot-password.tsx': `import React from 'react';
import { View } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Reset Password</Text>
        <TextInput
          label="Email"
          mode="outlined"
          style={{ marginBottom: 16 }}
        />
        <Button mode="contained" onPress={() => {}}>
          Send Reset Link
        </Button>
        <Button mode="text" onPress={() => router.back()}>
          Back to Login
        </Button>
      </Card>
    </View>
  );
}`
    },
    '(user)': {
      '_layout.tsx': `import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function UserLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: 'My Cars',
          tabBarIcon: ({ color }) => <MaterialIcons name="directions-car" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}`,
      'cars': {
        '_layout.tsx': `import React from 'react';
import { Stack } from 'expo-router';

export default function CarsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Add New Car' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}`,
        '[id]': {
          '_layout.tsx': `import React from 'react';
import { Stack } from 'expo-router';

export default function CarDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Car Details' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Car' }} />
      <Stack.Screen name="repairs" options={{ headerShown: false }} />
    </Stack>
  );
}`,
          'repairs': {
            '_layout.tsx': `import React from 'react';
import { Stack } from 'expo-router';

export default function RepairsLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ title: 'Add Repair' }} />
      <Stack.Screen name="[repairId]" options={{ title: 'Repair Details' }} />
    </Stack>
  );
}`
          }
        },
        '_components': {
          'CarCard.tsx': `import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Car } from '@/types';

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

export function CarCard({ car, onPress }: CarCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={{ marginBottom: 12, padding: 12 }}>
        <Text variant="titleMedium">{car.year} {car.make} {car.model}</Text>
        <Text variant="bodyMedium">{car.engine}</Text>
      </Card>
    </TouchableOpacity>
  );
}`,
          'CarForm.tsx': '',
          'RepairCard.tsx': ''
        }
      },
      'profile': {
        '_layout.tsx': `import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
    </Stack>
  );
}`
      },
      'settings': {
        'index.tsx': `import React from 'react';
import { View, ScrollView } from 'react-native';
import { List, Switch, Divider } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Push Notifications"
          right={() => <Switch value={true} />}
        />
        <Divider />
        <List.Item
          title="Dark Mode"
          right={() => <Switch value={false} />}
        />
      </List.Section>
    </ScrollView>
  );
}`
      }
    },
    '(workshop)': {
      '_layout.tsx': `import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function WorkshopLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="repairs"
        options={{
          title: 'Repairs',
          tabBarIcon: ({ color }) => <MaterialIcons name="build" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="store" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <MaterialIcons name="analytics" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}`,
      'repairs': {
        'pending.tsx': `import React from 'react';
import { View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';

export default function PendingRepairsScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Pending Confirmations</Text>
    </View>
  );
}`,
        '[id].tsx': `import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

export default function WorkshopRepairDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Repair Details: {id}</Text>
    </View>
  );
}`
      },
      'profile': {
        'index.tsx': `import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function WorkshopProfileScreen() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Workshop Profile</Text>
      <Button mode="contained" onPress={() => router.push('/(workshop)/profile/edit')}>
        Edit Profile
      </Button>
    </View>
  );
}`
      },
      'analytics': {
        'index.tsx': `import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function AnalyticsScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Analytics Dashboard</Text>
    </View>
  );
}`
      }
    },
    'workshops': {
      '[id].tsx': `import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

export default function PublicWorkshopScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Workshop Profile: {id}</Text>
    </View>
  );
}`,
      'search.tsx': `import React from 'react';
import { View } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';

export default function WorkshopSearchScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Searchbar
        placeholder="Search workshops..."
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
    </View>
  );
}`
    }
  },
  'components': {
    'ui': {
      'Button.tsx': `import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export function Button({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  style, 
  disabled,
  ...props 
}: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.base, 
        styles[variant], 
        styles[size],
        disabled && styles.disabled,
        style
      ]} 
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, styles[\`\${variant}Text\`]]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    opacity: 0.5,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  dangerText: {
    color: 'white',
  },
});`,
      'Card.tsx': '',
      'Input.tsx': '',
      'Select.tsx': '',
      'Modal.tsx': '',
      'LoadingSpinner.tsx': `import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'large', 
  color = '#3B82F6', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }
  
  return <ActivityIndicator size={size} color={color} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});`,
      'ErrorMessage.tsx': '',
      'index.ts': `export * from './Button';
export * from './Card';
export * from './Input';
export * from './Select';
export * from './Modal';
export * from './LoadingSpinner';
export * from './ErrorMessage';`
    },
    'layout': {
      'Header.tsx': '',
      'TabBar.tsx': '',
      'Drawer.tsx': '',
      'SafeAreaView.tsx': ''
    },
    'common': {
      'ErrorBoundary.tsx': `import React from 'react';
import { View, Text, Button } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }
      
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong!</Text>
          <Text style={{ marginBottom: 20 }}>{this.state.error?.message}</Text>
          <Button title="Try Again" onPress={this.resetError} />
        </View>
      );
    }

    return this.props.children;
  }
}`,
      'EmptyState.tsx': '',
      'OfflineNotice.tsx': ''
    }
  },
  'hooks': {
    'auth': {
      'useAuth.ts': `import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { User } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, logout };
}`,
      'useUser.ts': ''
    },
    'data': {
      'useCars.ts': '',
      'useRepairs.ts': '',
      'useWorkshops.ts': '',
      'useCarMakes.ts': ''
    },
    'ui': {
      'useTheme.ts': '',
      'useToast.ts': '',
      'useModal.ts': ''
    },
    'utils': {
      'useDebounce.ts': `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
      'useOffline.ts': '',
      'usePagination.ts': ''
    }
  },
  'services': {
    'api': {
      'index.ts': `export * from './auth';
export * from './cars';
export * from './repairs';
export * from './workshops';
export * from './uploads';`,
      'auth.ts': '',
      'cars.ts': '',
      'repairs.ts': '',
      'workshops.ts': '',
      'uploads.ts': ''
    },
    'supabase': {
      'auth.ts': '',
      'storage.ts': ''
    },
    'external': {
      'analytics.ts': '',
      'sentry.ts': '',
      'notifications.ts': ''
    }
  },
  'stores': {
    'auth.store.ts': `import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));`,
    'user.store.ts': '',
    'cars.store.ts': '',
    'repairs.store.ts': '',
    'workshops.store.ts': '',
    'ui.store.ts': ''
  },
  'types': {
    'api': {
      'auth.types.ts': '',
      'car.types.ts': `export interface Car {
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
}`,
      'repair.types.ts': `export interface Repair {
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
}`,
      'workshop.types.ts': `export interface Workshop {
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
}`
    },
    'database.types.ts': '',
    'navigation.types.ts': '',
    'index.ts': `export * from './api/auth.types';
export * from './api/car.types';
export * from './api/repair.types';
export * from './api/workshop.types';
export * from './database.types';
export * from './navigation.types';`
  },
  'utils': {
    'validation': {
      'schemas.ts': '',
      'car.schema.ts': '',
      'repair.schema.ts': '',
      'workshop.schema.ts': ''
    },
    'formatters': {
      'date.ts': `export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString();
}`,
      'currency.ts': `export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}`,
      'text.ts': ''
    },
    'helpers': {
      'storage.ts': '',
      'permissions.ts': '',
      'image.ts': ''
    },
    'constants.ts': `export const APP_NAME = 'VeraAuto';
export const SUPPORT_EMAIL = 'support@veraauto.com';
export const ITEMS_PER_PAGE = 10;`
  },
  'theme': {
    'index.ts': `export * from './colors';
export * from './typography';
export * from './spacing';
export * from './components';

export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
};`,
    'typography.ts': `export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 24, fontWeight: 'bold' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 14, fontWeight: 'normal' as const },
};`,
    'spacing.ts': `export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};`,
    'components.ts': ''
  },
  'locales': {
    'en': {
      'common.json': '{}',
      'cars.json': '{}',
      'workshops.json': '{}'
    },
    'pl': {
      'common.json': '{}',
      'cars.json': '{}',
      'workshops.json': '{}'
    }
  },
  'config': {
    'app.config.ts': '',
    'environment.ts': `const ENV = {
  dev: {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  prod: {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default __DEV__ ? ENV.dev : ENV.prod;`,
    'navigation.config.ts': ''
  },
  'scripts': {
    'generate-types.ts': `// Script to generate TypeScript types from Supabase
// Run: npx ts-node scripts/generate-types.ts`,
  },
  '__tests__': {
    'unit': {
      'utils': { '.gitkeep': '' },
      'hooks': { '.gitkeep': '' },
      'components': { '.gitkeep': '' }
    },
    'integration': {
      'api': { '.gitkeep': '' }
    },
    'e2e': {
      'flows': { '.gitkeep': '' }
    }
  }
};

// Function to create a backup
function createBackup() {
  console.log(`📦 Creating backup in ${BACKUP_DIR}...`);
  
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
  }
  
  // Backup important directories
  const dirsToBackup = ['app', 'components', 'assets', 'hooks', 'constants'];
  
  dirsToBackup.forEach(dir => {
    if (fs.existsSync(dir)) {
      const destPath = path.join(BACKUP_DIR, dir);
      copyFolderRecursiveSync(dir, BACKUP_DIR);
      console.log(`  ✅ Backed up ${dir}`);
    }
  });
  
  // Backup root files
  const filesToBackup = ['supabase.ts', 'package.json', 'tsconfig.json', 'app.json', 'README.md'];
  
  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(BACKUP_DIR, file));
      console.log(`  ✅ Backed up ${file}`);
    }
  });
}

// Helper function to copy folder recursively
function copyFolderRecursiveSync(source, target) {
  const targetFolder = path.join(target, path.basename(source));
  
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }
  
  if (fs.lstatSync(source).isDirectory()) {
    fs.readdirSync(source).forEach(file => {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        fs.copyFileSync(curSource, path.join(targetFolder, file));
      }
    });
  }
}

// Function to delete files
function deleteUnneededFiles() {
  console.log('\n🗑️  Deleting unneeded files...');
  
  filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`  ❌ Deleted ${file}`);
    }
  });
}

// Function to move files
function moveFiles() {
  console.log('\n📁 Moving files to new locations...');
  
  Object.entries(fileMoves).forEach(([from, to]) => {
    if (fs.existsSync(from)) {
      const toDir = path.dirname(to);
      
      // Create target directory if it doesn't exist
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      
      // Read content and write to new location
      const content = fs.readFileSync(from, 'utf8');
      fs.writeFileSync(to, content);
      
      // Delete original
      fs.unlinkSync(from);
      
      console.log(`  ➡️  Moved ${from} → ${to}`);
    }
  });
}

// Function to create new structure
function createStructure(basePath, structure) {
  Object.entries(structure).forEach(([name, content]) => {
    const fullPath = path.join(basePath, name);
    
    if (typeof content === 'object' && !Array.isArray(content)) {
      // It's a directory
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  📁 Created directory: ${fullPath}`);
      }
      createStructure(fullPath, content);
    } else {
      // It's a file
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content || '');
        console.log(`  📄 Created file: ${fullPath}`);
      } else {
        console.log(`  ⏭️  Skipped existing file: ${fullPath}`);
      }
    }
  });
}

// Function to update imports in moved files
function updateImports() {
  console.log('\n🔧 Updating imports in moved files...');
  
  const filesToUpdate = [
    'app/(auth)/login.tsx',
    'app/(auth)/signup.tsx',
    'app/(user)/dashboard/index.tsx',
    'app/(user)/profile/index.tsx',
    'app/(user)/profile/edit.tsx',
    'app/(user)/cars/index.tsx',
    'app/(user)/cars/new.tsx',
    'app/(user)/cars/[id]/index.tsx',
    'app/(user)/cars/[id]/edit.tsx',
    'app/(user)/cars/[id]/repairs/new.tsx',
    'app/(user)/cars/[id]/repairs/[repairId].tsx',
    'app/(workshop)/dashboard/index.tsx',
    'app/(workshop)/profile/edit.tsx',
    'app/(workshop)/repairs/index.tsx',
  ];
  
  const importReplacements = {
    '../supabase': '@/services/supabase/client',
    '../../supabase': '@/services/supabase/client',
    '../../../supabase': '@/services/supabase/client',
    '../../../../supabase': '@/services/supabase/client',
    '../components/Breadcrumbs': '@/components/common/Breadcrumbs',
    '../../components/Breadcrumbs': '@/components/common/Breadcrumbs',
    '../../../components/Breadcrumbs': '@/components/common/Breadcrumbs',
    '../../../../components/Breadcrumbs': '@/components/common/Breadcrumbs',
    '@/components/ThemedText': '@/components/themed/ThemedText',
    '@/components/ThemedView': '@/components/themed/ThemedView',
  };
  
  filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;
      
      Object.entries(importReplacements).forEach(([from, to]) => {
        if (content.includes(from)) {
          content = content.replace(new RegExp(from, 'g'), to);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(file, content);
        console.log(`  ✏️  Updated imports in ${file}`);
      }
    }
  });
}

// Clean empty directories
function cleanEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  
  let files = fs.readdirSync(dir);
  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        cleanEmptyDirs(fullPath);
      }
    });
    files = fs.readdirSync(dir);
  }
  
  if (files.length === 0 && dir !== '.' && !dir.includes('node_modules')) {
    fs.rmdirSync(dir);
    console.log(`  🧹 Removed empty directory: ${dir}`);
  }
}

// Update package.json dependencies
function updatePackageJson() {
  console.log('\n📦 Updating package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Add new dependencies if not present
  const newDependencies = {
    'zustand': '^4.5.0',
    'zod': '^3.22.0',
    '@supabase/supabase-js': '^2.48.1',
  };
  
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...newDependencies
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('  ✅ Updated package.json with new dependencies');
}

// Create .env.example
function createEnvExample() {
  const envContent = `# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Environment
EXPO_PUBLIC_ENV=development

# API Keys (add as needed)
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
# EXPO_PUBLIC_SENTRY_DSN=
`;

  fs.writeFileSync('.env.example', envContent);
  console.log('  ✅ Created .env.example');
}

// Main execution
async function main() {
  console.log('🚀 VeraAuto Project Restructure Script\n');
  
  try {
    // Step 1: Create backup
    createBackup();
    
    // Step 2: Delete unneeded files
    deleteUnneededFiles();
    
    // Step 3: Move existing files
    moveFiles();
    
    // Step 4: Create new structure
    console.log('\n📁 Creating new directory structure...');
    createStructure(process.cwd(), newStructure);
    
    // Step 5: Update imports
    updateImports();
    
    // Step 6: Clean empty directories
    console.log('\n🧹 Cleaning up empty directories...');
    cleanEmptyDirs('app');
    cleanEmptyDirs('components');
    
    // Step 7: Update package.json
    updatePackageJson();
    
    // Step 8: Create .env.example
    createEnvExample();
    
    console.log('\n✅ Restructure complete!');
    console.log(`\n📋 Next steps:
    1. Review the backup in ${BACKUP_DIR}
    2. Run: npm install
    3. Update your .env file based on .env.example
    4. Test the app: npm start
    5. If everything works, you can delete the ${BACKUP_DIR} folder
    `);
    
  } catch (error) {
    console.error('\n❌ Error during restructure:', error);
    console.log(`\n⚠️  Your backup is available in ${BACKUP_DIR}`);
    console.log('You can restore from backup if needed.');
  }
}

// Run the script
main();