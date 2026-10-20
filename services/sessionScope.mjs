// Keep anonymous input during initial sign-in, but never reuse an authenticated
// person's workspace after their identity disappears or changes.
export function nextAccountSession(previous, user) {
  const changed = !previous.loading && previous.hadUser && previous.user?.id !== user?.id;
  return { user, loading: false, hadUser: previous.hadUser || !!user, scope: previous.scope + (changed ? 1 : 0) };
}
