import { createServerFn } from "@tanstack/react-start";
import { SYSTEM_PROMPTS, type ToolKey } from "./prompts";

type Msg = { role: "user" | "assistant"; content: string };
type Input = { tool: ToolKey; messages: Msg[] };

export const runAI = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d || !(d.tool in SYSTEM_PROMPTS)) throw new Error("Invalid tool");
    if (!Array.isArray(d.messages) || d.messages.length === 0) throw new Error("No input");
    const messages = d.messages.slice(-30).map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: String(m.content).slice(0, 20000),
    }));
    return { tool: d.tool, messages };
  })
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM_PROMPTS[data.tool],
        input: data.messages,
      });
      let text = "";
      for (const item of (res as any).output ?? []) {
        if (item.type === "message") {
          for (const c of item.content ?? []) if (c.type === "output_text") text += c.text;
        }
      }
      if (!text.trim()) return { ok: false as const, error: "The AI returned an empty response. Please try again." };
      return { ok: true as const, text };
    } catch (e) {
      if (e instanceof GatewayError) {
        const status = (e as any).httpStatus;
        if (status === 429) return { ok: false as const, error: "Too many requests right now. Please wait a moment and try again." };
        if (status === 402) return { ok: false as const, error: "AI credits are exhausted. Please top up your workspace credits." };
      }
      console.error(e);
      return { ok: false as const, error: "Something went wrong generating a response. Please try again." };
    }
  });
