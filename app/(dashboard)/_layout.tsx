import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme';

function CustomDrawerContent(props: any) {
  const { user, role, logout } = useAuthStore();
  const { colors } = useTheme();

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
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8 }}>
        {user?.photoURL ? (
          <Image 
            source={{ uri: user.photoURL }} 
            style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 12, borderWidth: 2, borderColor: colors.border }}
          />
        ) : (
          <View style={{ width: 64, height: 64, backgroundColor: colors.primary, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: 'bold' }}>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </Text>
          </View>
        )}
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 18 }}>
          Hello, {user?.displayName || 'User'}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>
          {user?.email || 'No email provided'}
        </Text>
      </View>

      <DrawerItem label="Home" labelStyle={{ color: colors.text, fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)' as any)} />
      <DrawerItem label="Search" labelStyle={{ color: colors.text, fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)/search' as any)} />
      <DrawerItem label="Watchlist" labelStyle={{ color: colors.text, fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)/watchlist' as any)} />
      <DrawerItem label="Profile" labelStyle={{ color: colors.text, fontSize: 16 }} onPress={() => router.push('/(dashboard)/(tabs)/profile' as any)} />

      {role === 'admin' && (
        <DrawerItem label="Admin Panel" labelStyle={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }} onPress={() => router.push('/(dashboard)/admin' as any)} />
      )}
      <DrawerItem label="Settings" labelStyle={{ color: colors.text, fontSize: 16 }} onPress={() => router.push('/(dashboard)/settings' as any)} />
      
      <View style={{ flex: 1 }} />
      <TouchableOpacity 
        style={{ margin: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center' }} 
        onPress={handleLogout}
      >
        <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function DashboardLayout() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerStyle: { backgroundColor: colors.background, borderBottomWidth: 0, shadowOpacity: 0 },
          headerTintColor: colors.text,
          drawerStyle: { backgroundColor: colors.surface },
        }}
      >
        <Drawer.Screen name="(tabs)" options={{ title: 'Watchlist', headerShown: false }} />
        <Drawer.Screen name="admin" options={{ title: 'Admin Panel', headerShown: true }} />
        <Drawer.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
        <Drawer.Screen name="movie/[id]" options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}