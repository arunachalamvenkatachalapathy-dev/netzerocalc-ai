import React, { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { loadInventoryHistory } from '../lib/projectsRepo.js';
import { displayHistoryValue } from '../services/history/inventoryHistory.js';

export default function InventoryHistoryView({ project, signedIn }) {
  const [rows, setRows] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [more, setMore] = useState(false);
  const [filter, setFilter] = useState('');
  const load = async (older = false) => {
    setBusy(true); setError('');
    try {
      const result = signedIn ? await loadInventoryHistory(project.id, older ? rows.at(-1)?.id : null) : (project.itemHistory || []);
      setRows(prev => older ? [...prev, ...result] : result); setMore(signedIn && result.length === 100);
    } catch (e) { setError(`History could not load: ${e.message}`); }
    finally { setBusy(false); }
  };
  useEffect(() => { setRows([]); setFilter(''); load(); }, [project.id, signedIn]);
  const visible = rows.filter(r => `${r.item_name} ${r.item_id} ${r.action} ${r.actor_label}`.toLowerCase().includes(filter.toLowerCase()));
  return <section className="max-w-5xl mx-auto p-4 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black flex items-center gap-2"><History className="w-5 h-5 text-emerald-600" />Inventory history</h2><p className="text-sm text-slate-600 mt-1">{project.projectName} - item additions, edits and deletions.</p></div><button disabled={busy} onClick={() => load()} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50"><RefreshCw className="w-4 h-4" />Refresh history</button></div>
    <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600">Tracking starts with the history release. Earlier item versions are not reconstructed. {signedIn ? 'Cloud history is recorded by the database and cannot be edited through the app. API entries identify the owner account, not the person holding a token. Deleted project history stays in the database, but this view requires an existing project.' : 'Guest history is saved in this browser only and can be lost if browser storage is cleared.'} This is an application change record, not third-party assurance.</p>
    <input aria-label="Filter inventory history" placeholder="Filter by item, action or account" value={filter} onChange={e => setFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" />
    {error && <p role="alert" className="rounded-xl bg-rose-50 text-rose-800 p-3 text-sm">{error}</p>}
    {busy && <p role="status" className="text-sm text-slate-500">Loading history...</p>}
    {!busy && !error && !visible.length && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">{filter ? 'No matching changes in the loaded history.' : 'No inventory changes recorded yet. Add or edit an item, let cloud save finish, then refresh history.'}</p>}
    <ol className="space-y-4">{visible.map(row => <li key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><span className={`inline-block rounded px-2 py-1 text-xs font-bold ${row.action === 'deleted' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{row.action}</span><h3 className="font-bold mt-2">{row.item_name}</h3><p className="text-xs text-slate-500">FY{row.period_year} · Item {row.item_id}</p></div><div className="text-xs text-slate-600"><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time><p className="mt-1 break-all">{row.actor_label}</p><p className="mt-1">Source: {row.source}</p></div></div>
      <div className="overflow-x-auto mt-4"><table className="w-full text-xs text-left"><caption className="sr-only">Changed fields for {row.item_name}</caption><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-2">Field</th><th className="p-2">Before</th><th className="p-2">After</th></tr></thead><tbody>{(row.changed_fields || []).map(field => <tr key={field} className="border-b border-slate-100"><th scope="row" className="p-2 font-semibold align-top">{field}</th><td className="p-2 align-top max-w-xs break-words">{displayHistoryValue(row.before_item?.[field])}</td><td className="p-2 align-top max-w-xs break-words">{displayHistoryValue(row.after_item?.[field])}</td></tr>)}</tbody></table></div>
    </li>)}</ol>
    {more && <button disabled={busy} onClick={() => load(true)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm">Load older changes</button>}
  </section>;
}
