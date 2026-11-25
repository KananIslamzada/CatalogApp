import { memo } from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { useSessionStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';

type CatalogHeaderProps = {
  searchSpace: number;
  largeTitleStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  onTitleLayout: (event: LayoutChangeEvent) => void;
};

function CatalogHeader({ searchSpace, largeTitleStyle, onTitleLayout }: CatalogHeaderProps) {
  const { t } = useTranslation();
  const firstName = useSessionStore((state) => state.user?.firstName ?? '');

  return (
    <View>
      <Animated.View onLayout={onTitleLayout} style={[styles.titles, largeTitleStyle]}>
        <Text variant="display" accessibilityRole="header" numberOfLines={1}>
          {t('catalog.title')}
        </Text>
        {!!firstName && (
          <Text tone="muted" numberOfLines={1}>
            {t('home.greeting', { name: firstName })}
          </Text>
        )}
      </Animated.View>
      <View style={{ height: searchSpace }} />
    </View>
  );
}

const styles = StyleSheet.create({
  titles: {
    gap: spacing.xxs,
    paddingBottom: spacing.md,
    transformOrigin: 'left',
  },
});

export default memo(CatalogHeader);
