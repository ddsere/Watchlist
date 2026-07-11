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