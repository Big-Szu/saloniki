import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../supabase';
import { TextInput, Button, Text, Card, Divider } from 'react-native-paper';

// Make sure WebBrowser session is ready
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email/Password Login
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('Login Error', error.message);
    else router.replace('/dashboard');
  };

  // Google Login
  const handleGoogleLogin = async () => {
    const redirectUrl = AuthSession.makeRedirectUri(); // No need for useProxy
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
  
    if (error) {
      alert('Google Login Failed', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Card className="w-80 p-5">
        <Text variant="titleLarge" className="text-center mb-4">Login</Text>

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

        <Button mode="contained" className="mt-4 bg-blue-500" onPress={handleSignIn}>
          Login
        </Button>

        <Divider className="my-4" />

        <Button mode="contained" className="bg-red-500" onPress={handleGoogleLogin}>
          Login with Google
        </Button>

        <Button mode="text" className="mt-2" onPress={() => router.push('/signup')}>
          Sign Up
        </Button>
      </Card>
    </View>
  );
}
