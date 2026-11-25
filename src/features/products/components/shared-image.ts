import { Image } from 'expo-image';
import Animated, {
  SharedTransition,
  SharedTransitionType,
  type SharedTransitionAnimationsValues,
} from 'react-native-reanimated';

import { easeOut } from '@/theme';

export const AnimatedImage = Animated.createAnimatedComponent(Image);

export type ProductSource = 'catalog' | 'favourites';

export function parseProductSource(value: unknown): ProductSource | null {
  return value === 'catalog' || value === 'favourites' ? value : null;
}

export const productImageTag = (source: ProductSource, id: number) =>
  `${source}-product-image-${id}`;

function lerp(from: number, to: number, progress: number) {
  'worklet';
  return from + (to - from) * progress;
}

function scaleImage(values: SharedTransitionAnimationsValues, progress: number) {
  'worklet';
  const width = values.currentWidth;
  const height = values.currentHeight;
  const centerX = lerp(
    values.currentOriginX + width / 2,
    values.targetOriginX + values.targetWidth / 2,
    progress,
  );
  const centerY = lerp(
    values.currentOriginY + height / 2,
    values.targetOriginY + values.targetHeight / 2,
    progress,
  );
  const scaleX = width > 0 ? lerp(1, values.targetWidth / width, progress) : 1;
  const scaleY = height > 0 ? lerp(1, values.targetHeight / height, progress) : 1;

  return {
    originX: centerX - width / 2,
    originY: centerY - height / 2,
    width,
    height,
    transform: [{ matrix: [scaleX, 0, 0, 0, 0, scaleY, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }],
  };
}

export const productImageTransition = SharedTransition.duration(320)
  .easing(easeOut)
  .progressAnimation(scaleImage)
  .defaultTransitionType(SharedTransitionType.PROGRESS_ANIMATION);
