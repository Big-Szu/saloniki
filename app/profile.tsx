import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button } from 'react-native-paper';
import Breadcrumbs from '../components/Breadcrumbs';
import { getUserProfile } from '../supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const data = await getUserProfile();
      if (!data) {
        Alert.alert('Error', 'Failed to fetch profile.');
        router.replace('/login' as any);
      } else {
        setProfile({ name: data.name, email: data.email });
      }
    }
    fetchProfile();
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
      {profile ? (
        <View>
          <Text style={{ fontSize: 16 }}>Name: {profile.name}</Text>
          <Text style={{ fontSize: 16 }}>Email: {profile.email}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
      <Button
        mode="contained"
        style={{ marginTop: 16, backgroundColor: '#2563EB' }}
        onPress={() => router.push('/edit-profile' as any)}
      >
        Edit Profile
      </Button>
    </View>
  );
}
