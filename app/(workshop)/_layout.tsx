import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function WorkshopLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
          href: '/dashboard',
        }}
      />
      <Tabs.Screen
        name="repairs/index"
        options={{
          title: 'Repairs',
          tabBarIcon: ({ color }) => <MaterialIcons name="build" size={24} color={color} />,
          href: '/repairs',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="store" size={24} color={color} />,
          href: '/profile',
        }}
      />
      <Tabs.Screen
        name="analytics/index"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <MaterialIcons name="analytics" size={24} color={color} />,
          href: '/analytics',
        }}
      />
      {/* Hide the dynamic routes from the tab bar */}
      <Tabs.Screen
        name="repairs/[id]"
        options={{
          href: null, // This hides it from the tab bar
        }}
      />
      <Tabs.Screen
        name="repairs/pending"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/edit"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}