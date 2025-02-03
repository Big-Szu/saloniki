import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getCarsForUser, getCarMakes, getAllCarModels } from '../../supabase';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function CarsListScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const carsData = await getCarsForUser();
      setCars(carsData);
      const makesData = await getCarMakes();
      setMakes(makesData);
      const modelsData = await getAllCarModels();
      setModels(modelsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Create mappings from id to name
  const makeMap: Record<number, string> = {};
  makes.forEach((make) => {
    makeMap[make.id] = make.name;
  });

  const modelMap: Record<number, string> = {};
  models.forEach((model) => {
    modelMap[model.id] = model.name;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Breadcrumbs paths={[
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Cars', path: '/cars' }
      ]} />
      <Button
        mode="contained"
        onPress={() => router.push('/cars/new' as any)}
        style={{ marginBottom: 16 }}
      >
        Add New Car
      </Button>
      {cars.length === 0 ? (
        <Text>No vehicles found.</Text>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/cars/${item.id}` as any)}>
              <Card style={{ marginBottom: 12, padding: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                  {makeMap[item.make_id] || 'Unknown Make'}, {modelMap[item.model_id] || 'Unknown Model'}
                </Text>
                <Text>Year: {item.year}</Text>
                <Text>Engine: {item.engine}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
