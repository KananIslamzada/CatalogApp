import { useWindowDimensions } from 'react-native';

const MAX_ICON_SCALE = 1.5;

export function useScaledSize(size: number): number {
  const { fontScale } = useWindowDimensions();
  return Math.round(size * Math.min(Math.max(fontScale, 1), MAX_ICON_SCALE));
}
