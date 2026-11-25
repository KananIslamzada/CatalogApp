import { LogOut } from 'lucide-react-native';
import { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, ScrollEdgeBackdrop, SearchField, Text } from '@/components/ui';
import { useConfirmSignOut } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize, useTheme } from '@/theme';

import { GRID_PADDING, TOP_BAR_HEIGHT } from './layout';

const BACKDROP_FADE = 24;

type AnimatedViewStyle = StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;

type CatalogTopBarProps = {
  query: string;
  onQueryChange: (text: string) => void;
  searchBusy: boolean;
  searchHeight: number;
  onSearchLayout: (event: LayoutChangeEvent) => void;
  inlineTitleStyle: AnimatedViewStyle;
  searchStyle: AnimatedViewStyle;
  backdropStyle: AnimatedViewStyle;
};

function CatalogTopBar({
  query,
  onQueryChange,
  searchBusy,
  searchHeight,
  onSearchLayout,
  inlineTitleStyle,
  searchStyle,
  backdropStyle,
}: CatalogTopBarProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();
  const iconSize = useScaledSize(20);
  const { confirmSignOut, isSigningOut } = useConfirmSignOut();
  const coveredHeight = top + TOP_BAR_HEIGHT + searchHeight;
  const backdropHeight = coveredHeight + BACKDROP_FADE;

  return (
    <View pointerEvents="box-none" style={[styles.container, { paddingTop: top }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.backdrop, { height: backdropHeight }, backdropStyle]}
      >
        <ScrollEdgeBackdrop solidUntil={coveredHeight / backdropHeight} />
      </Animated.View>
      <View style={styles.bar}>
        <Animated.View
          pointerEvents="none"
          style={[styles.inlineTitle, inlineTitleStyle]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
        >
          <Text variant="bodyStrong" numberOfLines={1}>
            {t('catalog.title')}
          </Text>
        </Animated.View>
        <IconButton
          filled
          accessibilityLabel={t('auth.signOut')}
          disabled={isSigningOut}
          onPress={confirmSignOut}
          icon={
            isSigningOut ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <LogOut size={iconSize} color={colors.textPrimary} />
            )
          }
          testID="sign-out"
        />
      </View>
      <Animated.View onLayout={onSearchLayout} style={[styles.search, searchStyle]}>
        <SearchField
          value={query}
          onChangeText={onQueryChange}
          label={t('search.label')}
          placeholder={t('search.placeholder')}
          busy={searchBusy}
          testID="catalog-search"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
    justifyContent: 'flex-end',
    paddingHorizontal: GRID_PADDING,
  },
  inlineTitle: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 72,
  },
  search: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: spacing.md,
  },
});

export default memo(CatalogTopBar);
