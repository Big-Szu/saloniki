import React, { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { supabase, getUserProfile, getWorkshopProfile } from '../supabase';
import { View } from 'react-native';

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
      if (error) console.error('Error getting user:', error);
      if (data?.user) {
        // Check if the user has a workshop profile
        const workshop = await getWorkshopProfile();
        if (workshop) {
          router.replace('/workshops/dashboard' as any);
        } else {
          router.replace('/dashboard' as any);
        }
      } else {
        router.replace('/login' as any);
      }
    };
    checkUser();
  }, [didInitialRender, pathname]);

  return <View style={{ flex: 1 }} />;
}
