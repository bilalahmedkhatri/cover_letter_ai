import 'server-only';
import { requestIdentity } from '@/lib/auth/access';
import { createAccountHandlers } from '@/server/accounts/handlers.mjs';
export const runtime = 'nodejs';
const handlers = createAccountHandlers({identity:requestIdentity});
export const GET = handlers.history;
export const POST = handlers.history;
