import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Text, Card, Switch } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../supabase';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function NewRepairScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // car id
  const [description, setDescription] = useState('');
  const [repairDate, setRepairDate] = useState('');
  const [cost, setCost] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [workshopId, setWorkshopId] = useState('');

  const handleAddRepair = async () => {
    if (!description.trim() || !repairDate.trim() || !cost.trim()) {
      Alert.alert('Error', 'Please fill all required fields: Description, Repair Date, and Cost.');
      return;
    }
    const costNumber = parseFloat(cost);
    if (isNaN(costNumber)) {
      Alert.alert('Error', 'Cost must be a valid number.');
      return;
    }
    const { data, error } = await supabase
      .from('repairs')
      .insert([{
        car_id: id,
        description: description.trim(),
        repair_date: repairDate.trim(), // Ideally use a date picker; here we assume YYYY-MM-DD
        cost: costNumber,
        workshop_id: workshopId.trim() || null,
        confirmed
      }])
      .single();
    if (error) {
      Alert.alert('Error', 'Failed to add repair: ' + error.message);
    } else {
      Alert.alert('Success', 'Repair added.');
      router.push(`/cars/${id}` as any);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Breadcrumbs 
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Cars', path: '/cars' },
          { name: 'Repair', path: `/cars/${id}/repairs/new` }
        ]}
      />
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Add Repair</Text>
        <TextInput
          label="Description*"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Repair Date* (YYYY-MM-DD)"
          value={repairDate}
          onChangeText={setRepairDate}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <TextInput
          label="Cost*"
          value={cost}
          onChangeText={setCost}
          mode="outlined"
          style={{ marginBottom: 8 }}
          keyboardType="numeric"
        />
        <TextInput
          label="Workshop ID (optional)"
          value={workshopId}
          onChangeText={setWorkshopId}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text>Confirmed:</Text>
          <Switch value={confirmed} onValueChange={setConfirmed} />
        </View>
        <Button
          mode="contained"
          onPress={handleAddRepair}
          style={{ marginTop: 16, backgroundColor: '#3B82F6' }}
        >
          Add Repair
        </Button>
      </Card>
    </View>
  );
}
