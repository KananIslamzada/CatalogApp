import { Heart } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { IconButton } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { easeOut, useScaledSize, useTheme } from '@/theme';

type FavouriteButtonProps = {
  isFavourite: boolean;
  onToggle: () => void;
  size?: number;
  iconSize?: number;
  testID?: string;
};

const POP_IN = { duration: 110, easing: easeOut };
const POP_OUT = { duration: 160, easing: easeOut };

function FavouriteButton({
  isFavourite,
  onToggle,
  size = 44,
  iconSize = 22,
  testID,
}: FavouriteButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const scaledIcon = useScaledSize(iconSize);
  const scale = useSharedValue(1);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePress = useCallback(() => {
    if (!isFavourite) scale.set(withSequence(withTiming(1.2, POP_IN), withTiming(1, POP_OUT)));
    onToggle();
  }, [isFavourite, onToggle, scale]);

  return (
    <IconButton
      filled
      size={size}
      accessibilityLabel={t(isFavourite ? 'favourites.remove' : 'favourites.add')}
      accessibilityState={{ selected: isFavourite }}
      onPress={handlePress}
      testID={testID}
      icon={
        <Animated.View style={iconStyle}>
          <Heart
            size={scaledIcon}
            color={isFavourite ? colors.danger : colors.textPrimary}
            fill={isFavourite ? colors.danger : 'transparent'}
          />
        </Animated.View>
      }
    />
  );
}

export default memo(FavouriteButton);
