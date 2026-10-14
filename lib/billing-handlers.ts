import "server-only";
import { createHandlers } from "@/server/payments/handlers.mjs";
import { paymentConfig, PaymentError } from "@/server/payments/nowpayments.mjs";
import { requestIdentity } from "@/lib/auth/access";
export function billingHandlers(request: Request) {
  const env = {
    ...process.env,
    BILLING_SITE_URL:
      process.env.NODE_ENV === "development"
        ? new URL(request.url).origin
        : process.env.BILLING_SITE_URL,
  };
  return createHandlers({
    config: paymentConfig(env),
    requireIdentity: true,
    identity: async () => {
      const user = await requestIdentity();
      if (!user)
        throw new PaymentError("Please sign in to manage your plan.", 401);
      return user;
    },
  });
}
