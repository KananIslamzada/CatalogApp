import { GlassView } from 'expo-glass-effect';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';

import { useGlassEnabled } from '@/lib/glass';
import { useTheme, useThemedStyles, type Theme } from '@/theme';

type GlassSurfaceProps = {
  children?: ReactNode;
  tintColor?: ColorValue;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
};

function GlassSurface({ children, tintColor, interactive = false, style }: GlassSurfaceProps) {
  const { scheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const glassEnabled = useGlassEnabled();

  if (glassEnabled) {
    return (
      <GlassView
        isInteractive={interactive}
        glassEffectStyle="regular"
        tintColor={tintColor}
        colorScheme={scheme}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.fallback, !!tintColor && { backgroundColor: tintColor }, style]}>
      {children}
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    fallback: {
      overflow: 'hidden',
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
  });

export default memo(GlassSurface);
