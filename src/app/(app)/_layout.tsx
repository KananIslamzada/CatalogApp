import { Stack } from 'expo-router';
import { type ReactNode } from 'react';

import ScreenBoundary from '@/components/screen-boundary';
import { usePendingLinkNavigation } from '@/features/deep-links';
import { useTheme } from '@/theme';

function screenLayout({ children }: { children: ReactNode }) {
  return <ScreenBoundary>{children}</ScreenBoundary>;
}

export default function AppLayout() {
  const { colors } = useTheme();
  usePendingLinkNavigation();

  return (
    <Stack
      screenLayout={screenLayout}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
