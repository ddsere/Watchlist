import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { lightTheme, darkTheme } from '../constants/theme';

export const useTheme = () => {
  const systemColorScheme = useColorScheme(); 
  
  const themeMode = useThemeStore((state) => state.themeMode);

  const isDark = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDark ? darkTheme : lightTheme;

  return { colors, isDark, themeMode };
};