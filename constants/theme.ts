/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const lightTheme = {
  background: '#f8fafc', // slate-50
  surface: '#ffffff',    // white
  text: '#0f172a',       // slate-900
  textSecondary: '#64748b', // slate-500
  primary: '#ef4444',    // red-500 (Watchlist App Brand Color)
  border: '#e2e8f0',     // slate-200
};

export const darkTheme = {
  background: '#0f172a', // slate-900
  surface: '#1e293b',    // slate-800
  text: '#f8fafc',       // slate-50
  textSecondary: '#94a3b8', // slate-400
  primary: '#ef4444',    // red-500
  border: '#334155',     // slate-700
};

export type ThemeColors = typeof lightTheme;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
