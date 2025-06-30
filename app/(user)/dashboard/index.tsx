// app/(user)/dashboard/index.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { getUserProfile } from '@/services/api/auth';
import { getCarsForUser, getCarMakes, getAllCarModels } from '@/services/api/cars';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function DashboardScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileData = await getUserProfile();
        setProfile(profileData);

        const carsData = await getCarsForUser();
        setCars(carsData);

        const makesData = await getCarMakes();
        setMakes(makesData);

        const modelsData = await getAllCarModels();
        setModels(modelsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Build mappings for easier display.
  const makeMap: Record<number, string> = {};
  makes.forEach((make) => {
    makeMap[make.id] = make.name;
  });

  const modelMap: Record<number, string> = {};
  models.forEach((model) => {
    modelMap[model.id] = model.name;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Welcome Header */}
      <View style={{ marginBottom: 16, alignItems: 'center' }}>
        <Text variant="headlineLarge">
          Welcome, {profile?.name || 'Guest'}!
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <Button
            mode="contained"
            onPress={() => router.push('/profile')}
            style={{ marginRight: 8 }}
          >
            View Profile
          </Button>
          <Button mode="contained" onPress={handleLogout} style={{ backgroundColor: 'red' }}>
            Logout
          </Button>
        </View>
      </View>

      {/* Breadcrumbs starting at Dashboard */}
      <Breadcrumbs paths={[
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Cars', path: '/cars' }
      ]} />

      {/* Add New Car Button */}
      <Button
        mode="contained"
        onPress={() => router.push('/cars/new')}
        style={{ marginVertical: 16 }}
      >
        Add New Car
      </Button>

      {/* Cars List */}
      {cars.length === 0 ? (
        <Card style={{ padding: 16 }}>
          <Text>No cars yet. Add your first car!</Text>
        </Card>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/cars/${item.id}`)}
            >
              <Card style={{ marginBottom: 8 }}>
                <Card.Content>
                  <Text variant="titleMedium">
                    {makeMap[item.make_id] || 'Unknown'} {modelMap[item.model_id] || 'Unknown'}
                  </Text>
                  <Text>Year: {item.year}</Text>
                  <Text>Engine: {item.engine}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}