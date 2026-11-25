import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

function detectGlass(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
}

export const canUseGlass = detectGlass();

let reduceTransparency = false;
const listeners = new Set<() => void>();

function setReduceTransparency(enabled: boolean) {
  reduceTransparency = enabled;
  listeners.forEach((listener) => listener());
}

if (canUseGlass) {
  AccessibilityInfo.isReduceTransparencyEnabled()
    .then(setReduceTransparency)
    .catch(() => undefined);
  AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isGlassEnabled() {
  return canUseGlass && !reduceTransparency;
}

export function useGlassEnabled(): boolean {
  return useSyncExternalStore(subscribe, isGlassEnabled);
}
