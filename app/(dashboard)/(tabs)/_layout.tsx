import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { backgroundColor: '#1e293b', borderTopWidth: 0 },
      tabBarActiveTintColor: '#ef4444',
      tabBarInactiveTintColor: '#64748b'
    }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}