import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';

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
      router.replace('/login'); // Redirect back to login
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Create an Account</Text>

      <Text>Email:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 5, width: '80%' }}
        value={email}
        onChangeText={setEmail}
      />

      <Text>Password:</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 5, width: '80%' }}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Back to Login" onPress={() => router.replace('/login')} color="gray" />
    </View>
  );
}
