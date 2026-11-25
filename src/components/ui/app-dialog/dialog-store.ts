import { type ReactNode } from 'react';
import { create } from 'zustand';

export type DialogTone = 'default' | 'danger';

export type DialogAction = {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
};

export type DialogOptions = {
  title: string;
  message?: string;
  icon?: ReactNode;
  tone?: DialogTone;
  actions?: DialogAction[];
  dismissible?: boolean;
};

type DialogState = {
  current: DialogOptions | null;
  queue: DialogOptions[];
  show: (options: DialogOptions) => void;
  next: () => void;
};

export const useDialogStore = create<DialogState>()((set) => ({
  current: null,
  queue: [],
  show: (options) =>
    set((state) => (state.current ? { queue: [...state.queue, options] } : { current: options })),
  next: () =>
    set((state) => {
      const [upcoming = null, ...rest] = state.queue;
      return { current: upcoming, queue: rest };
    }),
}));

export function showAppDialog(options: DialogOptions): void {
  useDialogStore.getState().show(options);
}
