import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert('Error', 'Failed to fetch user details');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('name, email, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        Alert.alert('Error', 'Failed to fetch profile data');
      } else {
        setName(data.name);
        setEmail(data.email);
        setAvatarUrl(data.avatar_url);
      }
    };

    fetchProfile();
  }, []);

  // Function to pick and upload a new avatar
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  // Save updated profile
  const handleSave = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not found');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ name, email, avatar_url: avatarUrl })
      .eq('id', user.id);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to update profile');
    } else {
      Alert.alert('Success', 'Profile updated!');
      router.replace('/profile'); // Navigate back to profile screen
    }
  };

  return (
    <View className="flex-1 p-4 bg-white justify-center items-center">
      <Text className="text-xl font-bold mb-4">Edit Profile</Text>

      {/* Avatar Upload */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: avatarUrl || 'https://via.placeholder.com/100' }}
          className="w-24 h-24 rounded-full mb-4"
        />
      </TouchableOpacity>
      <Text className="text-sm text-gray-500 mb-2">Tap to change avatar</Text>

      {/* Name Input */}
      <Text className="self-start ml-2">Name:</Text>
      <TextInput
        className="border border-gray-300 p-2 w-80 rounded mb-3"
        value={name}
        onChangeText={setName}
      />

      {/* Email Input */}
      <Text className="self-start ml-2">Email:</Text>
      <TextInput
        className="border border-gray-300 p-2 w-80 rounded mb-3"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Save Button */}
      <Button title={loading ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={loading} />

      {/* Cancel Button */}
      <Button title="Cancel" color="gray" onPress={() => router.replace('/profile')} />
    </View>
  );
}
