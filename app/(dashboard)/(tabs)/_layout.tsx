import React from 'react';
import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ title: "Search", tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="watchlist" 
        options={{ title: "Watchlist", tabBarIcon: ({ color }) => <Ionicons name="bookmark" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ title: "Profile", tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}