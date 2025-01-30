import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../supabase';

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/login'); // Redirect to login if no user session
      } else {
        router.replace('/dashboard'); // Redirect logged-in users
      }
    };
    checkUser();
  }, []);

  return <Stack />;
}
