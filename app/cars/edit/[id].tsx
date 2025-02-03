import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCarById, updateCar, getCarMakes, getCarModelsForMake } from '../../supabase';

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedMake, setSelectedMake] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [engine, setEngine] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCarDetails() {
      const car = await getCarById(id as string);
      if (car) {
        setEngine(car.engine || '');
        setYear(car.year ? car.year.toString() : '');
        setVin(car.vin || '');
        setColor(car.color || '');
        setSelectedMake(car.make_id);
        setSelectedModel(car.model_id);
      } else {
        Alert.alert('Error', 'Car not found.');
        router.push('/cars' as any);
      }
      setLoading(false);
    }
    fetchCarDetails();
  }, [id, router]);

  useEffect(() => {
    async function fetchMakes() {
      const makesData = await getCarMakes();
      setMakes(makesData);
    }
    fetchMakes();
  }, []);

  useEffect(() => {
    async function fetchModels() {
      if (selectedMake !== null) {
        const modelsData = await getCarModelsForMake(selectedMake);
        setModels(modelsData);
      }
    }
    fetchModels();
  }, [selectedMake]);

  const handleUpdateCar = async () => {
    if (!selectedMake || !selectedModel || !engine || !year) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    const yearNumber = parseInt(year, 10);
    const { error } = await updateCar(id as string, { 
      make_id: selectedMake, 
      model_id: selectedModel, 
      engine, 
      year: yearNumber, 
      vin, 
      color 
    });
    if (error) {
      Alert.alert('Error', 'Failed to update car: ' + error.message);
    } else {
      Alert.alert('Success', 'Car updated.');
      router.push(`/cars/${id}` as any);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Edit Car</Text>
        <Text>Make:</Text>
        <Picker
          selectedValue={selectedMake}
          onValueChange={(itemValue) => setSelectedMake(itemValue)}
          style={{ marginBottom: 8 }}
        >
          {makes.map((make) => (
            <Picker.Item key={make.id} label={make.name} value={make.id} />
          ))}
        </Picker>
        <Text>Model:</Text>
        <Picker
          selectedValue={selectedModel}
          onValueChange={(itemValue) => setSelectedModel(itemValue)}
          style={{ marginBottom: 8 }}
        >
          {models.map((model) => (
            <Picker.Item key={model.id} label={model.name} value={model.id} />
          ))}
        </Picker>
        <TextInput
          label="Engine"
          value={engine}
          onChangeText={setEngine}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Year"
          value={year}
          onChangeText={setYear}
          mode="outlined"
          style={{ marginBottom: 8 }}
          keyboardType="numeric"
        />
        <TextInput
          label="VIN"
          value={vin}
          onChangeText={setVin}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Color"
          value={color}
          onChangeText={setColor}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <Button mode="contained" onPress={handleUpdateCar} style={{ marginTop: 16, backgroundColor: '#3B82F6' }}>
          Update Car
        </Button>
      </Card>
    </View>
  );
}
