import { Stack } from 'expo-router';

import { usePendingLinkNavigation } from '@/features/deep-links';
import { useTheme } from '@/theme';

export default function AppLayout() {
  const { colors } = useTheme();
  usePendingLinkNavigation();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
