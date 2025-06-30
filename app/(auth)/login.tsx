import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/services/supabase/client';
import { TextInput, Button, Text, Card, Divider } from 'react-native-paper';
import { useAuthStore } from '@/stores/auth.store';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert(`Login Error: ${error.message}`);
    } else if (data?.user) {
      setUser(data.user);
      router.replace('/(user)/dashboard');
    }
    
    setLoading(false);
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
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 24 }}>
        <Card style={{ width: '100%', maxWidth: 400, padding: 20 }}>
          <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
            Welcome to VeraAuto
          </Text>
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={{ marginBottom: 12 }}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 16 }}
            disabled={loading}
          />
          
          <Button 
            mode="contained" 
            style={{ marginBottom: 12, backgroundColor: '#3B82F6' }} 
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>
          
          <Divider style={{ marginVertical: 16 }} />
          
          <Button 
            mode="contained" 
            style={{ backgroundColor: '#DB4437', marginBottom: 8 }} 
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            Login with Google
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => router.push('/(auth)/signup')}
            disabled={loading}
          >
            Sign Up
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => router.push('/(auth)/forgot-password')}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            Forgot Password?
          </Button>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}