import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { Slot } from 'expo-router';

export default function App() {
  const colorScheme = useColorScheme(); // Auto-detect dark mode

  return (
    <PaperProvider>
      <Slot /> {/* Renders child screens */}
    </PaperProvider>
  );
}
