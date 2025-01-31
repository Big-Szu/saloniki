import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase'; // Ensure this file is correctly set up
import Breadcrumbs from '../components/Breadcrumbs'; // Ensure this component exists

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Fetch user data
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser({ name: data.user?.user_metadata.full_name || 'N/A', email: data.user?.email || 'N/A' });
      }
    }
    fetchUser();
  }, []);

  return (
    <View className="flex-1 p-4">
      {/* Breadcrumbs */}
      <Breadcrumbs path={['Dashboard', 'Profile']} />

      {/* User Info */}
      <Text className="text-xl font-bold mb-2">Profile</Text>
      {user ? (
        <View>
          <Text className="text-lg">Name: {user.name}</Text>
          <Text className="text-lg">Email: {user.email}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}

      {/* Edit Profile Button */}
      <Button title="Edit Profile" onPress={() => router.push('/edit-profile')} />
    </View>
  );
}
