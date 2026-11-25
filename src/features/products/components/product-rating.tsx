import { Star } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { spacing, useScaledSize, useTheme } from '@/theme';

import { formatRating } from '../format';

function ProductRating({ rating }: { rating: number }) {
  const { colors } = useTheme();
  const iconSize = useScaledSize(13);

  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants">
      <Star size={iconSize} color={colors.rating} fill={colors.rating} />
      <Text variant="caption" tone="secondary">
        {formatRating(rating)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});

export default memo(ProductRating);
