import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../supabase';

// Make sure WebBrowser session is ready
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email/Password Login
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login Error', error.message);
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
      Alert.alert('Google Login Failed', error.message);
    }
  };
  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} value={email} onChangeText={setEmail} />

      <Text>Password:</Text>
      <TextInput style={{ borderWidth: 1, marginBottom: 10, padding: 5 }} value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Login" onPress={handleSignIn} />
      <Button title="Login with Google" onPress={handleGoogleLogin} color="red" />
      <Button title="Sign Up" onPress={() => router.push('/signup')} color="blue" />
    </View>
  );
}
