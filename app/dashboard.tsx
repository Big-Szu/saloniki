import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login'); // Redirect back to login
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome, {user?.email}!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
