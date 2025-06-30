import React from 'react';
import { Stack } from 'expo-router';

export default function CarsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{ title: 'Add New Car' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}