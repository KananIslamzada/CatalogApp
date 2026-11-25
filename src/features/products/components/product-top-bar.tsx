import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { memo, useCallback, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, ScrollEdgeBackdrop, Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize, useTheme } from '@/theme';

import { TOP_BAR_HEIGHT } from './layout';

const BACKDROP_FADE = 24;
const BUTTON_SIZE = 44;

type AnimatedViewStyle = StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;

type ProductTopBarProps = {
  title?: string;
  backdropStyle?: AnimatedViewStyle;
  titleStyle?: AnimatedViewStyle;
  accessory?: ReactNode;
};

function ProductTopBar({ title, backdropStyle, titleStyle, accessory }: ProductTopBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const iconSize = useScaledSize(24);
  const coveredHeight = top + TOP_BAR_HEIGHT;
  const backdropHeight = coveredHeight + BACKDROP_FADE;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top }]} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, { height: backdropHeight }, backdropStyle]}
      >
        <ScrollEdgeBackdrop solidUntil={coveredHeight / backdropHeight} />
      </Animated.View>
      <View style={styles.bar} pointerEvents="box-none">
        <IconButton
          filled
          size={BUTTON_SIZE}
          accessibilityLabel={t('common.back')}
          onPress={goBack}
          icon={<ChevronLeft size={iconSize} color={colors.textPrimary} />}
          testID="product-back"
        />
        {!!title && (
          <Animated.View
            pointerEvents="none"
            style={[styles.title, titleStyle]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            <Text variant="bodyStrong" numberOfLines={1} align="center">
              {title}
            </Text>
          </Animated.View>
        )}
        {accessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  title: {
    position: 'absolute',
    left: spacing.lg + BUTTON_SIZE + spacing.sm,
    right: spacing.lg + BUTTON_SIZE + spacing.sm,
  },
});

export default memo(ProductTopBar);
