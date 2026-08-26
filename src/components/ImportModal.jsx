import React, { useState } from 'react';
import { X, Upload, FileText, Plus, Check } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { INDIA_GHG_FACTORS } from '../data/indiaGhgFactors.js';

export default function ImportModal({ isOpen, onClose, onImportItems, showToast }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'preset' | 'paste'
  const [selectedPreset, setSelectedPreset] = useState('');
  const [presetQty, setPresetQty] = useState(100);
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(100);
  const [customUnit, setCustomUnit] = useState('kg');
  const [pasteText, setPasteText] = useState('');

  if (!isOpen) return null;

  // File Upload Handler (.xlsx / .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

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
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processParsedData(matrix);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Process Parsed Matrix Data
  const processParsedData = (matrix) => {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      showToast("No valid rows found in file.");
      return;
    }

    const importedItems = [];
    matrix.forEach((row, idx) => {
      if (!Array.isArray(row) || row.length === 0) return;
      const first = String(row[0] || '').trim();
      const firstLower = first.toLowerCase();

      if (!first || firstLower.startsWith('scope') || firstLower.startsWith('category') || firstLower.includes('total')) return;

      const name = first;
      const qty = parseFloat(row[1]) || 100;
      const unit = String(row[2] || 'kg').trim();
      const rawEf = parseFloat(row[3]);

      // Match factor
      let matchedFactor = INDIA_GHG_FACTORS.find(f => f.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(f.name.toLowerCase()));
      let ef = !isNaN(rawEf) && rawEf > 0 ? rawEf : (matchedFactor ? matchedFactor.ef : 1.0);
      let scope = matchedFactor ? matchedFactor.scope : (name.toLowerCase().includes('diesel') || name.toLowerCase().includes('cng') ? 'Scope 1' : name.toLowerCase().includes('electricity') ? 'Scope 2' : 'Scope 3');

      importedItems.push({
        id: Date.now() + idx,
        name: name,
        qty: qty,
        unit: unit,
        process: matchedFactor ? matchedFactor.name : `Uploaded LCI: ${name}`,
        ef: ef,
        sim: 0.95,
        ter: 1, ger: 1, tir: 1,
        risk: 'LOW',
        scope: scope,
        status: 'Auto-Matched',
        approved: true
      });
    });

    if (importedItems.length > 0) {
      onImportItems(importedItems);
      showToast(`Imported ${importedItems.length} inventory items from file.`);
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full border border-slate-200 relative space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900">Import Inventory & Activity Data</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Upload File (.xlsx / .csv)
          </button>
          <button 
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Choose Preset Factor
          </button>
          <button 
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 rounded-lg transition-colors ${activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Paste Raw CSV
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50 flex flex-col items-center justify-center transition-colors block">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <span className="font-extrabold text-xs text-slate-900">Click to browse or drop Excel / CSV file</span>
              <span className="text-[11px] text-slate-500 mt-1">Supports BOM files & GHG Calculator templates</span>
            </label>
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
