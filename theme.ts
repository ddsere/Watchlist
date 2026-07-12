import { useColorScheme } from 'react-native';
import { useThemeStore } from './store/useThemeStore';

export const colors = {
  light: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#ef4444',
    border: '#e2e8f0',
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    text: '#ffffff',
    textMuted: '#94a3b8',
    primary: '#ef4444',
    border: '#334155',
  }
};

export const useTheme = () => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const systemColorScheme = useColorScheme(); 

  const activeMode = themeMode === 'system' 
    ? (systemColorScheme || 'dark') 
    : themeMode;

  return {
    mode: activeMode,
    colors: colors[activeMode],
  };
};