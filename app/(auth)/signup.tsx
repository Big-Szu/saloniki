import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password: password.trim(), 
      options: { 
        data: { full_name: name.trim() } 
      } 
    });
    
    if (error) {
      Alert.alert('Sign-up Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for a confirmation link!');
      router.replace('/(auth)/login');
    }
    
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <Card style={{ padding: 16 }}>
          <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
            Create an Account
          </Text>
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
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
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 16 }}
            disabled={loading}
          />
          
          <Button
            mode="contained"
            style={{ marginBottom: 12, backgroundColor: '#3B82F6' }}
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
          >
            Sign Up
          </Button>
          
          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
          >
            Back to Login
          </Button>
          
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text>Want to sign up as a workshop?</Text>
            <Button 
              mode="text" 
              onPress={() => router.push('/workshops/signup')}
              disabled={loading}
            >
              Sign Up as Workshop
            </Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}