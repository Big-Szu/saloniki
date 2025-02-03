import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';
import { Text, Button } from 'react-native-paper';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Failed to fetch user.');
        router.replace('/login');
        return;
      }
      if (data?.user) {
        setUser({
          name: data.user.user_metadata?.full_name || 'N/A',
          email: data.user.email || 'N/A',
        });
      } else {
        router.replace('/login');
      }
    }
    fetchUser();
  }, [router]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Breadcrumbs
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Profile', path: '/profile' },
        ]}
      />
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Profile</Text>
      {user ? (
        <View>
          <Text style={{ fontSize: 16 }}>Name: {user.name}</Text>
          <Text style={{ fontSize: 16 }}>Email: {user.email}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
      <Button mode="contained" style={{ marginTop: 16, backgroundColor: '#2563EB' }} onPress={() => router.push('/edit-profile')}>
        Edit Profile
      </Button>
    </View>
  );
}
