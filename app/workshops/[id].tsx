import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

export default function PublicWorkshopScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Workshop Profile: {id}</Text>
    </View>
  );
}