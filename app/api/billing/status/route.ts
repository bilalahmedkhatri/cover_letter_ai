import { billingHandlers } from "@/lib/billing-handlers";
export async function GET(request: Request) {
  return billingHandlers(request).status(request);
}
