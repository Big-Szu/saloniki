import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Breadcrumbs({ path }: { path: string[] }) {
  const router = useRouter();

  return (
    <View className="flex-row items-center mb-4">
      {path.map((segment, index) => {
        const fullPath = '/' + path.slice(0, index + 1).join('/').toLowerCase();

        return (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(fullPath as any)}  // ✅ Explicitly cast as `any`
            className="flex-row items-center"
          >
            <Text className="text-blue-500">{segment}</Text>
            {index < path.length - 1 && <Text className="mx-1">/</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
