import React from 'react';
import { View } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';

export default function WorkshopSearchScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Searchbar
        placeholder="Search workshops..."
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
    </View>
  );
}