import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from 'expo-router';

import { darkPalette, lightPalette, type Palette } from './palette';
import { useTheme } from './use-theme';

function createNavigationTheme(base: NavigationTheme, palette: Palette): NavigationTheme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.accent,
      background: palette.background,
      card: palette.surface,
      text: palette.textPrimary,
      border: palette.border,
      notification: palette.danger,
    },
  };
}

const lightNavigationTheme = createNavigationTheme(DefaultTheme, lightPalette);
const darkNavigationTheme = createNavigationTheme(DarkTheme, darkPalette);

export function useNavigationTheme(): NavigationTheme {
  return useTheme().scheme === 'dark' ? darkNavigationTheme : lightNavigationTheme;
}
