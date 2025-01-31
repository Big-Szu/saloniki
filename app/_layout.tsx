import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { supabase } from '../supabase';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname(); // Get current route
  const [didInitialRender, setDidInitialRender] = useState(false);

  useEffect(() => {
    setDidInitialRender(true);
  }, []);

  useEffect(() => {
    if (!didInitialRender) return;

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error('Error getting user:', error);

      if (data?.user) {
        router.replace('/dashboard'); // Redirect logged-in users
      } else {
        router.replace('/login'); // Redirect guests
      }
    };

    checkUser();
  }, [didInitialRender]);

  // **Breadcrumb Logic**
  const routeNames: Record<string, string> = {
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    login: 'Login',
    signup: 'Sign Up',
  };

  const segments = pathname.split('/').filter(Boolean); // Remove empty segments
  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const label = routeNames[segment] || segment.replace(/-/g, ' ').toUpperCase();

    return (
      <View key={index} className="flex-row items-center">
        <TouchableOpacity onPress={() => router.push(path as any)}>
          <Text variant="titleMedium" className="text-blue-500">{label}</Text>
        </TouchableOpacity>

        {/* Add separator except for the last segment */}
        {index < segments.length - 1 && (
          <Text className="mx-2 text-gray-500">{'>'}</Text>
        )}
      </View>
    );
  });

  return (
    <View className="flex-1">
      {/* Breadcrumb Navigation Bar */}
      <View className="flex-row items-center p-4 bg-gray-200" style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.2)', pointerEvents: 'auto' }}>
        {/* Back Button */}
        {segments.length > 0 && (
          <TouchableOpacity onPress={() => router.back()} className="mr-2">
            <ChevronLeft size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Breadcrumbs Navigation */}
        {breadcrumbs.length > 0 ? (
          <View className="flex-row items-center">{breadcrumbs}</View>
        ) : (
          <Text variant="titleMedium">HOME</Text>
        )}
      </View>

      {/* Page Content */}
      <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      </Stack>
    </View>
  );
}
