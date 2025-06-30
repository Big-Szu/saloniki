import React from 'react';
import { View, FlatList } from 'react-native';
import { Text } from 'react-native-paper';

export default function PendingRepairsScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge">Pending Confirmations</Text>
    </View>
  );
}