import React, { useEffect, useState, useRef } from 'react';
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
    engine?: string;
    color?: string;
    vin?: string;
    make?: {
      id: number;
      name: string;
    };
    model?: {
      id: number;
      name: string;
    };
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
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    console.log('WorkshopRepairDetailScreen mounted with id:', id);
    isMounted.current = true;

    if (!id) {
      console.error('No repair ID provided');
      setError('No repair ID provided');
      setLoading(false);
      return;
    }

    fetchRepairDetails();

    return () => {
      console.log('WorkshopRepairDetailScreen unmounting');
      isMounted.current = false;
    };
  }, [id]);

  const fetchRepairDetails = async () => {
    try {
      console.log('Fetching repair details for ID:', id);
      setError(null);

      // Fetch repair with related car information
      const { data: repairData, error: repairError } = await supabase
        .from('repairs')
        .select(`
          *,
          car:cars!car_id (
            id,
            make_id,
            model_id,
            year,
            user_id,
            engine,
            color,
            vin,
            make:car_makes!make_id (
              id,
              name
            ),
            model:car_models!model_id (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (repairError) {
        console.error('Supabase error:', repairError);
        throw repairError;
      }

      if (!repairData) {
        console.log('No repair data found');
        throw new Error('Repair not found');
      }

      console.log('Repair data loaded:', repairData.id);
      console.log('Car data:', repairData.car);

      let finalData = { ...repairData };

      // Fetch user profile if we have a car with user_id
      if (repairData?.car?.user_id) {
        console.log('Fetching user profile for:', repairData.car.user_id);
        
        // First try to get from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', repairData.car.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          
          // If profile doesn't exist, try to get email from auth.users
          // Note: This requires admin access which we don't have from client
          // So we'll just show N/A for now
          finalData.car = {
            ...repairData.car,
            user: {
              email: 'N/A',
              profile: {
                name: 'User'
              }
            }
          };
        } else if (profileData) {
          console.log('Profile data found:', profileData);
          finalData.car = {
            ...repairData.car,
            user: {
              email: profileData.email,
              profile: {
                name: profileData.name
              }
            }
          };
        }
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        setRepair(finalData);
        setError(null);
        console.log('Repair state updated with data:', finalData);
      }
    } catch (error) {
      console.error('Error fetching repair details:', error);
      if (isMounted.current) {
        setError(error instanceof Error ? error.message : 'Failed to load repair details');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
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
      if (isMounted.current) {
        setRepair({ ...repair, confirmed: true });
      }
    } catch (error) {
      console.error('Error confirming repair:', error);
      Alert.alert('Error', 'Failed to confirm repair');
    } finally {
      if (isMounted.current) {
        setUpdating(false);
      }
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

              Alert.alert('Success', 'Repair rejected and removed', [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]);
            } catch (error) {
              console.error('Error rejecting repair:', error);
              Alert.alert('Error', 'Failed to reject repair');
            } finally {
              if (isMounted.current) {
                setUpdating(false);
              }
            }
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    console.log('Going back to dashboard');
    router.back();
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading repair details...</Text>
      </View>
    );
  }

  // Show error state if there's an error
  if (error || !repair) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Repair not found'}</Text>
        <Button 
          mode="contained" 
          onPress={handleGoBack} 
          style={styles.backButton}
        >
          Go Back to Dashboard
        </Button>
      </View>
    );
  }

  // Show repair details
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
              {repair.car?.year} {repair.car?.make?.name || `Make ${repair.car?.make_id}`} {repair.car?.model?.name || `Model ${repair.car?.model_id}`}
            </Text>
          </View>
          {repair.car?.engine && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Engine:</Text>
              <Text>{repair.car.engine}</Text>
            </View>
          )}
          {repair.car?.color && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Color:</Text>
              <Text>{repair.car.color}</Text>
            </View>
          )}
          {repair.car?.vin && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>VIN:</Text>
              <Text>{repair.car.vin}</Text>
            </View>
          )}
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
        onPress={handleGoBack}
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
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    marginBottom: 16,
    textAlign: 'center',
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