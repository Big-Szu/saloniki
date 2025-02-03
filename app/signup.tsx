import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabase';
import { TextInput, Button, Text, Card } from 'react-native-paper';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState(''); // User-specified name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    // Attempt to sign up while setting the auth metadata (full_name) via options.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name, // Set the display name in auth metadata.
        },
      },
    });

    if (error) {
      Alert.alert('Sign-up Error', error.message);
      return;
    }

    // Determine the profile name: use the entered name if provided,
    // or fallback to the full_name from the auth metadata (if available).
    const profileName =
      name.trim() !== '' ? name.trim() : data.user?.user_metadata?.full_name || '';

    // Function to insert a profile row.
    const insertProfile = async (user: any) => {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: user.id, name: profileName, email })
        .single();
      if (profileError) {
        console.error('Error creating profile:', profileError);
        Alert.alert('Error', 'Failed to create user profile.');
      }
    };

    if (data.user) {
      // If the user is immediately available, insert the profile row.
      await insertProfile(data.user);
    } else {
      // Otherwise (e.g. when email confirmation is enabled), subscribe to auth state changes.
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            await insertProfile(session.user);
            authListener.subscription.unsubscribe();
          }
        }
      );
    }

    Alert.alert('Success', 'Check your email for a confirmation link!');
    router.replace('/login' as any);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 24,
      }}
    >
      <Card style={{ width: 320, padding: 20 }}>
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
      </Card>
    </View>
  );
}
