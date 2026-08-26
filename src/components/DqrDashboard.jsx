import React, { useState } from 'react';
import { ShieldCheck, Award, Info, Sliders, CheckCircle2, AlertCircle, FileSpreadsheet, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { downloadBrsrCorePcfJson, downloadBrsrCorePcfCsv } from '../services/pcfExport.js';
import { downloadOpenLcaJsonLd } from '../services/openLcaBridge.js';
import { OPEN_FACTOR_DATABASES } from '../data/openEmissionFactors.js';

export default function DqrDashboard({ project, activePeriodYear, onUpdateBomItem }) {
  const safePeriods = project?.periods || [];
  const activePeriod = safePeriods.find(p => p.year === activePeriodYear) || safePeriods[safePeriods.length - 1] || {
    periodName: `FY${activePeriodYear || 2024}`,
    bom: project?.bom || []
  };

  const bom = activePeriod.bom || [];
  const [selectedItemId, setSelectedItemId] = useState(bom[0]?.id || null);

  // Pedigree dimension definitions
  const PEDIGREE_DIMENSIONS = [
    { key: 'r', name: 'Reliability (R)', desc: 'Verification status & measurement method (1 = Verified primary data, 5 = Unverified guess)' },
    { key: 'c', name: 'Completeness (C)', desc: 'Sample size & representativeness over time (1 = >90% representative, 5 = Unknown sample)' },
    { key: 't', name: 'Temporal (T)', desc: 'Age of emission factor or activity data (1 = <3 years old, 5 = >10 years old)' },
    { key: 'g', name: 'Geographical (G)', desc: 'Geographic match to facility (1 = Same site/country, 5 = Non-similar region proxy)' },
    { key: 'te', name: 'Technological (Te)', desc: 'Process technology match (1 = Identical equipment/tech, 5 = Different tech proxy)' }
  ];

  // Calculate item DQR
  const getItemDqr = (item) => {
    const p = item.dqrPedigree || { r: 2, c: 2, t: 2, g: 2, te: 2 };
    return (p.r + p.c + p.t + p.g + p.te) / 5;
  };

  // Calculate weighted project DQR
  const totalEmissions = bom.reduce((sum, item) => sum + (item.result_tco2e ?? ((item.qty * item.ef) / 1000)), 0);
  const weightedDqrSum = bom.reduce((sum, item) => {
    const itemEmissions = (item.result_tco2e ?? ((item.qty * item.ef) / 1000));
    return sum + (getItemDqr(item) * (itemEmissions > 0 ? itemEmissions : 0.001));
  }, 0);
  const projectDqr = totalEmissions > 0 ? (weightedDqrSum / totalEmissions) : 2.0;

  const getDqrQualityLabel = (score) => {
    if (score <= 1.5) return { label: 'Tier 1 / High Quality', color: 'bg-emerald-500 text-white', border: 'border-emerald-500' };
    if (score <= 2.5) return { label: 'Tier 2 / Good Quality', color: 'bg-teal-500 text-white', border: 'border-teal-500' };
    if (score <= 3.5) return { label: 'Tier 3 / Moderate Proxy', color: 'bg-amber-500 text-white', border: 'border-amber-500' };
    return { label: 'High Uncertainty / Proxy', color: 'bg-rose-500 text-white', border: 'border-rose-500' };
  };

  const selectedItem = bom.find(i => i.id === selectedItemId) || bom[0];
  const selectedPedigree = selectedItem?.dqrPedigree || { r: 2, c: 2, t: 2, g: 2, te: 2 };

  const handlePedigreeChange = (dimKey, value) => {
    if (!selectedItem || !onUpdateBomItem) return;
    const newPedigree = { ...selectedPedigree, [dimKey]: parseInt(value, 10) };
    const newDqr = Number(((newPedigree.r + newPedigree.c + newPedigree.t + newPedigree.g + newPedigree.te) / 5).toFixed(2));
    onUpdateBomItem(selectedItem.id, {
      dqrPedigree: newPedigree,
      dqrScore: newDqr
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              ISO 14044 / GHG Product Standard
            </span>
            <span className="text-xs text-slate-500 font-medium">Reporting Period: <strong>{activePeriod.periodName}</strong></span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Data Quality Rating (DQR) & Pedigree Matrix</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Evaluate activity data reliability and emission factor representativeness using standard 5-dimension pedigree scoring.
          </p>
        </div>

        {/* Project Overall Score Card */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center gap-4 border border-slate-800 shadow-md">
          <div className="text-center">
            <div className="text-xs uppercase font-bold text-slate-400">Project DQR</div>
            <div className="text-3xl font-black text-emerald-400">{projectDqr.toFixed(2)}</div>
          </div>
          <div className="h-10 w-[1px] bg-slate-800"></div>
          <div>
            <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${getDqrQualityLabel(projectDqr).color}`}>
              {getDqrQualityLabel(projectDqr).label}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Weighted by tCO2e contribution</div>
          </div>
        </div>
      </div>

      {/* Export Action Strip */}
      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Standardized PCF & openLCA Exchange Bridges
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Export structured datasets with embedded DQR pedigree vectors for SEBI BRSR Core or openLCA imports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => downloadBrsrCorePcfJson(project)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            BRSR Core PCF (JSON)
          </button>
          <button
            onClick={() => downloadBrsrCorePcfCsv(project)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            BRSR Core PCF (CSV)
          </button>
          <button
            onClick={() => downloadOpenLcaJsonLd(project)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            openLCA JSON-LD (.jsonld)
          </button>
        </div>
      </div>

      {/* Interactive Pedigree Matrix Inspector */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Line Item List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Inventory Items ({bom.length})</h3>
            <span className="text-xs text-slate-400">Click item to edit Pedigree</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {bom.map(item => {
              const dqr = getItemDqr(item);
              const isSelected = item.id === selectedItem?.id;
              const em = item.result_tco2e ?? ((item.qty * item.ef) / 1000);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex justify-between items-center ${
                    isSelected 
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs' 
                      : 'bg-slate-50/60 border-slate-200/70 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-bold text-xs text-slate-900 truncate">{item.item}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.qty} {item.unit} • {em.toFixed(2)} tCO2e ({item.scope || 'Scope 3'})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                      dqr <= 2.0 ? 'bg-emerald-100 text-emerald-800' : dqr <= 3.2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      DQR {dqr.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pedigree Matrix Slider Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          {selectedItem ? (
            <>
              <div className="pb-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Active Inspection
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{selectedItem.item}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Source: <strong>{selectedItem.efSource || 'Open LCI Reference (DEFRA / CEA / CBAM)'}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase">Item DQR</div>
                  <div className="text-2xl font-black text-emerald-600">{getItemDqr(selectedItem).toFixed(2)}</div>
                </div>
              </div>

              {/* Pedigree Matrix 5 Sliders */}
              <div className="space-y-4">
                {PEDIGREE_DIMENSIONS.map(dim => {
                  const currentValue = selectedPedigree[dim.key] || 2;

                  return (
                    <div key={dim.key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {dim.name}
                        </label>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900">
                          Score: {currentValue} / 5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{dim.desc}</p>
                      
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] font-bold text-emerald-700">1 (Best)</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={currentValue}
                          onChange={(e) => handlePedigreeChange(dim.key, e.target.value)}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-rose-700">5 (Proxy)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pedigree Tuple Vector Output */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs flex justify-between items-center">
                <span>ILCD Pedigree Vector:</span>
                <span className="text-emerald-400 font-bold">
                  ({selectedPedigree.r};{selectedPedigree.c};{selectedPedigree.t};{selectedPedigree.g};{selectedPedigree.te})
                </span>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a BOM line item to inspect and adjust its DQR Pedigree scores.</p>
            </div>
          )}
        </div>
      </div>

      {/* Open Emission Factor Citations Reference Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Open Emission Factor Databases & Provenance</h3>
            <p className="text-xs text-slate-500">Official references utilized for default semantic matching and cradle-to-gate benchmarking.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {OPEN_FACTOR_DATABASES.map(db => (
            <div key={db.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-xs text-slate-900">{db.name}</h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {db.year}
                </span>
              </div>
              <p className="text-[11px] text-slate-600"><strong>Coverage:</strong> {db.coverage}</p>
              <p className="text-[11px] text-slate-600"><strong>License:</strong> {db.license}</p>
              <a
                href={db.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors pt-1"
              >
                Official Publication <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
