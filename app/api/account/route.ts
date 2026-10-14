import { requestIdentity } from "@/lib/auth/access";
import { createAccountHandlers } from "@/server/accounts/handlers.mjs";
import { PaymentError } from "@/server/payments/nowpayments.mjs";
async function handle(request: Request) {
  const env = {
    ...process.env,
    BILLING_SITE_URL:
      process.env.NODE_ENV === "development"
        ? new URL(request.url).origin
        : process.env.BILLING_SITE_URL,
  };
  return createAccountHandlers({
    env,
    identity: async () => {
      const user = await requestIdentity();
      if (!user) throw new PaymentError("Sign in to continue.", 401);
      return user;
    },
  }).account(request);
}
export const GET = handle;
export const POST = handle;
