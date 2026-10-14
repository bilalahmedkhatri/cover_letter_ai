import { billingHandlers } from "@/lib/billing-handlers";
export async function POST(request: Request) {
  return billingHandlers(request).checkout(request);
}
