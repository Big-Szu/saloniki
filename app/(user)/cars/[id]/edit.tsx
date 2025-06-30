import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [makes, setMakes] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedMake, setSelectedMake] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [year, setYear] = useState('');
  const [engine, setEngine] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCarDetails() {
      const { data: car, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();
        
      if (car) {
        setYear(car.year ? car.year.toString() : '');
        setEngine(car.engine || '');
        setVin(car.vin || '');
        setColor(car.color || '');
        setSelectedMake(car.make_id);
        setSelectedModel(car.model_id);
      } else {
        Alert.alert('Error', 'Car not found.');
        router.push('/cars');
      }
      setLoading(false);
    }
    fetchCarDetails();
  }, [id, router]);

  useEffect(() => {
    async function fetchMakes() {
      const { data: makesData } = await supabase
        .from('car_makes')
        .select('*')
        .order('name');
      if (makesData) setMakes(makesData);
    }
    fetchMakes();
  }, []);

  useEffect(() => {
    async function fetchModels() {
      if (selectedMake !== null) {
        const { data: modelsData } = await supabase
          .from('car_models')
          .select('*')
          .eq('make_id', selectedMake)
          .order('name');
        if (modelsData) setModels(modelsData);
      }
    }
    fetchModels();
  }, [selectedMake]);

  const handleUpdateCar = async () => {
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
    
    const { error } = await supabase
      .from('cars')
      .update({ 
        make_id: selectedMake, 
        model_id: selectedModel, 
        year: yearNumber, 
        engine: engine.trim(), 
        vin: vin.trim(), 
        color: color.trim() 
      })
      .eq('id', id);
      
    if (error) {
      Alert.alert('Error', 'Failed to update car: ' + error.message);
    } else {
      Alert.alert('Success', 'Car updated.');
      router.push(`/cars/${id}`);
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
      <Breadcrumbs paths={[
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Cars', path: '/cars' },
        { name: 'Edit Car', path: `/cars/${id}/edit` }
      ]} />
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Edit Car</Text>
        <Text>Make:</Text>
        <Picker
          selectedValue={selectedMake}
          onValueChange={(itemValue) => setSelectedMake(itemValue)}
          style={{ marginBottom: 8 }}
        >
          <Picker.Item label="Select a make" value={null} />
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
          <Picker.Item label="Select a model" value={null} />
          {models.map((model) => (
            <Picker.Item key={model.id} label={model.name} value={model.id} />
          ))}
        </Picker>
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
        <Button mode="contained" onPress={handleUpdateCar} style={{ marginTop: 16, backgroundColor: '#3B82F6' }}>
          Update Car
        </Button>
      </Card>
    </View>
  );
}