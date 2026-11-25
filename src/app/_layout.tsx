import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

import AppProviders from '@/components/app-providers';
import { AppDialogHost, ToastHost } from '@/components/ui';
import { useSessionBootstrap } from '@/features/auth';
import { useTheme } from '@/theme';
import { useNavigationTheme } from '@/theme/navigation-theme';

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'Looks like you have configured linking in multiple places',
  'Looks like you have multiple navigation containers',
]);

export default function RootLayout() {
  const { colors, scheme } = useTheme();
  const navigationTheme = useNavigationTheme();
  const status = useSessionBootstrap();
  const isSignedIn = status === 'signedIn';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  if (status === 'restoring') return null;

  return (
    <AppProviders>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="login" options={{ animation: 'fade' }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ToastHost />
      <AppDialogHost />
    </AppProviders>
  );
}
