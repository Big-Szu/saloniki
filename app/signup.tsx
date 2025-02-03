import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';
import { TextInput, Button, Text, Card } from 'react-native-paper';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Sign-up Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for a confirmation link!');
      router.replace('/login');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 24 }}>
      <Card style={{ width: 320, padding: 20 }}>
        <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>Create an Account</Text>
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
        <Button mode="contained" style={{ marginTop: 16, backgroundColor: '#3B82F6' }} onPress={handleSignUp}>
          Sign Up
        </Button>
        <Button mode="text" style={{ marginTop: 8 }} onPress={() => router.replace('/login')}>
          Back to Login
        </Button>
      </Card>
    </View>
  );
}
