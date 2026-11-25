import { useCallback, useState } from 'react';

import { useSessionStore } from '../session-store';

export function useSignOut() {
  const signOut = useSessionStore((state) => state.signOut);
  const [isSigningOut, setSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }, [signOut]);

  return { signOut: handleSignOut, isSigningOut };
}
