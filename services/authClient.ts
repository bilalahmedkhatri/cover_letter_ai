export const authConfigured = true;
// The URL is public configuration. Sessions and credentials are managed by Neon.
async function createManagedClient() {
  const {createAuthClient}=await import('@neondatabase/auth/next');
  return createAuthClient();
}
type AuthClient = Awaited<ReturnType<typeof createManagedClient>>;
let clientPromise: Promise<AuthClient> | undefined;
export function getAuthClient(): Promise<AuthClient | null> {
  if (!authConfigured) return Promise.resolve(null);
  clientPromise ||= createManagedClient();
  return clientPromise;
}
export async function accessToken() {
  const authClient = await getAuthClient();
  if (!authClient) throw new Error('Account service is not configured yet.');
  try { const result=await authClient.token(); if(result.error || !result.data?.token)throw new Error('Please sign in again.'); return result.data.token; }
  catch (error) {
    if (error instanceof TypeError) throw new Error('Cannot connect to the sign-in service. Check your connection and reload your account.');
    throw error;
  }
}
export async function accountRequest(body?: object) {
  let response: Response;
  try { response = await fetch('/api/account', { method: body ? 'POST' : 'GET', credentials:'same-origin', cache: 'no-store', headers: { ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }); }
  catch { throw new Error(process.env.NODE_ENV==='development' ? 'Cannot connect to the account API. Make sure npm run dev is running.' : 'Cannot connect to your account. Check your connection and try again.'); }
  if (response.status === 404) throw new Error('The account service is unavailable. Please try again later.');
  const result = await response.json().catch(() => { throw new Error('The account API returned an invalid response. Please try again.'); });
  if (!response.ok) throw new Error(result.error || 'Unable to load your account.');
  return result;
}
