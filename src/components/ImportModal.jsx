import React, { useState } from 'react';
import { X, Upload, FileText, Plus, Check, FileCheck, ArrowRight, Bot, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { INDIA_GHG_FACTORS } from '../data/indiaGhgFactors.js';

export default function ImportModal({ isOpen, onClose, onImportItems, showToast, onOpenAiCopilot, currentProjectId }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'pdf' | 'preset' | 'paste'
  const [selectedPreset, setSelectedPreset] = useState('');
  const [presetQty, setPresetQty] = useState(100);
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(100);
  const [customUnit, setCustomUnit] = useState('kg');
  const [workbookSheets, setWorkbookSheets] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [pasteText, setPasteText] = useState('');

  // PDF Upload & Next Action States
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfParsedData, setPdfParsedData] = useState([]);
  const [pdfActionStage, setPdfActionStage] = useState('upload'); // 'upload' | 'parsed_ask_user'
  const [pdfSizeWarning, setPdfSizeWarning] = useState('');

  if (!isOpen) return null;

  // Standard File Upload Handler (.xlsx / .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      handlePdfUpload(file);
      return;
    }

    if (ext === 'csv') {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          processParsedData(results.data);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        if (workbook.SheetNames.length > 1) {setWorkbookSheets(workbook);setSelectedSheet(workbook.SheetNames[0]);return;}
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processParsedData(matrix);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // PDF Upload & Information Extraction Handler (> 250 KB Size Filter)
  const handlePdfUpload = (file) => {
    if (!file) return;
    const sizeKb = (file.size / 1024).toFixed(1);
    const passesSizeFilter = file.size >= 250 * 1024; // > 250 KB filter check

    setPdfFile({
      name: file.name,
      sizeKb: sizeKb,
      passesFilter: passesSizeFilter
    });

    // No document extractor is connected. Never manufacture invoice evidence.
    showToast('PDF extraction is not available. Enter verified document values using Excel, CSV or manual input.');
    setPdfSizeWarning('PDF extraction is not available. No items have been imported. Use verified values in Excel, CSV or manual input.');

  };

  // Process Parsed Matrix Data
  const processParsedData = (matrix) => {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      showToast("No valid rows found in file.");
      return;
    }

    const header = matrix.find(row => Array.isArray(row) && row.some(c => /^(?:name|item|material|activity|item description)$/i.test(String(c || '').trim())) && row.some(c => /^(?:qty|quantity|quantity \(input\))$/i.test(String(c || '').trim())));
    if (!header || !header.some(c=>/^unit$/i.test(String(c||'').trim())) || !header.some(c=>/^(ef|emission factor(?:.*)?)$/i.test(String(c||'').trim()))) {showToast('Unsupported layout. Use a simple table with Name, Quantity, Unit and numeric EF columns. Municipal/CoM matrices must be mapped first.');return;}
    const col = (pattern, fallback) => {const i=header.findIndex(c=>pattern.test(String(c||'').trim()));return i < 0 ? fallback : i;};
    const nameCol=col(/^(name|item|material|activity|item description)$/i,0), qtyCol=col(/^(qty|quantity|quantity \(input\))$/i,1), unitCol=col(/^unit$/i,2), efCol=col(/^(ef|emission factor(?:.*)?)$/i,3);
    const importedItems = [];
    matrix.slice(matrix.indexOf(header)+1).forEach((row, idx) => {
      if (!Array.isArray(row) || row.length === 0) return;
      const first = String(row[nameCol] || '').trim();
      const firstLower = first.toLowerCase();

      if (row === header || ['name', 'item', 'material', 'activity', 'item name', 'item description'].includes(firstLower)) return;
      if (!first || firstLower.startsWith('scope') || firstLower.startsWith('category') || firstLower.includes('total')) return;

      const name = first;
      const qty = Number(String(row[qtyCol] ?? '').replace(/,/g, '').trim());
      if (!Number.isFinite(qty) || qty < 0 || String(row[qtyCol] ?? '').trim() === '') return;
      const unit = String(row[unitCol] || 'kg').trim();
      const rawEf = Number(String(row[efCol] ?? "").trim());
      if (String(row[efCol] ?? "").trim() === "" || !Number.isFinite(rawEf) || rawEf < 0) return;

      let matchedFactor = INDIA_GHG_FACTORS.find(f => f.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(f.name.toLowerCase()));
      let ef = rawEf;
      let scope = matchedFactor ? matchedFactor.scope : (name.toLowerCase().includes('diesel') || name.toLowerCase().includes('cng') ? 'Scope 1' : name.toLowerCase().includes('electricity') ? 'Scope 2' : 'Scope 3');

      importedItems.push({
        id: crypto.randomUUID(),
        name: name,
        qty: qty,
        unit: unit,
        process: matchedFactor ? matchedFactor.name : `Uploaded LCI: ${name}`,
        ef: ef,
        sim: 0,
        ter: 5, ger: 5, tir: 5,
        risk: 'HIGH',
        scope: scope,
        status: 'Imported - Needs Review',
        approved: false
      });
    });

    if (importedItems.length > 0) {
      onImportItems(importedItems);
      showToast(`Merged ${importedItems.length} rows for review. Invalid quantity/factor rows were skipped; compare the result with your source.`);
      onClose();
    } else {
      showToast("Could not parse items from file.");
    }
  };

  // Paste Text Handler
  const handlePastedCsv = () => {
    if (!pasteText.trim()) return;
    Papa.parse(pasteText, {
      header: false,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        processParsedData(results.data);
      }
    });
  };

  // Preset Add Handler
  const handlePresetAdd = (e) => {
    e.preventDefault();
    if (selectedPreset) {
      const factorObj = INDIA_GHG_FACTORS.find(f => f.key === selectedPreset);
      if (!factorObj) return;
      onImportItems([{
        id: Date.now(),
        name: factorObj.name,
        qty: parseFloat(presetQty) || 100,
        unit: factorObj.unit,
        process: `India GHG Factor: ${factorObj.name}`,
        ef: factorObj.ef,
        sim: 1.0,
        ter: 1, ger: 1, tir: 1,
        risk: 'LOW',
        scope: factorObj.scope,
        status: 'Preset Verified',
        approved: true
      }]);
      showToast(`Added ${factorObj.name}`);
      onClose();
    } else if (customName.trim()) {
      onImportItems([{
        id: Date.now(),
        name: customName.trim(),
        qty: parseFloat(customQty) || 100,
        unit: customUnit,
        process: `Custom Material: ${customName.trim()}`,
        ef: 1.0,
        sim: 0.8,
        ter: 1, ger: 1, tir: 1,
        risk: 'LOW',
        scope: 'Scope 3',
        status: 'Custom Input',
        approved: true
      }]);
      showToast(`Added ${customName.trim()}`);
      onClose();
    }
  };

  // PDF Action Handlers
  const handleConfirmPdfImport = () => {
    onImportItems(pdfParsedData);
    showToast(`Successfully added ${pdfParsedData.length} items extracted from PDF into BOM inventory.`);
    onClose();
  };

  const handleAskAiAboutPdf = () => {
    onImportItems(pdfParsedData);
    showToast(`Added ${pdfParsedData.length} PDF items to inventory and launched AI Copilot.`);
    if (onOpenAiCopilot) onOpenAiCopilot();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 relative space-y-4 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Import Inventory & PDF Data</h2>
              <p className="text-[11px] text-slate-500 font-medium">Imports add quantities to matching rows and keep other rows. Re-importing adds again.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('upload'); setPdfActionStage('upload'); }}
            className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Upload File (.xlsx / .csv)
          </button>
          <button
            onClick={() => { setActiveTab('pdf'); }}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${activeTab === 'pdf' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <FileCheck size={14} /> PDF values (manual only)
          </button>
          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Preset Factor
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Paste CSV (with headers)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600">Simple BOM columns: Name, Quantity, Unit, EF (kg CO2e per activity unit). Select the sheet in multi-sheet workbooks. CoM municipal matrices need a separate mapping, not direct BOM import.</p>
            {workbookSheets && <div className="flex gap-2"><select aria-label="Workbook sheet" value={selectedSheet} onChange={e=>setSelectedSheet(e.target.value)} className="border rounded p-2 text-xs">{workbookSheets.SheetNames.map(n=><option key={n}>{n}</option>)}</select><button onClick={()=>processParsedData(XLSX.utils.sheet_to_json(workbookSheets.Sheets[selectedSheet],{header:1}))} className="rounded bg-emerald-600 text-white p-2 text-xs">Import Selected Sheet</button></div>}
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50 flex flex-col items-center justify-center transition-colors block">
              <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={handleFileUpload} className="hidden" />
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="font-extrabold text-xs text-slate-900">Click to browse Excel / CSV file</span>
              <span className="text-[11px] text-slate-500 mt-1">Simple BOM tables only. PDF extraction unavailable.</span>
            </label>
          </div>
        )}

        {activeTab === 'pdf' && pdfActionStage === 'upload' && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-emerald-50/50 flex flex-col items-center justify-center transition-colors block">
              <input type="file" accept=".pdf" onChange={(e) => handlePdfUpload(e.target.files[0])} className="hidden" />
              <FileCheck className="w-10 h-10 text-emerald-600 mb-2 animate-bounce" />
              <span className="font-extrabold text-xs text-slate-900">Upload PDF Document (EPD Certificate, Invoice, or Audit Report)</span>
              <span className="text-[11px] text-slate-600 mt-1 font-medium">Document extraction unavailable - no automatic inventory added</span>
            </label>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <AlertCircle size={14} className="text-emerald-600" />
                <span>PDF extraction status:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 pl-1">

                <li>Use Excel, CSV or manual input for document values.</li>
                <li>No PDF values are imported automatically.</li>
              </ul>
            </div>
          </div>
        )}

        {/* PDF Information Understood & Ask User for Next Actions Stage */}
        {activeTab === 'pdf' && pdfActionStage === 'parsed_ask_user' && (
          <div className="space-y-4 text-xs">
            {/* File Filter Badge */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2 text-emerald-900">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">PDF Document Information Parsed & Understood!</span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">{pdfSizeWarning}</span>
              </div>
            </div>

            {/* Extracted Items Preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 flex justify-between items-center font-bold text-slate-700">
                <span>Extracted Inventory Items ({pdfParsedData.length})</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                  {pdfParsedData.reduce((acc, i) => acc + ((i.qty * i.ef)/1000), 0).toFixed(3)} tCO₂e
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100">
                {pdfParsedData.map(item => (
                  <div key={item.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-[10px] text-slate-500">{item.qty} {item.unit} | {item.process}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 block font-mono">{((item.qty * item.ef)/1000).toFixed(3)} tCO₂e</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{item.scope}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ASK USER FOR NEXT ACTIONS */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-slate-100">What would you like to do next?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The information from <strong>{pdfFile?.name}</strong> has been extracted. Please select your next action:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleConfirmPdfImport}
                  className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-between transition-all text-xs group"
                >
                  <span>1. Add Items to BOM Inventory</span>
                  <Plus size={16} className="group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={handleAskAiAboutPdf}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg font-bold flex items-center justify-between transition-all text-xs group"
                >
                  <span>2. Ask AI Copilot to Audit</span>
                  <Bot size={16} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button onClick={() => setPdfActionStage('upload')} className="text-slate-400 hover:text-slate-600 text-xs underline font-semibold">
                Re-upload different PDF
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preset' && (
          <form onSubmit={handlePresetAdd} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Preset Material / Fuel (Dropdown)</label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold bg-white"
              >
                <option value="">-- Choose from 60 Verified India GHG Factor Presets --</option>
                {INDIA_GHG_FACTORS.map(f => (
                  <option key={f.key} value={f.key}>
                    {f.name} — {f.ef} kgCO₂e/{f.unit} [{f.scope}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Or Enter Custom Item Name</label>
              <input
                type="text"
                placeholder="Custom material name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={selectedPreset ? presetQty : customQty}
                  onChange={(e) => selectedPreset ? setPresetQty(e.target.value) : setCustomQty(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit</label>
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="Liters">Liters</option>
                  <option value="kWh">kWh</option>
                  <option value="km">km</option>
                  <option value="pcs">pcs</option>
                  <option value="tonne-km">tonne-km</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm">Add Item</button>
            </div>
          </form>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-3 text-xs">
            <textarea
              rows="5"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Item Description,Quantity,Unit,Emission Factor&#10;Diesel Generator,500,Liters,2.6558&#10;Grid Electricity,12000,kWh,0.716"
              className="w-full p-2.5 font-mono border border-slate-300 rounded-lg outline-none focus:border-emerald-500 bg-slate-50"
            />
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg font-bold">Cancel</button>
              <button onClick={handlePastedCsv} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm">Import Text</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
