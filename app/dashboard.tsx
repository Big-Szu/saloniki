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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        router.replace('/login');
        return;
      }
      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email || '' });
      } else {
        router.replace('/login');
      }
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
    }
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 24 }}>
      <Card style={{ width: 320, padding: 20 }}>
        <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>Dashboard</Text>
        <Text style={{ textAlign: 'center', fontSize: 16 }}>
          Welcome, {user?.email || 'Guest'}!
        </Text>
        <Button mode="contained" style={{ marginTop: 16, backgroundColor: '#3B82F6' }} onPress={() => router.push('/profile')}>
          View Profile
        </Button>
        <Button mode="contained" style={{ marginTop: 16, backgroundColor: '#EF4444' }} onPress={handleLogout}>
          Logout
        </Button>
      </Card>
    </View>
  );
}
