import { createHandlers } from '../../server/payments/handlers.mjs';
export function POST(request) { return createHandlers().checkout(request); }

