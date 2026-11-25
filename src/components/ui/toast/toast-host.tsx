import Toast, { type ToastConfig } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme';

import AppToast from './app-toast';

const toastConfig: ToastConfig = {
  success: (props) => <AppToast {...props} type="success" />,
  info: (props) => <AppToast {...props} type="info" />,
  warning: (props) => <AppToast {...props} type="warning" />,
  error: (props) => <AppToast {...props} type="error" />,
};

export default function ToastHost() {
  const { top } = useSafeAreaInsets();

  return <Toast config={toastConfig} topOffset={top + spacing.sm} onPress={Toast.hide} />;
}
