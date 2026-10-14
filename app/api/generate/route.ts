import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { requestIdentity } from "@/lib/auth/access";
import { createStore } from "@/server/payments/store.mjs";
import { runMeteredGeneration } from "@/server/ai/metered-generation.mjs";
import { validateGeneration, generationPrompt } from "@/services/workflow.mjs";
import { PaymentError } from "@/server/payments/nowpayments.mjs";
import { body } from "@/server/payments/http.mjs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const user = await requestIdentity();
    if (!user)
      return Response.json(
        { error: "Sign in to generate a draft." },
        { status: 401 },
      );
    const origin =
      process.env.NODE_ENV === "development"
        ? new URL(request.url).origin
        : new URL(process.env.BILLING_SITE_URL || "https://ailettergen.com")
            .origin;
    if (request.headers.get("origin") !== origin)
      return Response.json(
        { error: "Invalid request origin." },
        { status: 403 },
      );
    let input;
    try {
      input = validateGeneration(await body(request, 131072));
    } catch (e) {
      if (e instanceof PaymentError) throw e;
      return Response.json(
        { error: e instanceof Error ? e.message : "Invalid input." },
        { status: 400 },
      );
    }
    if (!process.env.GEMINI_API_KEY)
      return Response.json(
        {
          error:
            "Writing service is not configured yet. Your inputs have not been submitted to an AI provider.",
        },
        { status: 503 },
      );
    const store = createStore();
    const owner = await store.authenticatedOwner(
      user.id,
      createHash("sha256")
        .update("account:" + user.id)
        .digest("hex"),
    );
    const account = await store.getAccount(owner);
    await store.limit("generate:" + owner, 10, 3600);
    const generate = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: generationPrompt(input),
        config: {
          maxOutputTokens: 1800,
          ...(input.url ? { tools: [{ googleSearch: {} }] } : {}),
          httpOptions: { timeout: 45000 },
        },
      });
      const text = result.text?.trim();
      if (!text) throw new Error("Empty provider output.");
      return {
        text,
        usage: {
          inputTokens: result.usageMetadata?.promptTokenCount || 0,
          outputTokens: result.usageMetadata?.candidatesTokenCount || 0,
        },
        sources:
          result.candidates?.[0]?.groundingMetadata?.groundingChunks?.flatMap(
            (c) =>
              c.web?.uri
                ? [{ url: c.web.uri, title: c.web.title || c.web.uri }]
                : [],
          ) || [],
      };
    };
    let output;
    if (account && account.expiresAt > Date.now()) {
      const id = request.headers.get("x-generation-id");
      if (!id || !/^[0-9a-f-]{36}$/i.test(id))
        return Response.json(
          { error: "Invalid generation request." },
          { status: 400 },
        );
      output = await runMeteredGeneration({
        store,
        owner,
        requestId: createHash("sha256")
          .update(owner + ":" + id)
          .digest("hex"),
        operation: "standard",
        generate,
      });
    } else {
      await store.limit(
        "free-generation:" +
          owner +
          ":" +
          new Date().toISOString().slice(0, 10),
        3,
        86400,
      );
      output = await generate();
    }
    return Response.json(output, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof PaymentError
            ? error.message
            : "Unable to generate this draft. Please try again.",
      },
      { status: error instanceof PaymentError ? error.status : 503 },
    );
  }
}
