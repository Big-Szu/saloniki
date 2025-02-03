import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getWorkshopProfile, supabase } from '../../supabase';

export default function WorkshopDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const workshopProfile = await getWorkshopProfile();
      setProfile(workshopProfile);
      if (workshopProfile) {
        const { data, error } = await supabase
          .from('repairs')
          .select('*')
          .eq('workshop_id', workshopProfile.id)
          .eq('confirmed', false);
        if (error) console.error(error);
        else setRepairs(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login' as any);
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding: 16 }}>
      <Text variant="headlineLarge" style={{ marginBottom: 16 }}>
        Welcome, {profile?.name || 'Workshop'}!
      </Text>
      <Button mode="contained" onPress={() => router.push('/workshops/edit' as any)} style={{ marginBottom: 16 }}>
        Edit Profile
      </Button>
      <Button mode="contained" onPress={() => router.push('/workshops/repairs' as any)} style={{ marginBottom: 16 }}>
        View All Repairs
      </Button>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Repairs Awaiting Confirmation:</Text>
      {repairs.length === 0 ? (
        <Text>No repairs awaiting confirmation.</Text>
      ) : (
        <FlatList
          data={repairs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/workshops/repairs/${item.id}` as any)}>
              <Card style={{ marginBottom: 12, padding: 12 }}>
                <Text>Date: {new Date(item.repair_date).toLocaleDateString()}</Text>
                <Text>Cost: {item.cost} {item.currency}</Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
      <Button mode="contained" onPress={handleLogout} style={{ marginTop: 16, backgroundColor: 'red' }}>
        Logout
      </Button>
    </View>
  );
}
