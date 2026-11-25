import { Easing, FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

export const easeOut = Easing.out(Easing.cubic);

export const layoutTransition = LinearTransition.duration(200).easing(easeOut);

export const fadeIn = FadeIn.duration(180);

export const fadeOut = FadeOut.duration(120);
