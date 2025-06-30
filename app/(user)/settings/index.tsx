import React from 'react';
import { View, ScrollView } from 'react-native';
import { List, Switch, Divider } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Push Notifications"
          right={() => <Switch value={true} />}
        />
        <Divider />
        <List.Item
          title="Dark Mode"
          right={() => <Switch value={false} />}
        />
      </List.Section>
    </ScrollView>
  );
}