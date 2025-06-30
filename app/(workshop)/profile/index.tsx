import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function WorkshopProfileScreen() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Workshop Profile</Text>
      <Button mode="contained" onPress={() => router.push('/(workshop)/profile/edit')}>
        Edit Profile
      </Button>
    </View>
  );
}