import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCarById, getRepairsForCar, getCarMakes, getCarModelsForMake, deleteCar } from '../../supabase';

export default function CarDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [makeName, setMakeName] = useState('');
  const [modelName, setModelName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCar() {
      const carData = await getCarById(id as string);
      if (carData) {
        setCar(carData);
        // Get make name
        const makes = await getCarMakes();
        const make = makes.find((m: any) => m.id === carData.make_id);
        setMakeName(make ? make.name : '');
        // Get model name from the selected make
        const models = await getCarModelsForMake(carData.make_id);
        const model = models.find((m: any) => m.id === carData.model_id);
        setModelName(model ? model.name : '');
      }
      const repairsData = await getRepairsForCar(id as string);
      setRepairs(repairsData);
      setLoading(false);
    }
    fetchCar();
  }, [id]);

  const handleDelete = async () => {
    const { error } = await deleteCar(id as string);
    if (error) {
      alert('Error deleting car: ' + error.message);
    } else {
      router.push('/cars' as any);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No car found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <Text variant="titleLarge">{makeName} {modelName}</Text>
        <Text>Engine: {car.engine}</Text>
        <Text>Year: {car.year}</Text>
        {car.vin && <Text>VIN: {car.vin}</Text>}
        {car.color && <Text>Color: {car.color}</Text>}
      </Card>
      <Button mode="contained" onPress={() => router.push(`/cars/edit/${id}` as any)} style={{ marginBottom: 16 }}>
        Edit Car
      </Button>
      <Button mode="contained" onPress={handleDelete} style={{ marginBottom: 16, backgroundColor: 'red' }}>
        Delete Car
      </Button>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Past Repairs / Maintenance:</Text>
      {repairs.length === 0 ? (
        <Text>No repairs found.</Text>
      ) : (
        repairs.map((repair) => (
          <Card key={repair.id} style={{ marginBottom: 8, padding: 8 }}>
            <Text>Description: {repair.description}</Text>
            <Text>Date: {new Date(repair.repair_date).toLocaleDateString()}</Text>
            <Text>Cost: {repair.cost}</Text>
            {repair.confirmed && <Text>Repair Confirmed</Text>}
            {repair.workshop_id && <Text>Workshop: {repair.workshop_id}</Text>}
          </Card>
        ))
      )}
    </ScrollView>
  );
}
