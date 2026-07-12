import React from 'react';
import { View, Text } from 'react-native';

export default function Settings() {
  return (
    <View className="flex-1 bg-slate-900 p-6">
      <Text className="text-white font-bold text-2xl mb-6">Settings</Text>
      
      <View className="bg-slate-800 p-4 rounded-xl mb-4">
        <Text className="text-white text-lg font-bold">Theme</Text>
        <Text className="text-slate-400">Light / Dark / System mode selection will be here.</Text>
      </View>

      <View className="bg-slate-800 p-4 rounded-xl">
        <Text className="text-white text-lg font-bold">Notifications</Text>
        <Text className="text-slate-400">Weekend reminders toggle will be here.</Text>
      </View>
    </View>
  );
}