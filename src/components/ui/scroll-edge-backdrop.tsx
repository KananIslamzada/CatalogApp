import NativeMaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, type ComponentType, type ReactElement } from 'react';
import { Platform, StyleSheet, type ViewProps } from 'react-native';

import { useTheme, withAlpha } from '@/theme';

const MaskedView = NativeMaskedView as unknown as ComponentType<
  ViewProps & { maskElement: ReactElement }
>;

const BLUR_INTENSITY = 20;
const TINT_OPACITY = 0.4;

type ScrollEdgeBackdropProps = {
  solidUntil: number;
};

function ScrollEdgeBackdrop({ solidUntil }: ScrollEdgeBackdropProps) {
  const { colors, scheme } = useTheme();
  const locations = [0, solidUntil, 1] as const;

  if (Platform.OS === 'ios') {
    return (
      <MaskedView
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        maskElement={
          <LinearGradient
            colors={['#000000', '#000000', '#00000000']}
            locations={locations}
            style={StyleSheet.absoluteFill}
          />
        }
      >
        <BlurView
          intensity={BLUR_INTENSITY}
          tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            withAlpha(colors.background, TINT_OPACITY),
            withAlpha(colors.background, TINT_OPACITY),
            withAlpha(colors.background, 0),
          ]}
          locations={locations}
          style={StyleSheet.absoluteFill}
        />
      </MaskedView>
    );
  }

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[
        withAlpha(colors.background, 0.97),
        withAlpha(colors.background, 0.92),
        withAlpha(colors.background, 0),
      ]}
      locations={locations}
      style={StyleSheet.absoluteFill}
    />
  );
}

export default memo(ScrollEdgeBackdrop);
