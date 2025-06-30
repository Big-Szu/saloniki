import React, { useEffect } from 'react';
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
      const allowedRoutes = ['/login', '/signup', '/forgot-password', '/workshops/signup'];

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
}