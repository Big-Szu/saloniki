import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCarsForUser } from '../../supabase';

export default function CarsListScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCars() {
      const data = await getCarsForUser();
      setCars(data);
      setLoading(false);
    }
    fetchCars();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button mode="contained" onPress={() => router.push('/cars/new' as any)} style={{ marginBottom: 16 }}>
        Add New Car
      </Button>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/cars/${item.id}` as any)}>
            <Card style={{ marginBottom: 12, padding: 12 }}>
              <Text variant="titleMedium">Car ID: {item.id}</Text>
              <Text>Year: {item.year}</Text>
              <Text>Engine: {item.engine}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
