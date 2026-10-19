import { NextResponse } from "next/server";
import { respond, botGreeting, CHAT_SYSTEM_PROMPT, type ItrState } from "@/lib/chatbot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Conversational ITR assistant.
 * Stateless: client sends current conversation state + latest user input;
 * server advances the tax interview. If OPENAI_API_KEY is configured and the
 * input is off-script, an LLM crafts a Hinglish reply (guardrails via system prompt).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { state?: ItrState; input?: string };
    const input = (body.input ?? "").slice(0, 500);
    const state = body.state ?? {};

    if (!input) return NextResponse.json(botGreeting());

    let reply = respond(state, input);

    // Optional LLM polish for unrecognised free-text during the interview
    if (process.env.OPENAI_API_KEY && shouldEscalate(reply, input)) {
      const llm = await llmReply(input, state).catch(() => null);
      if (llm) reply = { ...reply, text: llm };
    }

    return NextResponse.json(reply);
  } catch {
    return NextResponse.json(
      {
        text: "Kuch technical dikkat aayi. Ek baar phir try karein — ya seedha Tax Saver calculator use karein.",
        quickReplies: ["Restart"],
        state: { step: "asked_type" },
      },
      { status: 200 }
    );
  }
}

function shouldEscalate(reply: { text: string }, input: string): boolean {
  // escalate only when the machine asked the user to retry (i.e. didn't parse input)
  return /samajh nahi aaya|options mein se choose|select kar/i.test(reply.text) && input.length > 3;
}

async function llmReply(input: string, state: ItrState): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Current interview state: ${JSON.stringify(state)}\nUser said: "${input}"\nGive a short helpful Hinglish reply and gently guide them back to the tax interview question for this step.`,
          },
        ],
        max_tokens: 220,
        temperature: 0.4,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } finally {
    clearTimeout(t);
  }
}
