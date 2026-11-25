import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { darkPalette, lightPalette, type Palette } from './palette';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: Palette;
};

const lightTheme: Theme = { scheme: 'light', colors: lightPalette };
const darkTheme: Theme = { scheme: 'dark', colors: darkPalette };

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
