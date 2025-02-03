import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { supabase } from '../supabase';
import { View, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import Breadcrumbs from '../components/Breadcrumbs';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [didInitialRender, setDidInitialRender] = useState(false);

  useEffect(() => {
    setDidInitialRender(true);
  }, []);

  useEffect(() => {
    if (!didInitialRender) return;

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      // Ignore the expected "Auth session missing!" error in Expo Go.
      if (error && error.message !== 'Auth session missing!') {
        console.error('Error getting user:', error);
      }

      if (!data?.user) {
        router.replace('/login' as any);
      } else {
        if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
          router.replace('/dashboard' as any);
        }
      }
    };

    checkUser();
  }, [didInitialRender, pathname]);

  // Friendly names for route segments.
  const routeNames: Record<string, string> = {
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    login: 'Login',
    signup: 'Sign Up',
    'edit-profile': 'Edit Profile',
  };

  // Split the current pathname into segments and build an array for breadcrumbs.
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbPaths = segments.map((segment, index) => ({
    name: routeNames[segment] || segment.replace(/-/g, ' ').toUpperCase(),
    path: '/' + segments.slice(0, index + 1).join('/'),
  }));

  const handleGoBack = () => {
    if (segments.length > 0) {
      router.back();
    } else {
      router.push('/dashboard' as any);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Navigation Bar with Back Button and Breadcrumbs */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: '#E5E7EB',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          pointerEvents: 'auto',
        }}
      >
        {segments.length > 0 && (
          <TouchableOpacity onPress={handleGoBack} style={{ marginRight: 8 }}>
            <ChevronLeft size={24} color="black" />
          </TouchableOpacity>
        )}
        <Breadcrumbs paths={breadcrumbPaths} />
      </View>

      {/* App Screens */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="login" options={{ title: '' }} />
        <Stack.Screen name="signup" options={{ title: '' }} />
        <Stack.Screen name="dashboard" options={{ title: '' }} />
        <Stack.Screen name="profile" options={{ title: '' }} />
        <Stack.Screen name="edit-profile" options={{ title: '' }} />
      </Stack>
    </View>
  );
}
