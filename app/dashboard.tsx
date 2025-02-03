import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCarsForUser, getUserProfile, supabase } from '../supabase';

export default function DashboardScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const profileData = await getUserProfile();
      setProfile(profileData);
      const carsData = await getCarsForUser();
      setCars(carsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login' as any);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header with welcome text and profile actions */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
        <Text variant="headlineLarge">
          Welcome, {profile?.name || 'Guest'}!
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Button
            mode="contained"
            onPress={() => router.push('/profile' as any)}
            style={{ marginRight: 8 }}
          >
            View Profile
          </Button>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={{ backgroundColor: 'red' }}
          >
            Logout
          </Button>
        </View>
      </View>

      {/* Button to add a new car */}
      <Button
        mode="contained"
        onPress={() => router.push('/cars/new' as any)}
        style={{ marginBottom: 16 }}
      >
        Add New Car
      </Button>

      {/* Cars list */}
      {cars.length === 0 ? (
        <Text>No vehicles found.</Text>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/cars/${item.id}` as any)}>
              <Card style={{ marginBottom: 12, padding: 12 }}>
                <Text variant="titleMedium">
                  Car ID: {item.id}
                </Text>
                <Text>Year: {item.year}</Text>
                <Text>Engine: {item.engine}</Text>
                {item.vin && <Text>VIN: {item.vin}</Text>}
                {item.color && <Text>Color: {item.color}</Text>}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
