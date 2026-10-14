import { createHandlers } from "@/server/payments/handlers.mjs";
export async function POST(request: Request) {
  return createHandlers().ipn(request);
}
