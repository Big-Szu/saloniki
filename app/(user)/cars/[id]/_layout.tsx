import React from 'react';
import { Stack } from 'expo-router';

export default function CarDetailLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Car Details' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Car' }} />
      <Stack.Screen name="repairs" options={{ headerShown: false }} />
    </Stack>
  );
}