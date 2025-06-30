import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { supabase, getWorkshopProfile } from '../supabase';

function AuthChecker() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkUser() {
      // Get the authenticated user
      const { data, error } = await supabase.auth.getUser();
      
      // Treat the "Auth session missing!" error as no user.
      const noUser = !data?.user || (error && error.message === "Auth session missing!");

      // Allowed routes for unauthenticated users
      const allowedRoutes = ['/login', '/signup', '/workshops/signup'];

      if (noUser) {
        // If there is no user and we're not on an allowed route, redirect to /login
        if (!allowedRoutes.includes(pathname)) {
          setTimeout(() => router.replace('/login' as any), 0);
        }
      } else {
        // A user is logged in; check if they have a workshop profile.
        const workshop = await getWorkshopProfile();
        if (workshop) {
          // If they have a workshop profile and are not already on a workshop route, redirect them.
          if (pathname !== '/workshops/dashboard' && !pathname.startsWith('/workshops')) {
            setTimeout(() => router.replace('/workshops/dashboard' as any), 0);
          }
        } else {
          // Regular user logged in: if they’re on a route meant for non-logged in users, redirect to dashboard.
          if (allowedRoutes.includes(pathname) || pathname === '/') {
            setTimeout(() => router.replace('/dashboard' as any), 0);
          }
        }
      }
    }
    checkUser();
  }, [pathname, router]);

  return null;
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}>
      <AuthChecker />
      <Slot />
    </View>
  );
}
