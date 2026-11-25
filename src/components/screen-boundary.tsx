import { useIsFocused } from 'expo-router';
import { type ReactNode } from 'react';
import { SharedTransitionBoundary } from 'react-native-reanimated';

export default function ScreenBoundary({ children }: { children: ReactNode }) {
  const isFocused = useIsFocused();
  return <SharedTransitionBoundary isActive={isFocused}>{children}</SharedTransitionBoundary>;
}
