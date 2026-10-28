import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { BlogUnavailableError, type BlogExecutor } from '../core/types';

let client: NeonQueryFunction<false, false> | undefined;

function database() {
  if (client) return client;
  const value = process.env.BLOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!value?.trim()) throw new BlogUnavailableError('BLOG_DATABASE_URL_MISSING');
  try {
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname) throw new Error();
    // Keep the installed Neon HTTP driver. No persistent connection or named
    // prepared statements are shared across pooler sessions (including -pooler).
    client = neon(value, { fetchOptions: { cache: 'no-store' } });
    return client;
  } catch { throw new BlogUnavailableError('BLOG_DATABASE_URL_INVALID'); }
}

export const blogDatabase: BlogExecutor = {
  async query<T>(statement: string, values: unknown[] = []): Promise<T[]> {
    try {
      const sql = database();
      const results = await sql.transaction([
        sql.query("SELECT set_config('statement_timeout', '8000', true), set_config('lock_timeout', '2000', true)"),
        sql.query(statement, values),
      ], {
        readOnly: true,
        fetchOptions: { cache: 'no-store', signal: AbortSignal.timeout(12000) },
      });
      return results[1] as T[];
    } catch (error) {
      if (error instanceof BlogUnavailableError) throw error;
      // Do not attach raw causes/messages: driver errors can contain SQL/URLs.
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      throw new BlogUnavailableError(typeof code === 'string' && /^[A-Z0-9_]{2,40}$/.test(code) ? code : undefined);
    }
  },
};
