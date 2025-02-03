import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, TextInput } from 'react-native-paper';
import Breadcrumbs from '../components/Breadcrumbs';
import { getUserProfile, updateUserProfile } from '../supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Fetch the profile row from the "profiles" table.
  useEffect(() => {
    async function fetchProfile() {
      const profile = await getUserProfile();
      if (!profile) {
        Alert.alert('Error', 'Failed to load profile.');
        router.replace('/login' as any);
        return;
      }
      setName(profile.name);
      setEmail(profile.email);
    }
    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    // Update the user's profile row in the profiles table.
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Edit Profile
      </Text>
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
      <Button
        mode="contained"
        style={{ backgroundColor: '#2563EB' }}
        onPress={handleSave}
      >
        Save Changes
      </Button>
    </View>
  );
}
