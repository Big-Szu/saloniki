import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase, createWorkshopProfile } from '../../supabase';

export default function WorkshopSignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Poland');
  const [phone, setPhone] = useState('');
  const [webpage, setWebpage] = useState('');
  const [logo, setLogo] = useState('');

  // We'll store whether the user has been created in Auth.
  // Once they confirm their email, we insert the row in "workshops" table.
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    // Listen for auth changes. If we have a session with a user, create the workshop profile.
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // session?.user means the user is confirmed or at least recognized
        if (session?.user && !profileCreated) {
          // Attempt to create the workshop profile
          const { error } = await createWorkshopProfile({
            logo: logo.trim(),
            name: name.trim(),
            street_address: streetAddress.trim(),
            city: city.trim(),
            postal_code: postalCode.trim(),
            country: country.trim(),
            phone: phone.trim(),
            webpage: webpage.trim()
          });
          if (error) {
            console.error('Error creating workshop profile:', error);
          } else {
            setProfileCreated(true);
            Alert.alert(
              'Success',
              'Workshop profile created. Please log in and check your email for confirmation!'
            );
            router.replace('/login' as any);
          }
        }
      }
    );

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, [
    logo,
    name,
    streetAddress,
    city,
    postalCode,
    country,
    phone,
    webpage,
    profileCreated,
    router
  ]);

  // Dummy validation function – replace with actual API call if desired
  const validateAddress = async () => {
    if (!streetAddress.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      return false;
    }
    // Simulate an API validation delay
    return true;
  };

  const handleWorkshopSignup = async () => {
    if (
      !email.trim() ||
      !password.trim() ||
      !name.trim() ||
      !streetAddress.trim() ||
      !city.trim() ||
      !postalCode.trim() ||
      !phone.trim()
    ) {
      Alert.alert(
        'Error',
        'Email, password, workshop name, street address, city, postal code, and phone are mandatory.'
      );
      return;
    }
    const validAddress = await validateAddress();
    if (!validAddress) {
      Alert.alert(
        'Error',
        'Invalid address. Please check your street address, city, postal code, and country.'
      );
      return;
    }

    // Step 1: Sign up the user with Supabase Auth, setting user_metadata to indicate workshop
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: { isWorkshop: true }
      }
    });
    if (error) {
      Alert.alert('Sign-up Error', error.message);
      return;
    }
    // If using email confirmation, data.user may be null. We rely on the state change listener.
    if (data?.user) {
      // The user object is immediately available if email confirmations are disabled.
      // The auth state listener code above will create the workshop profile.
      Alert.alert(
        'Success',
        'Workshop user signed up. Check your email for confirmation link.'
      );
    } else {
      // If data.user is null, we wait for the onAuthStateChange callback to confirm the user.
      Alert.alert('Success', 'Check your email for a confirmation link!');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          Workshop Signup
        </Text>
        <TextInput
          label="Email*"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Password*"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Workshop Name*"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Street Address*"
          value={streetAddress}
          onChangeText={setStreetAddress}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="City*"
          value={city}
          onChangeText={setCity}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Postal Code*"
          value={postalCode}
          onChangeText={setPostalCode}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Country*"
          value={country}
          onChangeText={setCountry}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Phone*"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Webpage URL"
          value={webpage}
          onChangeText={setWebpage}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Logo URL"
          value={logo}
          onChangeText={setLogo}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />

        <Button
          mode="contained"
          onPress={handleWorkshopSignup}
          style={{ marginTop: 16, backgroundColor: '#3B82F6' }}
        >
          Sign Up as Workshop
        </Button>
      </Card>
    </View>
  );
}
