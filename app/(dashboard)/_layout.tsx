import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';

function CustomDrawerContent(props: any) {
  const { user, role, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      logout(); 
      router.replace('/(auth)/login' as any); 
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#1e293b' }}>
      <View className="p-5 border-b border-slate-700 mb-2">
        {user?.photoURL ? (
          <Image 
            source={{ uri: user.photoURL }} 
            className="w-16 h-16 rounded-full mb-3 border-2 border-slate-600"
          />
        ) : (
          <View className="w-16 h-16 bg-red-500 rounded-full justify-center items-center mb-3">
            <Text className="text-white text-2xl font-bold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </Text>
          </View>
        )}
        <Text className="text-white font-bold text-lg">
          Hello, {user?.displayName || 'User'}
        </Text>
        <Text className="text-slate-400 text-sm">
          {user?.email || 'No email provided'}
        </Text>
      </View>

      <DrawerItem label="Home" labelStyle={{ color: '#ffffff', fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)' as any)} />
      <DrawerItem label="Search" labelStyle={{ color: '#ffffff', fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)/search' as any)} />
      <DrawerItem label="Watchlist" labelStyle={{ color: '#ffffff', fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)/watchlist' as any)} />
      <DrawerItem label="Profile" labelStyle={{ color: '#ffffff', fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)/profile' as any)} />

      {role === 'admin' && (
        <DrawerItem label="Admin Panel" labelStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }} onPress={() => router.push('/(dashboard)/admin' as any)} />
      )}
      <DrawerItem label="Settings" labelStyle={{ color: '#ffffff', fontSize: 16 }} onPress={() => router.push('/(dashboard)/settings' as any)} />
      
      <View className="flex-1" />
      <TouchableOpacity className="m-4 bg-slate-800 border border-slate-700 p-4 rounded-xl flex-row justify-center" onPress={handleLogout}>
        <Text className="text-red-500 font-bold text-base">Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function DashboardLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerStyle: { backgroundColor: '#0f172a', borderBottomWidth: 0, shadowOpacity: 0 },
          headerTintColor: '#ffffff',
          drawerStyle: { backgroundColor: '#1e293b' },
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: 'Watchlist', headerShown: false }} />
        <Drawer.Screen name="admin" options={{ title: 'Admin Panel', headerShown: true }} />
        <Drawer.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
        
        <Drawer.Screen 
          name="movie/[id]" 
          options={{ 
            headerShown: false,
            drawerItemStyle: { display: 'none' } 
          }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}