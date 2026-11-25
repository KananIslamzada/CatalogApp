import Toast from 'react-native-toast-message';

import { type ToastType } from './app-toast';

type ToastOptions = {
  type?: ToastType;
  title: string;
  message?: string;
};

const VISIBLE_MS = 3500;

export function showToast({ type = 'info', title, message }: ToastOptions): void {
  Toast.show({ type, text1: title, text2: message, visibilityTime: VISIBLE_MS });
}
