import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { MAX_FONT_SCALE, typography, useTheme, type Palette, type TextVariant } from '@/theme';

type TextTone = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'inverse';

const toneColor: Record<TextTone, keyof Palette> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  muted: 'textMuted',
  accent: 'accent',
  danger: 'danger',
  inverse: 'textInverse',
};

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
};

function Text({
  variant = 'body',
  tone = 'primary',
  align,
  style,
  maxFontSizeMultiplier = MAX_FONT_SCALE,
  ...rest
}: TextProps) {
  const { colors } = useTheme();

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        typography[variant],
        { color: colors[toneColor[tone]] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

export default memo(Text);
