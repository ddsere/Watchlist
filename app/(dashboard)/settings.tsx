import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/useThemeStore';
import { useTheme } from '../../theme';

export default function Settings() {
  const { themeMode, setThemeMode, loadTheme } = useThemeStore();
  const { colors } = useTheme();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      Alert.alert("Notifications Enabled", "You will now receive weekend watchlist reminders.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        App Settings
      </Text>
      
      <View style={{ backgroundColor: colors.surface, padding: 16, marginBottom: 20, borderRadius: 12, borderColor: colors.border, borderWidth: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="color-palette-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Appearance</Text>
        </View>
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>Select your preferred app theme</Text>
        
        <View style={{ flexDirection: 'row', backgroundColor: colors.background, borderRadius: 8, padding: 4, borderColor: colors.border, borderWidth: 1 }}>
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: 6,
                backgroundColor: themeMode === mode ? colors.primary : 'transparent',
              }}
              onPress={() => setThemeMode(mode)}
            >
              <Text style={{ 
                fontWeight: 'bold', 
                textTransform: 'capitalize',
                color: themeMode === mode ? '#ffffff' : colors.textMuted 
              }}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, borderColor: colors.border, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Weekend Reminders</Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
            Get push notifications on weekends reminding you to watch movies from your watchlist.
          </Text>
        </View>
        <Switch
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
          onValueChange={handleNotificationToggle}
          value={notificationsEnabled}
        />
      </View>
    </View>
  );
}