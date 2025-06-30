import { useEffect, useState } from 'react';
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
}