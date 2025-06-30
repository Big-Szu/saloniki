import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');  // New field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    // Pass name as auth metadata (and optionally create a profile row later)
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { full_name: name } } 
    });
    if (error) {
      Alert.alert('Sign-up Error', error.message);
      return;
    }
    Alert.alert('Success', 'Check your email for a confirmation link!');
    router.replace('/login' as any);
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>
          Create an Account
        </Text>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <Button
          mode="contained"
          style={{ marginTop: 16, backgroundColor: '#3B82F6' }}
          onPress={handleSignUp}
        >
          Sign Up
        </Button>
        <Button
          mode="text"
          style={{ marginTop: 8 }}
          onPress={() => router.replace('/login' as any)}
        >
          Back to Login
        </Button>
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Text>Want to sign up as a workshop?</Text>
          <Button mode="text" onPress={() => router.push('/workshops/signup' as any)}>
            Sign Up as Workshop
          </Button>
        </View>
      </Card>
    </View>
  );
}
