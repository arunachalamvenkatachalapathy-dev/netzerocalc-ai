import React, { useState } from 'react';
import { X, Table, CloudUpload, Info } from 'lucide-react';

export default function GoogleSheetsModal({ isOpen, onClose, currentBOM, activeProject, showToast }) {
  const [webAppUrl, setWebAppUrl] = useState(() => localStorage.getItem("netzerocalc_google_webapp_url") || "");

  if (!isOpen) return null;

  const handleSync = async () => {
    if (webAppUrl.trim()) {
      localStorage.setItem("netzerocalc_google_webapp_url", webAppUrl.trim());
      showToast("Syncing project data to Google Sheet...");
      try {
        const totalFootprint = currentBOM.reduce((acc, i) => acc + (i.qty * i.ef / 1000), 0);
        const payload = {
          action: 'save_project',
          projectName: activeProject?.projectName || 'Scope 1-3 Carbon Inventory',
          companyName: activeProject?.companyName || 'Corporate Entity',
          standard: activeProject?.standard || 'ISO 14064-1',
          totalFootprint: totalFootprint.toFixed(4),
          bom: currentBOM
        };
        await fetch(webAppUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        showToast("✅ Successfully synced project to Google Sheet & Drive!");
        onClose();
        return;
      } catch (e) {
        console.error("Google Sheets POST error", e);
      }
    }

    // Fallback automated CSV download for Google Sheets
    if (currentBOM.length === 0) {
      showToast("No items in inventory to sync.");
      return;
    }

    let csv = "Project Name,Company,Accounting Standard,Total Footprint (tCO2e)\n";
    const totalFt = currentBOM.reduce((acc, i) => acc + (i.qty * i.ef / 1000), 0).toFixed(4);
    csv += `"${activeProject?.projectName || 'Scope 1-3 Carbon Inventory'}","${activeProject?.companyName || 'Corporate Entity'}","${activeProject?.standard || 'ISO 14064-1'}",${totalFt}\n\n`;
    csv += "Item Description,Quantity,Unit,LCI Matched Process,Emission Factor (kgCO2e/unit),Footprint (tCO2e),Scope Category,Audit Risk,Status\n";

    currentBOM.forEach(item => {
      let tco2e = ((item.qty * item.ef) / 1000).toFixed(3);
      csv += `"${item.name.replace(/"/g, '""')}",${item.qty},"${item.unit}","${item.process.replace(/"/g, '""')}",${item.ef},${tco2e},"${item.scope}","${item.risk}","${item.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NetZeroCalc_Google_Sheets_Sync_${Date.now()}.csv`;
    link.click();
    showToast("✅ Generated Google Sheets CSV file! Open in Google Drive.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 space-y-4">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-green-700" />
            <h2 className="text-base font-extrabold text-slate-900">Sync to Google Sheets & Drive</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-green-900 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1">
            <Info className="w-4 h-4" /> Serverless Google Sheet Integration
          </div>
          <p className="text-[11px] leading-relaxed">
            Paste your Google Apps Script Web App URL below to sync inventory data and audit reports to your Google Sheet & Drive folder.
          </p>
        </div>

        <div className="text-xs space-y-1">
          <label className="block font-bold text-slate-700">Google Web App URL (Apps Script)</label>
          <input 
            type="url" 
            placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" 
            value={webAppUrl}
            onChange={(e) => setWebAppUrl(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
          />
          <p className="text-[10px] text-slate-500 mt-1">
            Don't have a Web App URL? Leave blank to generate an automated Google Sheets CSV file!
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700">Cancel</button>
          <button onClick={handleSync} className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg font-bold shadow-sm flex items-center gap-1">
            <CloudUpload className="w-4 h-4" />
            Sync Now
          </button>
        </div>

      </div>
    </div>
  );
}
