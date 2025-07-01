import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { Repair } from '@/types';
import { colors } from '@/theme/colors';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function WorkshopRepairsList() {
  const router = useRouter();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      // Fetch workshop profile first to confirm it's a workshop
      const { data: workshopData } = await supabase
        .from('workshops')
        .select('id')
        .eq('id', userData.user.id)
        .single();

      if (workshopData) {
        // Fetch all repairs for this workshop
        const { data: repairsData, error } = await supabase
          .from('repairs')
          .select('*')
          .eq('workshop_id', workshopData.id)
          .order('repair_date', { ascending: false });

        if (error) {
          console.error('Error fetching repairs:', error);
        } else {
          setRepairs(repairsData || []);
        }
      }
    } catch (error) {
      console.error('Error in fetchRepairs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>All Repairs</Text>
      </View>
      
      {repairs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No repairs found</Text>
        </View>
      ) : (
        <FlatList
          data={repairs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/(workshop)/repairs/${item.id}`)}>
              <Card style={styles.repairCard}>
                <Card.Content>
                  <View style={styles.repairHeader}>
                    <Text variant="titleMedium">{formatDate(item.repair_date)}</Text>
                    <Text variant="titleMedium" style={styles.cost}>
                      {formatCurrency(item.cost, item.currency)}
                    </Text>
                  </View>
                  <Text numberOfLines={2} style={styles.description}>
                    {item.description}
                  </Text>
                  <View style={styles.detailsRow}>
                    <Text style={styles.mileage}>Mileage: {item.mileage.toLocaleString()} km</Text>
                    <View style={[
                      styles.statusBadge,
                      item.confirmed ? styles.confirmedBadge : styles.pendingBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        item.confirmed ? styles.confirmedText : styles.pendingText
                      ]}>
                        {item.confirmed ? 'Confirmed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <Button 
        mode="contained" 
        onPress={() => router.back()} 
        style={styles.backButton}
      >
        Back to Dashboard
      </Button>
    </View>
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
  },
  header: {
    padding: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  repairCard: {
    marginBottom: 12,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cost: {
    color: colors.primary,
    fontWeight: '600',
  },
  description: {
    color: colors.text.secondary,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mileage: {
    color: colors.text.secondary,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confirmedBadge: {
    backgroundColor: colors.success + '20',
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  confirmedText: {
    color: colors.success,
  },
  pendingText: {
    color: colors.warning,
  },
  backButton: {
    margin: 16,
    backgroundColor: colors.primary,
  },
});