import { useEffect, useRef, useState } from 'react';

type StableBusyOptions = {
  delayMs?: number;
  minVisibleMs?: number;
};

export function useStableBusy(
  busy: boolean,
  { delayMs = 150, minVisibleMs = 450 }: StableBusyOptions = {},
): boolean {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (busy && !visible) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delayMs);
      return () => clearTimeout(timer);
    }

    if (!busy && visible) {
      const remaining = Math.max(0, minVisibleMs - (Date.now() - shownAt.current));
      const timer = setTimeout(() => setVisible(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [busy, visible, delayMs, minVisibleMs]);

  return visible;
}
