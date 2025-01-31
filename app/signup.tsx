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
      router.replace('/login'); // Redirect back to login
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Card className="w-80 p-5">
        <Text variant="titleLarge" className="text-center mb-4">Create an Account</Text>

        <TextInput 
          label="Email" 
          value={email} 
          onChangeText={setEmail} 
          mode="outlined" 
          className="mb-2"
        />

        <TextInput 
          label="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
          mode="outlined" 
          className="mb-2"
        />

        <Button mode="contained" className="mt-4 bg-blue-500" onPress={handleSignUp}>
          Sign Up
        </Button>

        <Button mode="text" className="mt-2" onPress={() => router.replace('/login')}>
          Back to Login
        </Button>
      </Card>
    </View>
  );
}
