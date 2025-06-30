import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCarById, getRepairsForCarPaginated, getCarMakes, getCarModelsForMake, deleteCar } from '@/services/supabase/client';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function CarDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [makeName, setMakeName] = useState('');
  const [modelName, setModelName] = useState('');
  const [makeLogo, setMakeLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [repairsPage, setRepairsPage] = useState(0);
  const [hasMoreRepairs, setHasMoreRepairs] = useState(true);
  const repairsPerPage = 10;

  useEffect(() => {
    async function fetchCar() {
      const carData = await getCarById(id as string);
      if (carData) {
        setCar(carData);
        // Get make and logo
        const makes = await getCarMakes();
        const make = makes.find((m: any) => m.id === carData.make_id);
        setMakeName(make ? make.name : '');
        setMakeLogo(make ? make.logo : '');
        // Get model name using the selected make
        const models = await getCarModelsForMake(carData.make_id);
        const model = models.find((m: any) => m.id === carData.model_id);
        setModelName(model ? model.name : '');
      }
      const initialRepairs = await getRepairsForCarPaginated(id as string, repairsPerPage, 0);
      setRepairs(initialRepairs);
      setHasMoreRepairs(initialRepairs.length === repairsPerPage);
      setLoading(false);
    }
    fetchCar();
  }, [id]);

  const loadMoreRepairs = async () => {
    const newOffset = (repairsPage + 1) * repairsPerPage;
    const moreRepairs = await getRepairsForCarPaginated(id as string, repairsPerPage, newOffset);
    setRepairs(prev => [...prev, ...moreRepairs]);
    setRepairsPage(repairsPage + 1);
    if (moreRepairs.length < repairsPerPage) {
      setHasMoreRepairs(false);
    }
  };

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

  // Header content for the FlatList
  const ListHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Breadcrumbs
        paths={[
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Cars', path: '/cars' },
          { name: `${makeName} ${modelName}`, path: `/cars/${id}` }
        ]}
      />
      <Card style={{ padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              {makeName}, {modelName}
            </Text>
          </View>
          {makeLogo ? (
            <Image source={{ uri: makeLogo }} style={{ width: 50, height: 50, marginLeft: 8 }} />
          ) : null}
        </View>
        <Text>Year: {car.year}</Text>
        <Text>Engine: {car.engine}</Text>
        {car.vin && <Text>VIN: {car.vin}</Text>}
        {car.color && <Text>Color: {car.color}</Text>}
      </Card>
      <Button
        mode="contained"
        onPress={() => router.push(`/cars/edit/${id}` as any)}
        style={{ marginBottom: 16 }}
      >
        Edit Car
      </Button>
      <Button
        mode="contained"
        onPress={() => router.push(`/cars/${id}/repairs/new` as any)}
        style={{ marginBottom: 16, backgroundColor: '#3B82F6' }}
      >
        Add Repair
      </Button>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>Past Repairs:</Text>
    </View>
  );

  // Footer content for the FlatList
  const ListFooter = () => (
    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
      {hasMoreRepairs && (
        <Button mode="text" onPress={loadMoreRepairs}>
          Load More Repairs
        </Button>
      )}
      <Button
        mode="contained"
        onPress={handleDelete}
        style={{ marginTop: 16, backgroundColor: 'red' }}
      >
        Delete Car
      </Button>
    </View>
  );

  // Render each repair item (minimal view: date, cost with currency, confirmed marker)
  const renderRepairItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/cars/${id}/repairs/${item.id}` as any)}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderColor: '#ccc'
        }}
      >
        <Text style={{ flex: 1 }}>{new Date(item.repair_date).toLocaleDateString()}</Text>
        <Text style={{ flex: 1, textAlign: 'center' }}>
          {item.cost} {item.currency}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>
          {item.confirmed ? '★' : '☆'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={repairs}
      keyExtractor={(item) => item.id}
      renderItem={renderRepairItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
    />
  );
}
