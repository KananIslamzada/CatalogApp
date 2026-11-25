import { CloudOff } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface, Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useIsOffline } from '@/lib/network';
import { easeOut, radius, spacing, useScaledSize, useTheme } from '@/theme';

const entering = FadeInDown.duration(220).easing(easeOut);
const exiting = FadeOutDown.duration(180).easing(easeOut);

function useAnnounceConnection(isOffline: boolean) {
  const { t } = useTranslation();
  const previous = useRef(isOffline);

  useEffect(() => {
    if (previous.current === isOffline) return;
    previous.current = isOffline;
    AccessibilityInfo.announceForAccessibility(
      t(isOffline ? 'network.offlineTitle' : 'network.backOnline'),
    );
  }, [isOffline, t]);
}

export default function OfflineBanner() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const iconSize = useScaledSize(16);
  const isOffline = useIsOffline();
  useAnnounceConnection(isOffline);

  return (
    <View pointerEvents="none" style={[styles.container, { bottom: bottom + spacing.md }]}>
      {isOffline && (
        <Animated.View
          entering={entering}
          exiting={exiting}
          accessibilityLiveRegion="polite"
          testID="offline-banner"
        >
          <GlassSurface style={styles.pill}>
            <CloudOff size={iconSize} color={colors.textPrimary} />
            <View style={styles.copy}>
              <Text variant="label">{t('network.offlineTitle')}</Text>
              <Text variant="caption" tone="secondary">
                {t('network.offlineMessage')}
              </Text>
            </View>
          </GlassSurface>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  copy: {
    flexShrink: 1,
  },
});
