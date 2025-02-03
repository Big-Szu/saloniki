import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface BreadcrumbProps {
  paths: { name: string; path: string }[];
}

export default function Breadcrumbs({ paths }: BreadcrumbProps) {
  const router = useRouter();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
      {paths.map((item, index) => (
        <View key={item.path} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push(item.path as any)}>
            <Text style={{ color: '#2563EB', fontSize: 16 }}>{item.name}</Text>
          </TouchableOpacity>
          {index < paths.length - 1 && (
            <Text style={{ marginHorizontal: 4, color: '#6B7280', fontSize: 16 }}>{'>'}</Text>
          )}
        </View>
      ))}
    </View>
  );
}
