import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Car } from '@/types';
import { colors } from '@/theme/colors';

interface CarCardProps {
  car: Car & { make?: string; model?: string };
  onPress: () => void;
}

export function CarCard({ car, onPress }: CarCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.title}>
                {car.make} {car.model}
              </Text>
              <Text variant="bodyLarge" style={styles.year}>
                {car.year}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary} />
          </View>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <MaterialIcons name="settings" size={16} color={colors.text.secondary} />
              <Text variant="bodyMedium" style={styles.detailText}>
                {car.engine}
              </Text>
            </View>
            
            {car.vin && (
              <View style={styles.detailItem}>
                <MaterialIcons name="fingerprint" size={16} color={colors.text.secondary} />
                <Text variant="bodySmall" style={styles.detailText}>
                  {car.vin}
                </Text>
              </View>
            )}
            
            {car.color && (
              <View style={styles.detailItem}>
                <MaterialIcons name="palette" size={16} color={colors.text.secondary} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {car.color}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.background.primary,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  year: {
    color: colors.text.secondary,
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: colors.text.secondary,
  },
});