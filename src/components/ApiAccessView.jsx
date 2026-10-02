import React, { useEffect, useState } from 'react';
import { KeyRound, Copy, Trash2, Plug } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/api`;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `nzc_${b64}`;
}

export default function ApiAccessView({ authUser, showToast }) {
  const [tokens, setTokens] = useState([]);
  const [name, setName] = useState('');
  const [fresh, setFresh] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!authUser || !isSupabaseConfigured()) return;
    const { data, error } = await supabase.from('api_tokens').select('id,name,created_at,last_used_at').order('created_at', { ascending: false });
    if (error) showToast?.(`Could not load tokens: ${error.message}`); else setTokens(data);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [authUser]);

  const create = async () => {
    setBusy(true);
    try {
      const token = newToken();
      const { error } = await supabase.from('api_tokens').insert({ name: name.trim() || 'API token', token_hash: await sha256Hex(token) });
      if (error) throw error;
      setFresh(token); setName(''); await load();
    } catch (e) { showToast?.(`Could not create token: ${e.message}`); }
    setBusy(false);
  };

  const revoke = async (id) => {
    const { error } = await supabase.from('api_tokens').delete().eq('id', id);
    if (error) showToast?.(`Could not revoke: ${error.message}`); else { await load(); showToast?.('Token revoked'); }
  };

  const copy = (text) => { navigator.clipboard?.writeText(text); showToast?.('Copied'); };

  const mcpConfig = JSON.stringify({ mcpServers: { netzerocalc: { type: 'http', url: `${API_BASE}/mcp`, headers: { Authorization: 'Bearer YOUR_TOKEN' } } } }, null, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2"><Plug className="w-5 h-5 text-emerald-600" />API &amp; MCP</h2>
        <p className="text-sm text-slate-600 mt-1">Read your projects and search emission factors from scripts or AI assistants. Tokens act as you and only see your own data. Early alpha.</p>
      </div>

      {!authUser ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">Sign in to create a token. Guest projects live only in this browser and are not reachable by the API.</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex gap-2">
            <input aria-label="Token name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Token name (for example: Claude Desktop)" className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <button onClick={create} disabled={busy} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><KeyRound className="w-3.5 h-3.5" />Create token</button>
          </div>
          {fresh && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs">
              <p className="font-bold text-amber-900">Copy this token now. It is shown once and cannot be recovered.</p>
              <div className="mt-2 flex items-center gap-2"><code className="flex-1 break-all rounded bg-white px-2 py-1 font-mono">{fresh}</code>
                <button aria-label="Copy token" onClick={() => copy(fresh)} className="rounded-lg border border-amber-300 p-1.5"><Copy className="w-3.5 h-3.5" /></button></div>
            </div>
          )}
          <ul className="divide-y divide-slate-100 text-sm">
            {tokens.length === 0 && <li className="py-2 text-slate-500">No tokens yet.</li>}
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <span><span className="font-semibold">{t.name}</span> <span className="text-xs text-slate-500">created {new Date(t.created_at).toLocaleDateString()}{t.last_used_at ? `, last used ${new Date(t.last_used_at).toLocaleDateString()}` : ', never used'}</span></span>
                <button aria-label={`Revoke token ${t.name}`} onClick={() => revoke(t.id)} className="rounded-lg border border-slate-200 p-1.5 text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-sm text-slate-700">
        <h3 className="font-bold text-slate-900">MCP server</h3>
        <p>Streamable HTTP endpoint: <code className="font-mono text-xs">{API_BASE}/mcp</code>. Tools: <code>list_projects</code>, <code>get_project_summary</code>, <code>search_emission_factors</code>, <code>add_bom_items</code>. Lines added through the API are marked unapproved and high risk until you review them here.</p>
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-200">{mcpConfig}</pre>
        <h3 className="font-bold text-slate-900">REST</h3>
        <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-200">{`curl -H "Authorization: Bearer YOUR_TOKEN" \\
  "${API_BASE}/factors?q=diesel&region=IN"
curl -H "Authorization: Bearer YOUR_TOKEN" ${API_BASE}/projects
curl -H "Authorization: Bearer YOUR_TOKEN" ${API_BASE}/projects/PROJECT_ID/summary`}</pre>
      </div>
    </div>
  );
}
