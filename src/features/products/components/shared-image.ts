import { SharedTransition } from 'react-native-reanimated';

import { easeOut } from '@/theme';

export const productImageTag = (id: number) => `product-image-${id}`;

export const productImageTransition = SharedTransition.duration(320).easing(easeOut);
