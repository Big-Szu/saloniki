import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../supabase';
import Breadcrumbs from '../../../../components/Breadcrumbs';

export default function RepairDetailScreen() {
  const { id, repairId } = useLocalSearchParams<{ id: string; repairId: string }>();
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepair() {
      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .eq('id', repairId)
        .single();
      if (!error) {
        setRepair(data);
      }
      setLoading(false);
    }
    fetchRepair();
  }, [repairId]);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!repair) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No repair details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Breadcrumbs 
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Cars', path: '/cars' },
          { name: 'Repair Details', path: `/cars/${id}/repairs/${repairId}` }
        ]}
      />
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Repair Details</Text>
        <Text>Description: {repair.description}</Text>
        <Text>Date: {new Date(repair.repair_date).toLocaleDateString()}</Text>
        <Text>Cost: {repair.cost} {repair.currency}</Text>
        <Text>Mileage: {repair.mileage}</Text>
        {repair.workshop_id && <Text>Workshop ID: {repair.workshop_id}</Text>}
        <Text>Confirmed: {repair.confirmed ? 'Yes' : 'No'}</Text>
      </Card>
    </ScrollView>
  );
}
