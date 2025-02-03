import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createCar, getCarMakes, getCarModelsForMake } from '../../supabase';
import Breadcrumbs from '../../components/Breadcrumbs';

export default function NewCarScreen() {
  const router = useRouter();
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedMake, setSelectedMake] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);

  useEffect(() => {
    async function fetchMakes() {
      const makesData = await getCarMakes();
      setMakes(makesData);
      if (makesData.length > 0) {
        setSelectedMake(makesData[0].id);
      }
      setLoadingMakes(false);
    }
    fetchMakes();
  }, []);

  useEffect(() => {
    async function fetchModels() {
      if (selectedMake !== null) {
        setLoadingModels(true);
        const modelsData = await getCarModelsForMake(selectedMake);
        setModels(modelsData);
        if (modelsData.length > 0) {
          setSelectedModel(modelsData[0].id);
        }
        setLoadingModels(false);
      }
    }
    fetchModels();
  }, [selectedMake]);

  const handleCreateCar = async () => {
    if (!selectedMake || !selectedModel || !year.trim() || !engine.trim()) {
      Alert.alert('Error', 'Please fill all required fields: Make, Model, Year, and Engine.');
      return;
    }
    const yearNumber = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNumber) || yearNumber < 1800 || yearNumber > currentYear) {
      Alert.alert('Error', `Year must be between 1800 and ${currentYear}.`);
      return;
    }
    const { data, error } = await createCar({ 
      make_id: selectedMake, 
      model_id: selectedModel, 
      year: yearNumber, 
      engine: engine.trim(), 
      vin: vin.trim(), 
      color: color.trim() 
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
      <Breadcrumbs paths={[
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Add New Car', path: '/cars/new' }
      ]} />
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Add New Car</Text>
        <Text>Make:</Text>
        {loadingMakes ? (
          <Text>Loading makes...</Text>
        ) : (
          <Picker
            selectedValue={selectedMake}
            onValueChange={(itemValue) => setSelectedMake(itemValue)}
            style={{ marginBottom: 8 }}
          >
            {makes.map((make) => (
              <Picker.Item key={make.id} label={make.name} value={make.id} />
            ))}
          </Picker>
        )}
        <Text>Model:</Text>
        {loadingModels ? (
          <Text>Loading models...</Text>
        ) : (
          <Picker
            selectedValue={selectedModel}
            onValueChange={(itemValue) => setSelectedModel(itemValue)}
            style={{ marginBottom: 8 }}
          >
            {models.map((model) => (
              <Picker.Item key={model.id} label={model.name} value={model.id} />
            ))}
          </Picker>
        )}
        {/* Year comes before Engine */}
        <Text style={{ fontWeight: 'bold' }}>Year*:</Text>
        <TextInput
          label="Year"
          value={year}
          onChangeText={setYear}
          mode="outlined"
          style={{ marginBottom: 8 }}
          keyboardType="numeric"
        />
        <Text style={{ fontWeight: 'bold' }}>Engine*:</Text>
        <TextInput
          label="Engine"
          value={engine}
          onChangeText={setEngine}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <Text>VIN:</Text>
        <TextInput
          label="VIN"
          value={vin}
          onChangeText={setVin}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <Text>Color:</Text>
        <TextInput
          label="Color"
          value={color}
          onChangeText={setColor}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <Button
          mode="contained"
          onPress={handleCreateCar}
          style={{ marginTop: 16, backgroundColor: '#3B82F6' }}
        >
          Create Car
        </Button>
      </Card>
    </View>
  );
}
