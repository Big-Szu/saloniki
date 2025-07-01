import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, usePathname, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';

function AuthChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkUser() {
      console.log('AuthChecker - Current pathname:', pathname);
      console.log('AuthChecker - Current segments:', segments);
      
      try {
        const { data, error } = await supabase.auth.getUser();
        
        const noUser = !data?.user || (error && error.message === "Auth session missing!");
        const allowedRoutes = ['/login', '/signup', '/forgot-password', '/workshops/signup'];
        const isAuthRoute = allowedRoutes.some(route => pathname.startsWith(route));

        if (noUser) {
          console.log('AuthChecker - No user found');
          if (!isAuthRoute) {
            console.log('AuthChecker - Redirecting to login');
            setTimeout(() => router.replace('/(auth)/login'), 0);
          }
        } else {
          console.log('AuthChecker - User found:', data.user.id);
          setUser(data.user);
          
          // Check if user is a workshop
          const { data: workshop } = await supabase
            .from('workshops')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (workshop) {
            console.log('AuthChecker - User is a workshop');
            // Check if we're in a workshop route
            const isInWorkshopRoute = segments[0] === '(workshop)' || 
                                      pathname.includes('/workshop/') ||
                                      pathname.includes('/(workshop)/');
            
            // Only redirect if we're in an auth route or the root
            if (isAuthRoute || pathname === '/') {
              console.log('AuthChecker - Redirecting workshop to dashboard');
              setTimeout(() => router.replace('/(workshop)/dashboard'), 0);
            } else if (!isInWorkshopRoute && !pathname.includes('/repairs/')) {
              // Don't redirect if we're already in a workshop route or viewing repairs
              console.log('AuthChecker - Workshop user not in workshop route, but not redirecting from:', pathname);
            }
          } else {
            console.log('AuthChecker - User is a regular user');
            // Regular user logic
            if (isAuthRoute || pathname === '/') {
              console.log('AuthChecker - Redirecting user to dashboard');
              setTimeout(() => router.replace('/(user)/dashboard'), 0);
            }
          }
        }
      } catch (error) {
        console.error('AuthChecker - Error:', error);
      } finally {
        setIsChecking(false);
      }
    }
    
    // Add a small delay to prevent race conditions with navigation
    const timeoutId = setTimeout(() => {
      checkUser();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, segments, router, setUser]);

  // Don't render children while checking auth to prevent flashing
  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

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