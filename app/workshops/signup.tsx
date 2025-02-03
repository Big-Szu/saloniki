import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createWorkshopProfile } from '../../supabase';

export default function WorkshopSignupScreen() {
  const router = useRouter();
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [webpage, setWebpage] = useState('');

  const handleWorkshopSignup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Workshop name is required.');
      return;
    }
    const { data, error } = await createWorkshopProfile({
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
      Alert.alert('Error', 'Failed to create workshop profile: ' + errorMsg);
      return;
    }
    Alert.alert('Success', 'Workshop profile created.');
    router.replace('/workshops/dashboard' as any);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Workshop Signup</Text>
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
        <Button
          mode="contained"
          onPress={handleWorkshopSignup}
          style={{ marginTop: 16, backgroundColor: '#3B82F6' }}
        >
          Sign Up as Workshop
        </Button>
      </Card>
    </View>
  );
}
