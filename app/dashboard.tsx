import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';
import { Card, Button, Text, ActivityIndicator } from 'react-native-paper';

interface User {
  id: string;
  email: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Fix TypeScript error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || '' }); // Ensure email is defined
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login'); // Redirect back to login
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Card className="w-80 p-5">
        <Text variant="titleLarge" className="text-center mb-4">Dashboard</Text>

        <Text className="text-lg text-center">
          Welcome, {user?.email || 'Guest'}!
        </Text>

        <Button mode="contained" className="mt-4 bg-blue-500" onPress={() => router.push('/profile')}>
          View Profile
        </Button>

        <Button mode="contained" className="mt-4 bg-red-500" onPress={handleLogout}>
          Logout
        </Button>
      </Card>
    </View>
  );
}
