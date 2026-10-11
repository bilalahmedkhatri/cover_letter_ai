import { createHandlers } from '../../server/payments/handlers.mjs';
export function GET(request) { return createHandlers().status(request); }

