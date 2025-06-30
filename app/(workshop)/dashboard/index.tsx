import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';
import { Workshop, Repair } from '@/types';
import { colors } from '@/theme/colors';
import { formatDate, formatCurrency } from '@/utils/formatters';

export default function WorkshopDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Workshop | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRepairs: 0,
    pendingConfirmations: 0,
    thisMonthRevenue: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Fetch workshop profile
      const { data: workshopData } = await supabase
        .from('workshops')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (workshopData) {
        setProfile(workshopData);

        // Fetch repairs
        const { data: repairsData } = await supabase
          .from('repairs')
          .select('*')
          .eq('workshop_id', workshopData.id)
          .order('repair_date', { ascending: false })
          .limit(10);

        if (repairsData) {
          setRepairs(repairsData);
          
          // Calculate stats
          const pending = repairsData.filter(r => !r.confirmed).length;
          const thisMonth = new Date();
          thisMonth.setDate(1);
          const monthRevenue = repairsData
            .filter(r => new Date(r.repair_date) >= thisMonth && r.confirmed)
            .reduce((sum, r) => sum + r.cost, 0);
          
          setStats({
            totalRepairs: repairsData.length,
            pendingConfirmations: pending,
            thisMonthRevenue: monthRevenue,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
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
        <Text variant="headlineMedium" style={styles.title}>
          Welcome, {profile?.name || 'Workshop'}!
        </Text>
        <Button mode="text" onPress={handleLogout} textColor={colors.danger}>
          Logout
        </Button>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">{stats.totalRepairs}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Repairs</Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.statCard, stats.pendingConfirmations > 0 && styles.warningCard]}>
          <Card.Content>
            <Text variant="titleMedium">{stats.pendingConfirmations}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Pending</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleMedium">{formatCurrency(stats.thisMonthRevenue)}</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>This Month</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Repairs */}
      <Text variant="titleLarge" style={styles.sectionTitle}>Recent Repairs</Text>
      
      <FlatList
        data={repairs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(workshop)/repairs/${item.id}`)}>
            <Card style={styles.repairCard}>
              <Card.Content>
                <View style={styles.repairHeader}>
                  <Text variant="titleMedium">{formatDate(item.repair_date)}</Text>
                  <Text variant="titleMedium">{formatCurrency(item.cost, item.currency)}</Text>
                </View>
                <Text numberOfLines={2} style={styles.description}>
                  {item.description}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.status,
                    item.confirmed ? styles.confirmedStatus : styles.pendingStatus
                  ]}>
                    {item.confirmed ? 'Confirmed' : 'Pending Confirmation'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No repairs yet</Text>
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(workshop)/repairs/new')}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  warningCard: {
    backgroundColor: colors.warning + '20',
  },
  statLabel: {
    color: colors.text.secondary,
    marginTop: 4,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    fontWeight: '600',
  },
  repairCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  description: {
    color: colors.text.secondary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confirmedStatus: {
    backgroundColor: colors.success + '20',
    color: colors.success,
  },
  pendingStatus: {
    backgroundColor: colors.warning + '20',
    color: colors.warning,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.secondary,
    padding: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});