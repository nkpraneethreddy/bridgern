import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorPalette, darkColors, lightColors } from './colors';
import { useThemeStore } from '../stores/themeStore';

interface ThemeContextValue {
  colors: ColorPalette;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark =
      preference === 'dark' || (preference === 'system' && systemScheme === 'dark');
    return {
      colors: isDark ? darkColors : lightColors,
      isDark,
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
