import React from 'react';
import { Stack } from 'expo-router';

export default function RepairsLayout() {
  return (
    <Stack>
      <Stack.Screen name="new" options={{ title: 'Add Repair' }} />
      <Stack.Screen name="[repairId]" options={{ title: 'Repair Details' }} />
    </Stack>
  );
}