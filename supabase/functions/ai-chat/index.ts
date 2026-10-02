// NetZeroCalc AI copilot. Requires a signed-in Supabase user (JWT verified by the gateway
// and re-checked here). The model key lives in the GROQ_API_KEY function secret.
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL_OVERRIDE = Deno.env.get("AI_MODEL");
const PREFERRED_MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "llama-3.1-8b-instant", "openai/gpt-oss-20b"];
let cachedModel: string | null = null;

// Groq retires models over time, so pick one that the account can actually use right now.
async function pickModel(apiKey: string): Promise<string> {
  if (MODEL_OVERRIDE) return MODEL_OVERRIDE;
  if (cachedModel) return cachedModel;
  const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`model list failed: ${res.status}`);
  const ids: string[] = ((await res.json()).data ?? []).map((m: { id: string }) => m.id);
  const chosen = PREFERRED_MODELS.find((m) => ids.includes(m))
    ?? ids.find((id) => !/whisper|guard|tts|orpheus|embed|safeguard|prompt/i.test(id));
  if (!chosen) throw new Error("no usable chat model available");
  cachedModel = chosen;
  return chosen;
}
const RATE_LIMIT_PER_MINUTE = 10;
const MAX_QUESTION_CHARS = 4000;
const MAX_HISTORY = 20;
const MAX_CONTEXT_CHARS = 30000;

const SYSTEM_INSTRUCTION = `You are the NetZeroCalc AI copilot, embedded in a BOM-to-LCI carbon footprint tool.
Every carbon number, emission factor or benchmark you state must come from the [Screen & UI Context] provided with the question. If a number is not there, say you do not have it. Do not estimate or recall figures from memory.
Explain what the user sees, point out data quality issues and hotspots, and cite which BOM line or screen card each number comes from.
This is decision support only. A qualified practitioner must review any figure before it is used in a regulated disclosure.`;

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://netzerocalc-ai.vercel.app,http://localhost:5173")
  .split(",").map((s) => s.trim());

function cors(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json(req, { error: "Sign in required" }, 401);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await admin.from("ai_requests").select("id", { count: "exact", head: true })
    .eq("user_id", userData.user.id).gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_PER_MINUTE) {
    return json(req, { error: "Rate limit reached. Wait a minute and try again." }, 429);
  }
  await admin.from("ai_requests").insert({ user_id: userData.user.id });

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) return json(req, { error: "AI copilot is not configured" }, 503);

  let body: { question?: string; history?: { role: string; content: string }[]; screen_context?: unknown };
  try { body = await req.json(); } catch { return json(req, { error: "Invalid JSON" }, 400); }
  const question = String(body.question ?? "").slice(0, MAX_QUESTION_CHARS);
  if (!question.trim()) return json(req, { error: "Question is required" }, 400);

  const history = (body.history ?? []).slice(-MAX_HISTORY).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, MAX_QUESTION_CHARS),
  }));
  const context = body.screen_context
    ? `[Screen & UI Context]\n${JSON.stringify(body.screen_context).slice(0, MAX_CONTEXT_CHARS)}\n\n`
    : "";

  let model: string;
  try { model = await pickModel(apiKey); } catch (err) {
    console.error("Model selection failed", String(err));
    return json(req, { error: "AI request failed" }, 502);
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history,
        { role: "user", content: context + question },
      ],
    }),
  });
  if (!res.ok) {
    console.error("Model API error", res.status, await res.text());
    return json(req, { error: res.status === 429 ? "The AI model is rate limited. Try again shortly." : "AI request failed" }, 502);
  }
  const out = await res.json();
  const answer: string = out?.choices?.[0]?.message?.content ?? "";
  return json(req, { answer: answer || "I could not produce an answer.", sources: [], model_used: model });
});
