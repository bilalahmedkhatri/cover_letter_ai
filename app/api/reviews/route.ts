import { createAccountHandlers } from "@/server/accounts/handlers.mjs";
export const GET = async () => createAccountHandlers().reviews();
