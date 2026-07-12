import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';

// 1. Custom Drawer Content Component එක සෑදීම
function CustomDrawerContent(props: any) {
  const { user, role, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase එකෙන් ලොග් අවුට් වීම
      logout(); // Zustand Store එක හිස් කිරීම
      router.replace('/(auth)/login'); // නැවත Login පිටුවට යැවීම
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#1e293b' }}>
      
      {/* Drawer Header: User Avatar & Details */}
      <View className="p-5 border-b border-slate-700 mb-2">
        {/* Profile Picture එක ඇත්නම් එය පෙන්වීම, නැත්නම් මුල් අකුර පෙන්වීම */}
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
        
        {/* Hello, [Name] ආකාරයට පෙන්වීම */}
        <Text className="text-white font-bold text-lg">
          Hello, {user?.displayName || 'User'}
        </Text>
        <Text className="text-slate-400 text-sm">
          {user?.email || 'No email provided'}
        </Text>
      </View>

      {/* Main Menu Items (Tabs වලට Navigation) */}
      <DrawerItem
        label="Home"
        labelStyle={{ color: '#ffffff', fontSize: 16 }}
        onPress={() => router.push('/(dashboard)/(tabs)')}
      />
      <DrawerItem
        label="Search"
        labelStyle={{ color: '#ffffff', fontSize: 16 }}
        onPress={() => router.push('/(dashboard)/(tabs)/search')}
      />
      <DrawerItem
        label="Watchlist"
        labelStyle={{ color: '#ffffff', fontSize: 16 }}
        onPress={() => router.push('/(dashboard)/(tabs)/watchlist')}
      />
      <DrawerItem
        label="Profile"
        labelStyle={{ color: '#ffffff', fontSize: 16 }}
        onPress={() => router.push('/(dashboard)/(tabs)/profile')}
      />

      {/* Admin Panel (Conditional Rendering) */}
      {role === 'admin' && (
        <DrawerItem
          label="Admin Panel"
          labelStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16 }}
          onPress={() => router.push('/(dashboard)/admin')}
        />
      )}

      {/* Settings */}
      <DrawerItem
        label="Settings"
        labelStyle={{ color: '#ffffff', fontSize: 16 }}
        onPress={() => router.push('/(dashboard)/settings')}
      />

      {/* හිස් ඉඩක් (Spacer) තබා Logout එක යටටම තල්ලු කිරීම */}
      <View className="flex-1" />

      {/* Logout Button */}
      <TouchableOpacity 
        className="m-4 bg-slate-800 border border-slate-700 p-4 rounded-xl flex-row justify-center"
        onPress={handleLogout}
      >
        <Text className="text-red-500 font-bold text-base">Logout</Text>
      </TouchableOpacity>
      
    </DrawerContentScrollView>
  );
}

// 2. Main Dashboard Layout එක
export default function DashboardLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerShown: true,
          headerStyle: { backgroundColor: '#0f172a', borderBottomWidth: 0, shadowOpacity: 0 },
          headerTintColor: '#ffffff',
          drawerStyle: { backgroundColor: '#1e293b' },
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: 'Watchlist' }} />
        <Drawer.Screen name="admin" options={{ title: 'Admin Panel' }} />
        <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}