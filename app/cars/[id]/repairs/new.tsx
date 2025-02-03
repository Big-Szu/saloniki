import React, { useState, useEffect } from 'react';
import { View, Alert, FlatList, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../supabase';
import Breadcrumbs from '../../../../components/Breadcrumbs';

export default function NewRepairScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // car id
  const [description, setDescription] = useState('');
  const [repairDate, setRepairDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [mileage, setMileage] = useState('');
  // Workshop suggestion states
  const [workshopQuery, setWorkshopQuery] = useState('');
  const [workshopSuggestions, setWorkshopSuggestions] = useState<any[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const today = new Date();
      if (selectedDate > today) {
        Alert.alert('Error', 'Repair date cannot be in the future.');
        setRepairDate(today);
      } else {
        setRepairDate(selectedDate);
      }
    }
  };

  useEffect(() => {
    async function fetchWorkshops() {
      if (workshopQuery.trim().length >= 2) {
        const { data, error } = await supabase
          .from('workshops')
          .select('*')
          .or(`city.ilike.%${workshopQuery}%,name.ilike.%${workshopQuery}%`);
        if (!error && data) {
          setWorkshopSuggestions(data);
        }
      } else {
        setWorkshopSuggestions([]);
      }
    }
    fetchWorkshops();
  }, [workshopQuery]);

  const handleAddRepair = async () => {
    if (!description.trim() || !cost.trim() || !mileage.trim()) {
      Alert.alert('Error', 'Please fill all required fields: Description, Cost, Mileage, and Repair Date.');
      return;
    }
    const costNumber = parseFloat(cost);
    const mileageNumber = parseInt(mileage, 10);
    if (isNaN(costNumber) || isNaN(mileageNumber)) {
      Alert.alert('Error', 'Cost and Mileage must be valid numbers.');
      return;
    }
    const repairDateStr = repairDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('repairs')
      .insert([{
        car_id: id,
        description: description.trim(),
        repair_date: repairDateStr,
        cost: costNumber,
        currency,
        mileage: mileageNumber,
        workshop_id: selectedWorkshop || null
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
          multiline
          numberOfLines={6}
          style={{ marginBottom: 8, height: 120 }}
        />
        <Text>Repair Date*:</Text>
        <Button onPress={() => setShowDatePicker(true)} mode="outlined" style={{ marginBottom: 8 }}>
          {repairDate.toISOString().split('T')[0]}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={repairDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChangeDate}
          />
        )}
        <TextInput
          label="Cost*"
          value={cost}
          onChangeText={setCost}
          mode="outlined"
          style={{ marginBottom: 8 }}
          keyboardType="numeric"
        />
        <Text>Currency*:</Text>
        <Picker
          selectedValue={currency}
          onValueChange={(itemValue) => setCurrency(itemValue)}
          style={{ marginBottom: 8 }}
        >
          <Picker.Item label="EUR" value="EUR" />
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="GBP" value="GBP" />
        </Picker>
        <TextInput
          label="Mileage*"
          value={mileage}
          onChangeText={setMileage}
          mode="outlined"
          style={{ marginBottom: 8 }}
          keyboardType="numeric"
        />
        <Text>Workshop (optional):</Text>
        <TextInput
          label="Enter workshop name or city"
          value={workshopQuery}
          onChangeText={(text) => {
            setWorkshopQuery(text);
            setSelectedWorkshop('');
          }}
          mode="outlined"
          style={{ marginBottom: 8 }}
        />
        {workshopSuggestions.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, maxHeight: 150 }}>
            <FlatList
              data={workshopSuggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedWorkshop(item.id);
                    setWorkshopQuery(`${item.name} (${item.city})`);
                    setWorkshopSuggestions([]);
                  }}
                  style={{ padding: 8 }}
                >
                  <Text>{item.name} - {item.city}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
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
