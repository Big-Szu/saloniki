import React from 'react';
import { View } from 'react-native';
import { Text, Button, TextInput, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Reset Password</Text>
        <TextInput
          label="Email"
          mode="outlined"
          style={{ marginBottom: 16 }}
        />
        <Button mode="contained" onPress={() => {}}>
          Send Reset Link
        </Button>
        <Button mode="text" onPress={() => router.back()}>
          Back to Login
        </Button>
      </Card>
    </View>
  );
}