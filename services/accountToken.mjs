// Neon injects the signed API JWT into the managed session. Read that first:
// a logged-in browser should not depend on a second /token network request.
export function usableJwt(value, now = Date.now()) {
  if (typeof value !== 'string' || value.split('.').length !== 3) return false;
  try {
    const part = value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part));
    return typeof payload.exp === 'number' && payload.exp * 1000 > now + 5000;
  } catch { return false; }
}

export async function accountToken(client) {
  const session = await client.getSession();
  if (session.error) throw new Error('Please sign in again.');
  if (usableJwt(session.data?.session?.token)) return session.data.session.token;
  // Compatibility with SDK/service versions that return the JWT separately.
  const result = await client.token();
  if (result.error) throw new Error('Please sign in again.');
  const token = result.data?.token || result.data?.session?.token;
  if (!usableJwt(token)) throw new Error('Please sign in again.');
  return token;
}
