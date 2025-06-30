import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { Car, CarMake, CarModel } from '@/types';
import { CarCard } from '@/components/cars/CarCard';

export default function CarsListScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's cars
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const [carsResponse, makesResponse, modelsResponse] = await Promise.all([
        supabase.from('cars').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false }),
        supabase.from('car_makes').select('*').order('name'),
        supabase.from('car_models').select('*').order('name')
      ]);
      
      if (carsResponse.data) setCars(carsResponse.data);
      if (makesResponse.data) setMakes(makesResponse.data);
      if (modelsResponse.data) setModels(modelsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getMakeName = (makeId: number) => makes.find(m => m.id === makeId)?.name || 'Unknown';
  const getModelName = (modelId: number) => models.find(m => m.id === modelId)?.name || 'Unknown';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <CarCard
            car={{
              ...item,
              make: getMakeName(item.make_id),
              model: getModelName(item.model_id)
            }}
            onPress={() => router.push(`/(user)/cars/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>No cars added yet</Text>
            <Text variant="bodyMedium" style={{ color: '#6B7280' }}>Add your first car to start tracking maintenance</Text>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        style={{ 
          position: 'absolute', 
          right: 16, 
          bottom: 16,
          backgroundColor: '#3B82F6'
        }}
        onPress={() => router.push('/(user)/cars/new')}
      />
    </View>
  );
}