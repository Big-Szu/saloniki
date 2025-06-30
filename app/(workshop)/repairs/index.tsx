import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getWorkshopProfile, supabase } from '../../@/services/supabase/client';

export default function WorkshopRepairsList() {
  const router = useRouter();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRepairs() {
      const workshopProfile = await getWorkshopProfile();
      if (workshopProfile) {
        const { data, error } = await supabase
          .from('repairs')
          .select('*')
          .eq('workshop_id', workshopProfile.id);
        if (error) console.error(error);
        else setRepairs(data);
      }
      setLoading(false);
    }
    fetchRepairs();
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>All Repairs</Text>
      {repairs.length === 0 ? (
        <Text>No repairs found.</Text>
      ) : (
        <FlatList
          data={repairs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/workshops/repairs/${item.id}` as any)}>
              <Card style={{ marginBottom: 12, padding: 12 }}>
                <Text>Date: {new Date(item.repair_date).toLocaleDateString()}</Text>
                <Text>Cost: {item.cost} {item.currency}</Text>
                <Text>Mileage: {item.mileage}</Text>
                <Text>Confirmed: {item.confirmed ? 'Yes' : 'No'}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
      <Button mode="contained" onPress={() => router.push('/workshops/dashboard' as any)} style={{ marginTop: 16 }}>
        Back to Dashboard
      </Button>
    </View>
  );
}
