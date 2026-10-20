import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { getAuthClient } from '../services/authClient';
import { nextAccountSession } from '../services/sessionScope.mjs';
type User = { id: string; name: string; email: string };
const AccountContext = createContext<{ user: User | null; loading: boolean; scope: number; refresh: () => Promise<void> }>({ user: null, loading: true, scope: 0, refresh: async () => {} });
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState({ user: null as User | null, loading: true, scope: 0, hadUser: false });
  const version = useRef(0);
  const commit = useCallback((user: User | null) => {
    setSession(previous => nextAccountSession(previous, user));
  }, []);
  const refresh = useCallback(async () => {
    const request = ++version.current;
    try {
      const result = await (await getAuthClient())?.getSession();
      if (request === version.current) commit(result?.data?.user as User || null);
    } catch { if (request === version.current) commit(null); }
  }, [commit]);
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void getAuthClient().then(client => {
      if (!active) return;
      // Subscribe to the SDK's session store, including its cross-tab notifications.
      const atom = client?.$store?.atoms?.session;
      if (atom) unsubscribe = atom.subscribe(value => {
        if (!active || value.isPending || value.isRefetching) return;
        version.current++;
        commit(value.data?.user as User || null);
      });
      else void refresh();
    }).catch(() => { if (active) commit(null); });
    return () => { active = false; version.current++; unsubscribe?.(); };
  }, [commit, refresh]);
  return <AccountContext.Provider value={{ user: session.user, loading: session.loading, scope: session.scope, refresh }}>{children}</AccountContext.Provider>;
}
export const useAccount = () => useContext(AccountContext);
