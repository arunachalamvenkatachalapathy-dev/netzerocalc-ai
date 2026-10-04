import React, { lazy, Suspense, useState } from 'react';
import CorporateGhgLedgerView from './ghg/CorporateGhgLedgerView.jsx';
const SpreadsheetWorkbench = lazy(() => import('./SpreadsheetWorkbench.jsx'));
export default function GhgCalculatorView(props) {
  const [spreadsheet, setSpreadsheet] = useState(false);
  if (spreadsheet) return <Suspense fallback={<div className="p-10 text-sm" role="status">Loading optional Excel engine...</div>}><SpreadsheetWorkbench {...props} onCancel={() => setSpreadsheet(false)} /></Suspense>;
  return <div className="space-y-3"><div className="flex gap-2"><button className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-xs font-bold">Interactive Scope 1–3 Ledger</button><button onClick={() => setSpreadsheet(true)} className="rounded-lg border px-3 py-2 text-xs font-bold">Excel Workbench (FortuneSheet)</button></div><CorporateGhgLedgerView {...props} /></div>;
}
