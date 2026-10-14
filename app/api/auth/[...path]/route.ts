import { getServerAuth } from "@/lib/auth/server";
const handle =
  (method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") =>
  async (
    request: Request,
    context: { params: Promise<{ path: string[] }> },
  ) => {
    try {
      return await getServerAuth().handler()[method](request, context);
    } catch {
      return Response.json(
        { message: "Sign-in service is not configured or is unavailable." },
        { status: 503 },
      );
    }
  };
export const GET = handle("GET");
export const POST = handle("POST");
export const PUT = handle("PUT");
export const DELETE = handle("DELETE");
export const PATCH = handle("PATCH");
