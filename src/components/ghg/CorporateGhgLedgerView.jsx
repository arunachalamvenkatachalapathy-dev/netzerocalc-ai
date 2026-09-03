import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame,
  Car,
  Zap,
  Network,
  Calculator,
  Download,
  Plus,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  RefreshCw,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  GHG_FACTOR_LIBRARY,
  SCOPE3_CATEGORY_NAMES
} from '../../data/ghgFactorLibrary.js';
import {
  calculateCorporateGhg,
  exportLineageToCSV,
  exportWorkspaceToJson
} from '../../services/ghg/calculationEngine.js';

export default function CorporateGhgLedgerView({
  activeProject,
  activePeriodYear = '2024',
  onUpdateProject,
  showToast
}) {
  const [activeSubTab, setActiveSubTab] = useState('scope1'); // 'scope1', 'scope2', 'scope3', 'results'
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Facilities from project context or fallback
  const facilities = useMemo(() => {
    return activeProject?.facilities?.length
      ? activeProject.facilities
      : [
          { id: 'fac_main', name: 'Main Manufacturing Plant', region: 'IN', grid_region: 'IN' },
          { id: 'fac_hq', name: 'Corporate Headquarters', region: 'EU', grid_region: 'EU' }
        ];
  }, [activeProject]);

  // Current Period Data
  const [periodData, setPeriodData] = useState(() => {
    const existing = activeProject?.corporateGhg?.periods?.[activePeriodYear];
    if (existing) return existing;

    return {
      year: parseInt(activePeriodYear) || 2024,
      stationary: [
        { id: 'st_1', facility: facilities[0]?.id || '', fuel: 'natural_gas', qty: 50000, unit: 'kWh_gross' },
        { id: 'st_2', facility: facilities[0]?.id || '', fuel: 'diesel', qty: 2500, unit: 'L' }
      ],
      mobile: [
        { id: 'mb_1', facility: facilities[0]?.id || '', method: 'fuel', fueltype: 'diesel', qty: 1200, unit: 'L' },
        { id: 'mb_2', facility: facilities[1]?.id || '', method: 'distance', fueltype: 'car_avg', qty: 15000, unit: 'km' }
      ],
      s2lb: [
        { id: 's2_1', facility: facilities[0]?.id || '', region: 'IN', kwh: 120000, year: 2024 },
        { id: 's2_2', facility: facilities[1]?.id || '', region: 'EU', kwh: 35000, year: 2024 }
      ],
      s2mb: [
        { id: 's2m_1', facility: facilities[0]?.id || '', instrument: 'eac', kwh: 60000, efOverride: 0 },
        { id: 's2m_2', facility: facilities[0]?.id || '', instrument: 'residual', kwh: 60000, efOverride: 0.40 },
        { id: 's2m_3', facility: facilities[1]?.id || '', instrument: 'supplier', kwh: 35000, efOverride: 0.12 }
      ],
      s3: [
        { id: 's3_1', cat: 'cat1', method: 'spend_based', value: 45000, unit: '$' },
        { id: 's3_2', cat: 'cat3', method: 'activity_based', value: 155000, unit: 'kWh' },
        { id: 's3_3', cat: 'cat4', method: 'activity_based', value: 250000, unit: 'tonne-km' },
        { id: 's3_4', cat: 'cat6', method: 'activity_based', value: 35000, unit: 'passenger-km' }
      ]
    };
  });

  // Calculate live results
  const calculation = useMemo(() => {
    return calculateCorporateGhg(periodData, facilities);
  }, [periodData, facilities]);

  // Handle row mutations
  const updateRow = useCallback((collection, id, field, value) => {
    setPeriodData(prev => {
      const updated = { ...prev };
      updated[collection] = updated[collection].map(row => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      });
      return updated;
    });
    setIsDirty(true);
    setSaveStatus('saving');
  }, []);

  const addRow = useCallback((collection, defaultRow) => {
    setPeriodData(prev => {
      const updated = { ...prev };
      const newId = `${collection}_${Date.now()}`;
      updated[collection] = [...updated[collection], { ...defaultRow, id: newId }];
      return updated;
    });
    setIsDirty(true);
    setSaveStatus('saving');
  }, []);

  const deleteRow = useCallback((collection, id) => {
    setPeriodData(prev => {
      const updated = { ...prev };
      updated[collection] = updated[collection].filter(r => r.id !== id);
      return updated;
    });
    setIsDirty(true);
    setSaveStatus('saving');
  }, []);

  // Save changes to project state
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      if (onUpdateProject && activeProject) {
        const updatedProject = {
          ...activeProject,
          corporateGhg: {
            ...activeProject.corporateGhg,
            periods: {
              ...activeProject.corporateGhg?.periods,
              [activePeriodYear]: periodData
            },
            results: {
              ...activeProject.corporateGhg?.results,
              [activePeriodYear]: calculation.results_tonnes
            }
          }
        };
        onUpdateProject(updatedProject);
      }
      setIsDirty(false);
      setSaveStatus('saved');
    }, 1200);
    return () => clearTimeout(timer);
  }, [isDirty, periodData, calculation, activePeriodYear, activeProject, onUpdateProject]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-8 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              <Calculator className="w-3.5 h-3.5" />
              Corporate GHG Inventory • Scope 1, 2 &amp; 3 Ledger
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Corporate Emissions Accounting Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Multi-facility activity and spend accounting aligned with the GHG Protocol Corporate Standard. Dual-reporting Scope 2 (Location-Based vs Market-Based) with contractual instruments, vehicle fuel &amp; distance tiers, and Scope 3 value chain.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
              <span className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`}></span>
              <span>{saveStatus === 'saved' ? 'Autosaved to Project' : 'Saving changes...'}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Active Period: <strong className="text-emerald-400">FY{activePeriodYear}</strong> • {facilities.length} registered facilities
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Live Emissions Tonnage) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Scope 1 Direct
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {calculation.results_tonnes.scope1.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">tCO2e · Stationary + Mobile</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Scope 2 (LB)
            <Zap className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {calculation.results_tonnes.scope2lb.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">tCO2e · Location-Based Grid</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Scope 2 (MB)
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {calculation.results_tonnes.scope2mb.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">tCO2e · Market-Based Instruments</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            Scope 3
            <Network className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {calculation.results_tonnes.scope3.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">tCO2e · 15 Value Chain Cats</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs bg-emerald-50/20">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            TOTAL (LB)
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {calculation.results_tonnes.totalLb.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Location-Based Total</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs bg-emerald-50/20">
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            TOTAL (MB)
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {calculation.results_tonnes.totalMb.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Market-Based Total</div>
        </div>
      </div>

      {/* 3. Sub-Tab Navigator & Action Controls */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSubTab('scope1')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'scope1'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            Scope 1 Direct
            <span className="ml-1 px-1.5 py-0.2 rounded bg-black/20 text-[10px]">
              {periodData.stationary.length + periodData.mobile.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('scope2')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'scope2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            Scope 2 Dual-Reporting
            <span className="ml-1 px-1.5 py-0.2 rounded bg-black/20 text-[10px]">
              {periodData.s2lb.length + periodData.s2mb.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('scope3')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'scope3'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            Scope 3 Value Chain
            <span className="ml-1 px-1.5 py-0.2 rounded bg-black/20 text-[10px]">
              {periodData.s3.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('results')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'results'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Results &amp; Lineage Audit
            <span className="ml-1 px-1.5 py-0.2 rounded bg-black/20 text-[10px]">
              {calculation.lineage.length}
            </span>
          </button>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportLineageToCSV(calculation.lineage, `FY${activePeriodYear}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            title="Export full formula lineage to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            Lineage CSV
          </button>
          <button
            onClick={() => exportWorkspaceToJson({ facilities, periods: [periodData] }, activePeriodYear)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
            title="Export full workspace JSON schema"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Workspace JSON
          </button>
        </div>
      </div>

      {/* 4. Sub-Tab Content */}

      {/* SUB-TAB 1: SCOPE 1 DIRECT */}
      {activeSubTab === 'scope1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Section A: Stationary Combustion */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Stationary Combustion (Boilers, Furnaces, Generators)
                </h3>
              </div>
              <button
                onClick={() => addRow('stationary', {
                  facility: facilities[0]?.id || '',
                  fuel: 'natural_gas',
                  qty: 10000,
                  unit: 'kWh_gross'
                })}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Fuel Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Facility Site</th>
                    <th className="py-3 px-4">Fuel Type</th>
                    <th className="py-3 px-4">Consumption Quantity</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Emission Factor</th>
                    <th className="py-3 px-4">Emissions (tCO2e)</th>
                    <th className="py-3 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {periodData.stationary.map((row) => {
                    const ef = GHG_FACTOR_LIBRARY.stationary[row.fuel] || GHG_FACTOR_LIBRARY.stationary.natural_gas;
                    const rowTonnes = ((parseFloat(row.qty) || 0) * ef.value) / 1000;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-4">
                          <select
                            value={row.facility}
                            onChange={(e) => updateRow('stationary', row.id, 'facility', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            {facilities.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.fuel}
                            onChange={(e) => updateRow('stationary', row.id, 'fuel', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-900 dark:text-white"
                          >
                            {Object.entries(GHG_FACTOR_LIBRARY.stationary).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) => updateRow('stationary', row.id, 'qty', e.target.value)}
                            className="w-36 px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono">
                          {row.unit || ef.unit}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {ef.value} {ef.unit} ({ef.source})
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {rowTonnes.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteRow('stationary', row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Mobile Combustion */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Mobile Combustion (Company Fleet &amp; Logistics)
                </h3>
              </div>
              <button
                onClick={() => addRow('mobile', {
                  facility: facilities[0]?.id || '',
                  method: 'fuel',
                  fueltype: 'diesel',
                  qty: 1000,
                  unit: 'L'
                })}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Vehicle Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Facility Site</th>
                    <th className="py-3 px-4">Accounting Method</th>
                    <th className="py-3 px-4">Fuel / Vehicle Category</th>
                    <th className="py-3 px-4">Volume / Distance</th>
                    <th className="py-3 px-4">Emission Factor</th>
                    <th className="py-3 px-4">Emissions (tCO2e)</th>
                    <th className="py-3 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {periodData.mobile.map((row) => {
                    const isFuel = row.method === 'fuel';
                    const ef = isFuel
                      ? (GHG_FACTOR_LIBRARY.mobile_fuel[row.fueltype] || GHG_FACTOR_LIBRARY.mobile_fuel.diesel)
                      : (GHG_FACTOR_LIBRARY.mobile_distance[row.fueltype] || GHG_FACTOR_LIBRARY.mobile_distance.car_avg);
                    const rowTonnes = ((parseFloat(row.qty) || 0) * ef.value) / 1000;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-4">
                          <select
                            value={row.facility}
                            onChange={(e) => updateRow('mobile', row.id, 'facility', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            {facilities.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.method}
                            onChange={(e) => {
                              const newMethod = e.target.value;
                              updateRow('mobile', row.id, 'method', newMethod);
                              updateRow('mobile', row.id, 'fueltype', newMethod === 'fuel' ? 'diesel' : 'car_avg');
                              updateRow('mobile', row.id, 'unit', newMethod === 'fuel' ? 'L' : 'km');
                            }}
                            className="w-36 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value="fuel">Fuel Volume (Tier 2)</option>
                            <option value="distance">Distance Traveled (Tier 3)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.fueltype}
                            onChange={(e) => updateRow('mobile', row.id, 'fueltype', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium text-slate-900 dark:text-white"
                          >
                            {isFuel
                              ? Object.entries(GHG_FACTOR_LIBRARY.mobile_fuel).map(([k, v]) => (
                                  <option key={k} value={k}>{v.label}</option>
                                ))
                              : Object.entries(GHG_FACTOR_LIBRARY.mobile_distance).map(([k, v]) => (
                                  <option key={k} value={k}>{v.label}</option>
                                ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={row.qty}
                              onChange={(e) => updateRow('mobile', row.id, 'qty', e.target.value)}
                              className="w-32 px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white"
                            />
                            <span className="text-slate-500 font-mono text-xs">{row.unit || (isFuel ? 'L' : 'km')}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {ef.value} {ef.unit} ({ef.source})
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {rowTonnes.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteRow('mobile', row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: SCOPE 2 DUAL-REPORTING */}
      {activeSubTab === 'scope2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Dual-Reporting Summary Notice */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">GHG Protocol Scope 2 Dual-Reporting Mandate</strong>: Corporate filers with operations in markets providing contractual electricity instruments must report both <em>Location-Based</em> (grid average) and <em>Market-Based</em> (contractual instruments like EACs, RECs, PPAs, and residual mix) emissions in parallel.
            </div>
          </div>

          {/* Section A: Location-Based Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Scope 2: Location-Based (Grid-Average Emissions)
                </h3>
              </div>
              <button
                onClick={() => addRow('s2lb', {
                  facility: facilities[0]?.id || '',
                  region: 'IN',
                  kwh: 50000,
                  year: 2024
                })}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Location Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Facility Site</th>
                    <th className="py-3 px-4">Grid Geography / Region</th>
                    <th className="py-3 px-4">Grid Emission Factor</th>
                    <th className="py-3 px-4">Electricity Consumption (kWh)</th>
                    <th className="py-3 px-4">Emissions (tCO2e)</th>
                    <th className="py-3 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {periodData.s2lb.map((row) => {
                    const ef = GHG_FACTOR_LIBRARY.grid_location[row.region] || GHG_FACTOR_LIBRARY.grid_location.global;
                    const rowTonnes = ((parseFloat(row.kwh) || 0) * ef.value) / 1000;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-4">
                          <select
                            value={row.facility}
                            onChange={(e) => updateRow('s2lb', row.id, 'facility', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            {facilities.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.region}
                            onChange={(e) => updateRow('s2lb', row.id, 'region', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            {Object.entries(GHG_FACTOR_LIBRARY.grid_location).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {ef.value} {ef.unit} ({ef.source})
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            value={row.kwh}
                            onChange={(e) => updateRow('s2lb', row.id, 'kwh', e.target.value)}
                            className="w-36 px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {rowTonnes.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteRow('s2lb', row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section B: Market-Based Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Scope 2: Market-Based (Contractual Instruments &amp; Residual Mix)
                </h3>
              </div>
              <button
                onClick={() => addRow('s2mb', {
                  facility: facilities[0]?.id || '',
                  instrument: 'eac',
                  kwh: 50000,
                  efOverride: 0
                })}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Contractual Instrument
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Facility Site</th>
                    <th className="py-3 px-4">Instrument Type</th>
                    <th className="py-3 px-4">Consumption (kWh)</th>
                    <th className="py-3 px-4">EF Override (kgCO2e/kWh)</th>
                    <th className="py-3 px-4">Emissions (tCO2e)</th>
                    <th className="py-3 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {periodData.s2mb.map((row) => {
                    let efVal = 0.40;
                    if (row.instrument === 'eac' || row.instrument === 'rec' || row.instrument === 'ppa' || row.instrument === 'supplier') {
                      efVal = parseFloat(row.efOverride) || 0;
                    } else {
                      efVal = GHG_FACTOR_LIBRARY.residual_mix.EU.value;
                    }
                    const rowTonnes = ((parseFloat(row.kwh) || 0) * efVal) / 1000;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-4">
                          <select
                            value={row.facility}
                            onChange={(e) => updateRow('s2mb', row.id, 'facility', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            {facilities.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.instrument}
                            onChange={(e) => updateRow('s2mb', row.id, 'instrument', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value="eac">Energy Attribute Certificate (EAC / REC - 0 kgCO2e)</option>
                            <option value="ppa">Power Purchase Agreement (PPA)</option>
                            <option value="supplier">Supplier-Specific Tariff</option>
                            <option value="residual">Residual Mix (Untracked Default)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            value={row.kwh}
                            onChange={(e) => updateRow('s2mb', row.id, 'kwh', e.target.value)}
                            className="w-36 px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-4">
                          {row.instrument === 'residual' ? (
                            <span className="text-slate-400 font-mono text-xs">
                              {GHG_FACTOR_LIBRARY.residual_mix.EU.value} (AIB EU Residual)
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.001"
                                value={row.efOverride ?? 0}
                                onChange={(e) => updateRow('s2mb', row.id, 'efOverride', e.target.value)}
                                className="w-24 px-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                              />
                              <span className="text-slate-400 text-[11px]">kgCO2e/kWh</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {rowTonnes.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteRow('s2mb', row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: SCOPE 3 VALUE CHAIN */}
      {activeSubTab === 'scope3' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Scope 3 Value Chain Ledger (Categories 1–15)
                </h3>
              </div>
              <button
                onClick={() => addRow('s3', {
                  cat: 'cat1',
                  method: 'spend_based',
                  value: 10000,
                  unit: '$'
                })}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Value Chain Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">GHG Protocol Scope 3 Category</th>
                    <th className="py-3 px-4">Methodology</th>
                    <th className="py-3 px-4">Activity / Spend Amount</th>
                    <th className="py-3 px-4">Emission Factor</th>
                    <th className="py-3 px-4">Emissions (tCO2e)</th>
                    <th className="py-3 px-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {periodData.s3.map((row) => {
                    const isSpend = row.method === 'spend_based';
                    const ef = isSpend
                      ? (GHG_FACTOR_LIBRARY.scope3_spend[row.cat] || GHG_FACTOR_LIBRARY.scope3_spend.cat1)
                      : (GHG_FACTOR_LIBRARY.scope3_activity[row.cat] || GHG_FACTOR_LIBRARY.scope3_activity.cat1);
                    const rowTonnes = ((parseFloat(row.value) || 0) * ef.value) / 1000;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-4 font-medium">
                          <select
                            value={row.cat}
                            onChange={(e) => updateRow('s3', row.id, 'cat', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            {Object.entries(SCOPE3_CATEGORY_NAMES).map(([k, label]) => (
                              <option key={k} value={k}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={row.method}
                            onChange={(e) => {
                              const newMethod = e.target.value;
                              updateRow('s3', row.id, 'method', newMethod);
                              updateRow('s3', row.id, 'unit', newMethod === 'spend_based' ? '$' : 'units');
                            }}
                            className="w-36 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value="spend_based">Spend-Based (EEIO)</option>
                            <option value="activity_based">Activity-Based</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={row.value}
                              onChange={(e) => updateRow('s3', row.id, 'value', e.target.value)}
                              className="w-32 px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                            />
                            <span className="text-slate-500 font-mono text-xs">{row.unit || (isSpend ? '$' : 'units')}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {ef.value} {ef.unit} ({ef.source})
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                          {rowTonnes.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteRow('s3', row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RESULTS & AUDIT LINEAGE */}
      {activeSubTab === 'results' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Facility Spatial Distribution Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Facility Spatial Allocation (Scope 1 &amp; Scope 2 Breakdown)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Aggregated from {facilities.length} operational sites
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Facility Site</th>
                    <th className="py-3 px-4">Scope 1 Direct (tCO2e)</th>
                    <th className="py-3 px-4">Scope 2 Location-Based (tCO2e)</th>
                    <th className="py-3 px-4">Scope 2 Market-Based (tCO2e)</th>
                    <th className="py-3 px-4">Total Site Footprint (LB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {Object.keys(calculation.facilityBreakdown).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No Scope 1 or 2 entries logged for registered facilities yet.
                      </td>
                    </tr>
                  ) : (
                    Object.entries(calculation.facilityBreakdown).map(([name, data]) => (
                      <tr key={name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {name}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-amber-600 dark:text-amber-400">
                          {data.s1.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                          {data.s2lb.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          {data.s2mb.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {data.totalLb.toFixed(3)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Audit Lineage Trail */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Complete Audit Formula Lineage Log ({calculation.lineage.length} Line Items)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Verified against ISO 14064-1 &amp; GHG Protocol
              </span>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-[11px] text-emerald-400 max-h-96 overflow-y-auto rounded-b-xl space-y-1.5">
              {calculation.lineage.map((item, idx) => (
                <div key={idx} className="hover:bg-white/5 p-1 rounded transition">
                  <span className="text-slate-500">[S{item.scope}/{item.category}]</span>{' '}
                  <span className="text-amber-300">@{item.facility_name}</span>:{' '}
                  <span className="text-white font-bold">{item.formula_applied}</span>{' '}
                  <span className="text-slate-500 text-[10px]">({item.ef_source} v{item.ef_version}, Tier {item.ef_tier})</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
