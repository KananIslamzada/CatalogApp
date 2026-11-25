import { Search, X } from 'lucide-react-native';
import { memo, useCallback, type ComponentRef, type Ref } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import {
  MAX_FONT_SCALE,
  radius,
  spacing,
  typography,
  useScaledSize,
  useTheme,
  useThemedStyles,
  type Theme,
} from '@/theme';

import GlassSurface from './glass-surface';
import { useFadeToggle } from './use-fade-toggle';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  placeholder?: string;
  busy?: boolean;
  testID?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

function SearchField({
  value,
  onChangeText,
  label,
  placeholder,
  busy,
  testID,
  ref,
}: SearchFieldProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const iconSize = useScaledSize(18);

  const hasText = value.length > 0;
  const showSpinner = !!busy;
  const showClear = hasText && !showSpinner;
  const spinnerStyle = useFadeToggle(showSpinner);
  const clearStyle = useFadeToggle(showClear);

  const clear = useCallback(() => onChangeText(''), [onChangeText]);

  return (
    <GlassSurface style={styles.container}>
      <Search size={iconSize} color={colors.textMuted} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        testID={testID}
      />
      <View style={styles.slot}>
        <Animated.View pointerEvents="none" style={[styles.layer, spinnerStyle]}>
          <ActivityIndicator size="small" color={colors.textMuted} />
        </Animated.View>
        <Animated.View
          pointerEvents={showClear ? 'auto' : 'none'}
          accessibilityElementsHidden={!showClear}
          importantForAccessibility={showClear ? 'auto' : 'no-hide-descendants'}
          style={[styles.layer, clearStyle]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.clearText')}
            hitSlop={spacing.md}
            onPress={clear}
            style={styles.clear}
          >
            <X size={iconSize - 4} color={colors.surface} strokeWidth={3} />
          </Pressable>
        </Animated.View>
      </View>
    </GlassSurface>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    input: {
      flex: 1,
      fontSize: typography.body.fontSize,
      paddingVertical: spacing.sm,
      includeFontPadding: false,
      textAlignVertical: 'center',
      color: colors.textPrimary,
    },
    slot: {
      width: 20,
      height: 20,
    },
    layer: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clear: {
      width: 20,
      height: 20,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.textMuted,
    },
  });

export default memo(SearchField);
