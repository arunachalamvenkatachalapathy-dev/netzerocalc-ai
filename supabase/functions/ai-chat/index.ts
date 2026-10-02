// NetZeroCalc AI copilot. Requires a signed-in Supabase user (JWT verified by the gateway
// and re-checked here). The model key lives in the GEMINI_API_KEY function secret.
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
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

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json(req, { error: "AI copilot is not configured" }, 503);

  let body: { question?: string; history?: { role: string; content: string }[]; screen_context?: unknown };
  try { body = await req.json(); } catch { return json(req, { error: "Invalid JSON" }, 400); }
  const question = String(body.question ?? "").slice(0, MAX_QUESTION_CHARS);
  if (!question.trim()) return json(req, { error: "Question is required" }, 400);

  const history = (body.history ?? []).slice(-MAX_HISTORY).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content ?? "").slice(0, MAX_QUESTION_CHARS) }],
  }));
  const context = body.screen_context
    ? `[Screen & UI Context]\n${JSON.stringify(body.screen_context).slice(0, MAX_CONTEXT_CHARS)}\n\n`
    : "";

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [...history, { role: "user", parts: [{ text: context + question }] }],
    }),
  });
  if (!res.ok) {
    console.error("Gemini error", res.status, await res.text());
    return json(req, { error: res.status === 429 ? "The AI model is rate limited. Try again shortly." : "AI request failed" }, 502);
  }
  const out = await res.json();
  const answer = out?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  return json(req, { answer: answer || "I could not produce an answer.", sources: [], model_used: MODEL });
});
