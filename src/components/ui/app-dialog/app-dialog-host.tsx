import { memo, useCallback, useRef } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import { radius, spacing, useTheme, useThemedStyles, type Theme } from '@/theme';

import Button from '../button';
import GlassSurface from '../glass-surface';
import Text from '../text';
import { useDialogStore, type DialogAction } from './dialog-store';
import { useDialogAnimation } from './use-dialog-animation';

function AppDialogHost() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const dialog = useDialogStore((state) => state.current);
  const next = useDialogStore((state) => state.next);
  const pendingAction = useRef<(() => void) | undefined>(undefined);
  const closing = useRef(false);

  const handleHidden = useCallback(() => {
    closing.current = false;
    const action = pendingAction.current;
    pendingAction.current = undefined;
    next();
    action?.();
  }, [next]);

  const { hide, backdropStyle, cardStyle } = useDialogAnimation(dialog, handleHidden);

  const close = useCallback(
    (action?: () => void) => {
      if (closing.current) return;
      closing.current = true;
      pendingAction.current = action;
      hide();
    },
    [hide],
  );

  const handleBackdropPress = useCallback(() => {
    if (dialog?.dismissible !== false) close();
  }, [close, dialog?.dismissible]);

  const actions: DialogAction[] = dialog?.actions?.length
    ? dialog.actions
    : [{ label: t('common.ok') }];

  return (
    <Modal
      transparent
      visible={dialog !== null}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <Animated.View style={[styles.backdrop, { backgroundColor: colors.overlay }, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        />
      </Animated.View>
      <View pointerEvents="box-none" style={styles.stage}>
        <Animated.View accessibilityViewIsModal style={[styles.cardWrapper, cardStyle]}>
          <GlassSurface style={styles.card}>
            <View style={styles.heading}>
              {dialog?.icon}
              <Text
                variant="heading"
                accessibilityRole="header"
                tone={dialog?.tone === 'danger' ? 'danger' : 'primary'}
                style={styles.title}
              >
                {dialog?.title}
              </Text>
            </View>
            {!!dialog?.message && <Text tone="muted">{dialog.message}</Text>}
            <View style={styles.actions}>
              {actions.map((action) => (
                <Button
                  key={action.label}
                  title={action.label}
                  variant={action.variant ?? 'primary'}
                  glass={false}
                  onPress={() => close(action.onPress)}
                  testID={action.testID}
                />
              ))}
            </View>
          </GlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
    },
    stage: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    cardWrapper: {
      width: '100%',
      maxWidth: 340,
    },
    card: {
      borderRadius: radius.xl,
      padding: spacing.xl,
      gap: spacing.md,
      backgroundColor: colors.surface,
    },
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      flexShrink: 1,
    },
    actions: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
  });

export default memo(AppDialogHost);
