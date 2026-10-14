import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthClient } from '../services/authClient';
type User = { id: string; name: string; email: string };
const AccountContext = createContext<{ user: User | null; loading: boolean; refresh: () => Promise<void> }>({ user: null, loading: true, refresh: async () => {} });
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    try { const result = await (await getAuthClient())?.getSession(); setUser(result?.data?.user as User || null); }
    catch { setUser(null); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  return <AccountContext.Provider value={{ user, loading, refresh }}>{children}</AccountContext.Provider>;
}
export const useAccount = () => useContext(AccountContext);
