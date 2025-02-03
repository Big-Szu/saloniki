import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, TextInput } from 'react-native-paper';
import { supabase, updateUserProfile } from '../supabase';
import Breadcrumbs from '../components/Breadcrumbs';

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Failed to load user details.');
        router.replace('/login');
        return;
      }
      if (data?.user) {
        const fullName = data.user.user_metadata?.full_name || 'N/A';
        const userEmail = data.user.email || 'N/A';
        setUser({ name: fullName, email: userEmail });
        setName(fullName);
        setEmail(userEmail);
      } else {
        router.replace('/login');
      }
    }
    fetchUser();
  }, [router]);

  const handleSave = async () => {
    const { error } = await updateUserProfile(name, '');
    if (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } else {
      Alert.alert('Success', 'Profile Updated');
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Breadcrumbs
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Profile', path: '/profile' },
          { name: 'Edit Profile', path: '/edit-profile' },
        ]}
      />
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Edit Profile</Text>
      <Text style={{ marginBottom: 8 }}>Name:</Text>
      <TextInput
        mode="outlined"
        style={{ marginBottom: 16 }}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />
      <Text style={{ marginBottom: 8 }}>Email:</Text>
      <TextInput
        mode="outlined"
        style={{ marginBottom: 16, backgroundColor: '#E5E7EB' }}
        value={email}
        editable={false}
      />
      <Button mode="contained" style={{ backgroundColor: '#2563EB' }} onPress={handleSave}>
        Save Changes
      </Button>
    </View>
  );
}
