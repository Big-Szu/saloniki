import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getWorkshopProfile, updateWorkshopProfile } from '../../supabase';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function WorkshopEditScreen() {
  const router = useRouter();
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [webpage, setWebpage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const profile = await getWorkshopProfile();
      if (profile) {
        setLogo(profile.logo || '');
        setName(profile.name);
        setAddress(profile.address || '');
        setPhone(profile.phone || '');
        setWebpage(profile.webpage || '');
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Workshop name is required.');
      return;
    }
    const { error } = await updateWorkshopProfile({
      logo: logo.trim(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      webpage: webpage.trim()
    });
    if (error) {
      const errorMsg =
        typeof error === 'string'
          ? error
          : (error as { message?: string }).message || 'Unknown error';
      Alert.alert('Error', 'Failed to update workshop profile: ' + errorMsg);
    } else {
      Alert.alert('Success', 'Workshop profile updated.');
      router.push('/workshops/dashboard' as any);
    }
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Breadcrumbs 
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Workshop Edit', path: '/workshops/edit' }
        ]}
      />
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Edit Workshop Profile</Text>
        <TextInput
          label="Logo URL"
          value={logo}
          onChangeText={setLogo}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Workshop Name*"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Webpage URL"
          value={webpage}
          onChangeText={setWebpage}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <Button mode="contained" onPress={handleUpdate} style={{ marginTop: 16, backgroundColor: '#3B82F6' }}>
          Update Profile
        </Button>
      </Card>
    </View>
  );
}
