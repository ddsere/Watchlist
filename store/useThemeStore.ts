import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'dark', 

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    try {
      await AsyncStorage.setItem('app_theme', mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        set({ themeMode: savedTheme });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }
}));