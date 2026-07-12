import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminPanel() {
  const { role } = useAuthStore();

  if (role !== 'admin') {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <Text className="text-red-500 font-bold text-xl">Access Denied</Text>
        <Text className="text-slate-400 mt-2">You do not have admin privileges.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center">
      <Text className="text-red-500 font-bold text-2xl">Admin Panel</Text>
      <Text className="text-slate-400 mt-2">All reviews will be listed here.</Text>
    </View>
  );
}