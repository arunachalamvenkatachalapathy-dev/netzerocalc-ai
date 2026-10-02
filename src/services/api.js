// AI copilot client. Calls the Supabase Edge Function "ai-chat" with the user's session token.
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export async function sendAgentChatMessage(_projectId, question, history = [], screenContext = null) {
  if (!isSupabaseConfigured()) {
    throw new Error('The AI copilot needs an account. Sign in to use it.');
  }
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { question, history, screen_context: screenContext }
  });
  if (error) {
    let detail = error.message;
    try { detail = (await error.context.json()).error || detail; } catch { /* keep default message */ }
    throw new Error(detail);
  }
  return data;
}
