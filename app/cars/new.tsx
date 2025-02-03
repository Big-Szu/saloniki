import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createCar, getCarMakes, getCarModelsForMake } from '../../supabase';

export default function NewCarScreen() {
  const router = useRouter();
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedMake, setSelectedMake] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [engine, setEngine] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    async function fetchMakes() {
      const makesData = await getCarMakes();
      setMakes(makesData);
      if (makesData.length > 0) {
        setSelectedMake(makesData[0].id);
      }
    }
    fetchMakes();
  }, []);

  useEffect(() => {
    async function fetchModels() {
      if (selectedMake !== null) {
        const modelsData = await getCarModelsForMake(selectedMake);
        setModels(modelsData);
        if (modelsData.length > 0) {
          setSelectedModel(modelsData[0].id);
        }
      }
    }
    fetchModels();
  }, [selectedMake]);

  const handleCreateCar = async () => {
    if (!selectedMake || !selectedModel || !engine || !year) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    const yearNumber = parseInt(year, 10);
    const { data, error } = await createCar({ 
      make_id: selectedMake, 
      model_id: selectedModel, 
      engine, 
      year: yearNumber, 
      vin, 
      color 
    });
    if (error) {
      Alert.alert('Error', 'Failed to create car: ' + error.message);
    } else {
      Alert.alert('Success', 'Car profile created.');
      router.push('/cars' as any);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Add New Car</Text>
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
        <Button mode="contained" onPress={handleCreateCar} style={{ marginTop: 16, backgroundColor: '#3B82F6' }}>
          Create Car
        </Button>
      </Card>
    </View>
  );
}
