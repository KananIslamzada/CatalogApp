import { memo, useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import { radius, spacing } from '@/theme';

import { GRID_COLUMNS, GRID_GAP, GRID_PADDING } from './layout';
import SkeletonBlock from './skeleton-block';

const ROWS = 3;
const INFO_HEIGHT = 84;
const LINE_RADIUS = radius.sm / 2;
const SHIMMER = { duration: 1300, easing: Easing.inOut(Easing.quad) };

function ProductListSkeleton() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withRepeat(withTiming(1, SHIMMER), -1));
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const contentWidth = width - GRID_PADDING * 2;
  const cardWidth = (contentWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const cardHeight = cardWidth + INFO_HEIGHT;
  const height = ROWS * (cardHeight + GRID_GAP);

  const blocks = Array.from({ length: ROWS * GRID_COLUMNS }, (_, index) => {
    const x = (index % GRID_COLUMNS) * (cardWidth + GRID_GAP);
    const y = Math.floor(index / GRID_COLUMNS) * (cardHeight + GRID_GAP);
    const lineX = x + spacing.md;
    const lineY = y + cardWidth + spacing.md;
    return [
      { key: `${index}-image`, x, y, width: cardWidth, height: cardWidth, radius: radius.lg },
      { key: `${index}-title`, x: lineX, y: lineY, width: cardWidth * 0.8, height: 12 },
      { key: `${index}-brand`, x: lineX, y: lineY + 20, width: cardWidth * 0.5, height: 10 },
      { key: `${index}-price`, x: lineX, y: lineY + 42, width: cardWidth * 0.35, height: 14 },
    ];
  }).flat();

  return (
    <View
      style={{ width: contentWidth, height }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('catalog.loading')}
    >
      {blocks.map(({ key, radius: blockRadius = LINE_RADIUS, ...block }) => (
        <SkeletonBlock
          key={key}
          {...block}
          radius={blockRadius}
          sweepWidth={contentWidth}
          progress={progress}
        />
      ))}
    </View>
  );
}

export default memo(ProductListSkeleton);
