import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface BreadcrumbPath {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  paths: BreadcrumbPath[];
}

export function Breadcrumbs({ paths }: BreadcrumbsProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {paths.map((item, index) => (
        <View key={item.path} style={styles.item}>
          <TouchableOpacity 
            onPress={() => router.push(item.path as any)}
            disabled={index === paths.length - 1}
          >
            <Text style={[
              styles.text,
              index === paths.length - 1 && styles.activeText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
          
          {index < paths.length - 1 && (
            <MaterialIcons 
              name="chevron-right" 
              size={20} 
              color={colors.text.secondary} 
              style={styles.separator}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: colors.primary,
    fontSize: 14,
  },
  activeText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 4,
  },
});