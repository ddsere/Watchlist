import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useAuthStore } from "../store/useAuthStore";
import { View, ActivityIndicator } from "react-native";
import "../global.css";

export default function RootLayout() {
  const { user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (rootNavigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [rootNavigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timeout = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login' as any);
      } else if (user && inAuthGroup) {
        router.replace('/(dashboard)/(tabs)' as any);
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [user, segments, isNavigationReady]);

  if (!isNavigationReady) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(dashboard)" />
    </Stack>
  );
}