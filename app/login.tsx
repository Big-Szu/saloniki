import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../supabase';
import { TextInput, Button, Text, Card, Divider } from 'react-native-paper';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(`Login Error: ${error.message}`);
    } else if (data?.user) {
      router.replace('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const redirectUrl = AuthSession.makeRedirectUri();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      alert(`Google Login Failed: ${error.message}`);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 24 }}>
      <Card style={{ width: 320, padding: 20 }}>
        <Text variant="titleLarge" style={{ textAlign: 'center', marginBottom: 16 }}>Login</Text>
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
        <Button mode="contained" style={{ marginTop: 16, backgroundColor: '#3B82F6' }} onPress={handleSignIn}>
          Login
        </Button>
        <Divider style={{ marginVertical: 16 }} />
        <Button mode="contained" style={{ backgroundColor: '#EF4444' }} onPress={handleGoogleLogin}>
          Login with Google
        </Button>
        <Button mode="text" style={{ marginTop: 8 }} onPress={() => router.push('/signup')}>
          Sign Up
        </Button>
      </Card>
    </View>
  );
}
