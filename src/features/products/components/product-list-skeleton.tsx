import { Canvas, Group, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import { memo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import { radius, spacing, useTheme } from '@/theme';

import { GRID_COLUMNS, GRID_GAP, GRID_PADDING } from './layout';

const ROWS = 3;
const INFO_HEIGHT = 84;
const SHIMMER = { duration: 1300, easing: Easing.inOut(Easing.quad) };

function ProductListSkeleton() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    progress.set(withRepeat(withTiming(1, SHIMMER), -1));
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const cardHeight = cardWidth + INFO_HEIGHT;
  const height = ROWS * (cardHeight + GRID_GAP);

  const start = useDerivedValue(() => vec(-width + progress.get() * width * 2, 0));
  const end = useDerivedValue(() => vec(progress.get() * width * 2, 0));

  const cards = Array.from({ length: ROWS * GRID_COLUMNS }, (_, index) => ({
    x: GRID_PADDING + (index % GRID_COLUMNS) * (cardWidth + GRID_GAP),
    y: Math.floor(index / GRID_COLUMNS) * (cardHeight + GRID_GAP),
  }));

  return (
    <Canvas
      style={{ width, height }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('catalog.loading')}
    >
      <Group>
        <LinearGradient
          start={start}
          end={end}
          colors={[colors.skeleton, colors.skeletonHighlight, colors.skeleton]}
        />
        {cards.map(({ x, y }) => (
          <Group key={`${x}-${y}`}>
            <RoundedRect x={x} y={y} width={cardWidth} height={cardWidth} r={radius.lg} />
            <RoundedRect
              x={x + spacing.md}
              y={y + cardWidth + spacing.md}
              width={cardWidth * 0.8}
              height={12}
              r={radius.sm / 2}
            />
            <RoundedRect
              x={x + spacing.md}
              y={y + cardWidth + spacing.md + 20}
              width={cardWidth * 0.5}
              height={10}
              r={radius.sm / 2}
            />
            <RoundedRect
              x={x + spacing.md}
              y={y + cardWidth + spacing.md + 42}
              width={cardWidth * 0.35}
              height={14}
              r={radius.sm / 2}
            />
          </Group>
        ))}
      </Group>
    </Canvas>
  );
}

export default memo(ProductListSkeleton);
