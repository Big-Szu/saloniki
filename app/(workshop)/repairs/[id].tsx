import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { colors } from '@/theme/colors';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface RepairDetail {
  id: string;
  car_id: string;
  workshop_id: string;
  repair_date: string;
  description: string;
  cost: number;
  currency: string;
  mileage: number;
  confirmed: boolean;
  created_at: string;
  updated_at: string;
  car?: {
    id: string;
    make_id: number;
    model_id: number;
    year: number;
    user_id: string;
    user?: {
      email: string;
      profile?: {
        name: string;
      };
    };
  };
}

export default function WorkshopRepairDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [repair, setRepair] = useState<RepairDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRepairDetails();
  }, [id]);

  const fetchRepairDetails = async () => {
    try {
      // Fetch repair with related car and user information
      const { data, error } = await supabase
        .from('repairs')
        .select(`
          *,
          cars (
            id,
            make_id,
            model_id,
            year,
            user_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch user profile separately if we have a car
      if (data?.cars) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', data.cars.user_id)
          .single();

        if (profileData) {
          data.car = {
            ...data.cars,
            user: {
              email: profileData.email,
              profile: {
                name: profileData.name
              }
            }
          };
        }
      }

      setRepair(data);
    } catch (error) {
      console.error('Error fetching repair details:', error);
      Alert.alert('Error', 'Failed to load repair details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRepair = async () => {
    if (!repair) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('repairs')
        .update({ confirmed: true })
        .eq('id', repair.id);

      if (error) throw error;

      Alert.alert('Success', 'Repair confirmed successfully');
      setRepair({ ...repair, confirmed: true });
    } catch (error) {
      console.error('Error confirming repair:', error);
      Alert.alert('Error', 'Failed to confirm repair');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectRepair = async () => {
    Alert.alert(
      'Reject Repair',
      'Are you sure you want to reject this repair? This will delete it from the system.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              const { error } = await supabase
                .from('repairs')
                .delete()
                .eq('id', repair?.id);

              if (error) throw error;

              Alert.alert('Success', 'Repair rejected and removed');
              router.back();
            } catch (error) {
              console.error('Error rejecting repair:', error);
              Alert.alert('Error', 'Failed to reject repair');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!repair) {
    return (
      <View style={styles.center}>
        <Text>Repair not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Repair Details
        </Text>
        <Chip
          mode="flat"
          style={[
            styles.statusChip,
            repair.confirmed ? styles.confirmedChip : styles.pendingChip
          ]}
        >
          {repair.confirmed ? 'Confirmed' : 'Pending'}
        </Chip>
      </View>

      {/* Customer Information */}
      <Card style={styles.card}>
        <Card.Title title="Customer Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text>{repair.car?.user?.profile?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text>{repair.car?.user?.email || 'N/A'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Vehicle Information */}
      <Card style={styles.card}>
        <Card.Title title="Vehicle Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vehicle:</Text>
            <Text>
              {repair.car?.year} - Make ID: {repair.car?.make_id}, Model ID: {repair.car?.model_id}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Repair Information */}
      <Card style={styles.card}>
        <Card.Title title="Repair Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text>{formatDate(repair.repair_date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cost:</Text>
            <Text style={styles.cost}>
              {formatCurrency(repair.cost, repair.currency)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mileage:</Text>
            <Text>{repair.mileage.toLocaleString()} km</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.description}>{repair.description}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      {!repair.confirmed && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleConfirmRepair}
            loading={updating}
            disabled={updating}
            style={[styles.actionButton, styles.confirmButton]}
          >
            Confirm Repair
          </Button>
          <Button
            mode="outlined"
            onPress={handleRejectRepair}
            loading={updating}
            disabled={updating}
            style={styles.actionButton}
            textColor={colors.danger}
          >
            Reject Repair
          </Button>
        </View>
      )}

      <Button
        mode="text"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Back to Dashboard
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontWeight: '600',
  },
  statusChip: {
    height: 32,
  },
  confirmedChip: {
    backgroundColor: colors.success + '20',
  },
  pendingChip: {
    backgroundColor: colors.warning + '20',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 80,
    color: colors.text.secondary,
  },
  cost: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    marginTop: 4,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
  },
  confirmButton: {
    backgroundColor: colors.success,
  },
  backButton: {
    margin: 16,
  },
});