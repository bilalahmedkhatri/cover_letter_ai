import 'server-only';
import { requestIdentity } from '@/lib/auth/access';
import { createAIHandler } from '@/server/ai/handler.mjs';
export const runtime = 'nodejs';
export const maxDuration = 120;
export const POST = createAIHandler({identity:requestIdentity,research:true});
