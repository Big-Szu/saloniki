import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';

export default function WorkshopSignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');
  const [webpage, setWebpage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWorkshopSignUp = async () => {
    // Validation
    if (!email.trim() || !password.trim() || !workshopName.trim() || 
        !streetAddress.trim() || !city.trim() || !postalCode.trim() || 
        !country.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
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
    
    try {
      // Step 1: Create auth user with autoconfirm disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password: password.trim(),
        options: {
          data: {
            user_type: 'workshop',
            workshop_name: workshopName.trim()
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Step 2: If the user is auto-confirmed (in development), sign them in to get proper auth
      if (authData.session) {
        // User was auto-confirmed, we can create the workshop profile now
        const { error: workshopError } = await supabase
          .from('workshops')
          .insert({
            id: authData.user.id,
            name: workshopName.trim(),
            street_address: streetAddress.trim(),
            city: city.trim(),
            postal_code: postalCode.trim(),
            country: country.trim(),
            phone: phone.trim(),
            logo: logo.trim() || null,
            webpage: webpage.trim() || null
          });
          
        if (workshopError) {
          console.error('Workshop creation error:', workshopError);
          throw new Error(`Failed to create workshop profile: ${workshopError.message}`);
        }
        
        Alert.alert(
          'Success', 
          'Workshop account created successfully!',
          [{ text: 'OK', onPress: () => router.replace('/(workshop)/dashboard') }]
        );
      } else {
        // User needs to confirm email first
        // Store workshop data in localStorage or state management for later
        const workshopData = {
          name: workshopName.trim(),
          street_address: streetAddress.trim(),
          city: city.trim(),
          postal_code: postalCode.trim(),
          country: country.trim(),
          phone: phone.trim(),
          logo: logo.trim() || null,
          webpage: webpage.trim() || null
        };
        
        // You might want to store this data temporarily
        // For now, we'll just inform the user
        Alert.alert(
          'Check Your Email', 
          'Please check your email to confirm your account. After confirmation, you\'ll need to complete your workshop profile setup.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert('Sign-up Error', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <Card style={{ padding: 16 }}>
          <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 24 }}>
            Create Workshop Account
          </Text>
          
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Account Information
          </Text>
          
          <TextInput
            label="Email*"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={{ marginBottom: 12 }}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          
          <TextInput
            label="Password*"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Confirm Password*"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={{ marginBottom: 16 }}
            disabled={loading}
          />
          
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Workshop Information
          </Text>
          
          <TextInput
            label="Workshop Name*"
            value={workshopName}
            onChangeText={setWorkshopName}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Street Address*"
            value={streetAddress}
            onChangeText={setStreetAddress}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="City*"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Postal Code*"
            value={postalCode}
            onChangeText={setPostalCode}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Country*"
            value={country}
            onChangeText={setCountry}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Phone Number*"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            style={{ marginBottom: 12 }}
            keyboardType="phone-pad"
            disabled={loading}
          />
          
          <TextInput
            label="Logo URL (optional)"
            value={logo}
            onChangeText={setLogo}
            mode="outlined"
            style={{ marginBottom: 12 }}
            disabled={loading}
          />
          
          <TextInput
            label="Website (optional)"
            value={webpage}
            onChangeText={setWebpage}
            mode="outlined"
            style={{ marginBottom: 16 }}
            disabled={loading}
          />
          
          <Button
            mode="contained"
            style={{ marginBottom: 12, backgroundColor: '#3B82F6' }}
            onPress={handleWorkshopSignUp}
            loading={loading}
            disabled={loading}
          >
            Create Workshop Account
          </Button>
          
          <Button
            mode="text"
            onPress={() => router.replace('/(auth)/login')}
            disabled={loading}
          >
            Back to Login
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}