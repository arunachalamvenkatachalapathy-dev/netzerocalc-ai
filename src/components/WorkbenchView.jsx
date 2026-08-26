import React, { useState } from 'react';
import { 
  Plus, Upload, Trash2, CheckCircle2, AlertTriangle, Download, 
  RefreshCw, FileSpreadsheet, Sparkles, Filter, Check, Info, ExternalLink, Search, Shield, FileCheck, PieChart as PieIcon, BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { INDIA_GHG_FACTORS } from '../data/indiaGhgFactors.js';

const calcTCO2e = (item) => {
  if (!item) return 0;
  if (item.result_tco2e !== undefined && item.result_tco2e !== null) {
    return Number(item.result_tco2e) || 0;
  }
  const qty = Number(item.qty) || 0;
  const ef = Number(item.ef) || 0;
  return (qty * ef) / 1000;
};

export default function WorkbenchView({ 
  currentBOM, 
  setCurrentBOM, 
  activePeriod,
  periods = [],
  baseYearPeriod,
  onSwitchPeriod,
  onAddPeriod,
  onSetBaseYear,
  onOpenImportModal, 
  onOpenGoogleSheetsModal,
  onNavigateToCompliance, 
  showToast 
}) {
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [quickPreset, setQuickPreset] = useState('');
  const [quickQty, setQuickQty] = useState(100);
  const [quickSearchTerm, setQuickSearchTerm] = useState('');

  // Filter Quick Add Presets dynamically by user search query
  const filteredPresets = INDIA_GHG_FACTORS.filter(f => {
    if (!quickSearchTerm.trim()) return true;
    const term = quickSearchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.scope.toLowerCase().includes(term) ||
      f.unit.toLowerCase().includes(term) ||
      (f.notes && f.notes.toLowerCase().includes(term))
    );
  });

  // Lead Auditor Pre-Verification Metrics (ISO 14064-1 & EU CBAM)
  const totalItemsCount = currentBOM.length;
  const approvedItemsCount = currentBOM.filter(i => i.approved).length;
  const unassignedScope3Count = currentBOM.filter(i => i.scope === 'Scope 3' && (!i.scope3Category || i.scope3Category.includes('N/A'))).length;
  const avgTer = totalItemsCount ? (currentBOM.reduce((acc, i) => acc + (i.ter || 1), 0) / totalItemsCount).toFixed(1) : '1.0';
  const avgGer = totalItemsCount ? (currentBOM.reduce((acc, i) => acc + (i.ger || 1), 0) / totalItemsCount).toFixed(1) : '1.0';
  const avgTir = totalItemsCount ? (currentBOM.reduce((acc, i) => acc + (i.tir || 1), 0) / totalItemsCount).toFixed(1) : '1.0';
  const overallDqr = ((parseFloat(avgTer) + parseFloat(avgGer) + parseFloat(avgTir)) / 3).toFixed(1);
  const primaryDataPercent = totalItemsCount ? Math.round((currentBOM.filter(i => i.sim === 1.0 || i.status === 'Preset Verified').length / totalItemsCount) * 100) : 100;
  const isAuditReady = unassignedScope3Count === 0 && approvedItemsCount === totalItemsCount && totalItemsCount > 0;

  // Scope 1, 2 Location-Based, Scope 2 Market-Based, and Scope 3 Totals
  const scope1Total = currentBOM.filter(i => i.scope === 'Scope 1').reduce((acc, i) => acc + calcTCO2e(i), 0);
  
  // Scope 2 Dual Reporting (Location-Based vs Market-Based per GHG Protocol Guidance)
  const scope2LocationTotal = currentBOM.filter(i => 
    i.scope === 'Scope 2' && (i.scope2Method ? i.scope2Method === 'location' : !i.name.toLowerCase().includes('ppa'))
  ).reduce((acc, i) => acc + calcTCO2e(i), 0);
  
  const scope2MarketTotal = currentBOM.filter(i => 
    i.scope === 'Scope 2' && (i.scope2Method ? i.scope2Method === 'market' : i.name.toLowerCase().includes('ppa'))
  ).reduce((acc, i) => acc + calcTCO2e(i), 0);

  const scope3Total = currentBOM.filter(i => (i.scope || 'Scope 3') === 'Scope 3').reduce((acc, i) => acc + calcTCO2e(i), 0);
  
  // Location-Based Grand Total (Default GHG Protocol Boundary)
  const grandTotal = scope1Total + scope2LocationTotal + scope3Total;

  // Chart Data: Scope Breakdown Donut
  const scopeChartData = [
    { name: 'Scope 1 (Direct)', value: parseFloat(scope1Total.toFixed(3)), color: '#9333ea', rawName: 'Scope 1' },
    { name: 'Scope 2 (Location)', value: parseFloat(scope2LocationTotal.toFixed(3)), color: '#2563eb', rawName: 'Scope 2' },
    { name: 'Scope 3 (Value Chain)', value: parseFloat(scope3Total.toFixed(3)), color: '#f59e0b', rawName: 'Scope 3' }
  ].filter(d => d.value > 0);

  // Chart Data: Top 5 Emitting Line Items
  const top5ItemsData = [...currentBOM]
    .map(i => {
      const val = calcTCO2e(i);
      const shortName = i.name.length > 24 ? i.name.slice(0, 22) + '...' : i.name;
      const color = i.scope === 'Scope 1' ? '#9333ea' : i.scope === 'Scope 2' ? '#2563eb' : '#f59e0b';
      return {
        name: shortName,
        fullName: i.name,
        footprint: parseFloat(val.toFixed(3)),
        scope: i.scope || 'Scope 3',
        color: color
      };
    })
    .sort((a, b) => b.footprint - a.footprint)
    .slice(0, 5);

  // Filtered Items
  const filteredItems = currentBOM.filter(i => {
    if (riskFilter === 'ALL') return true;
    return (i.risk || 'LOW') === riskFilter;
  });

  // Add Item from Preset Dropdown
  const handleAddPreset = () => {
    if (!quickPreset) return;
    const factorObj = INDIA_GHG_FACTORS.find(f => f.key === quickPreset);
    if (!factorObj) return;

    const newItem = {
      id: Date.now(),
      name: factorObj.name,
      qty: parseFloat(quickQty) || 100,
      unit: factorObj.unit,
      process: `India GHG Factor: ${factorObj.name}`,
      ef: factorObj.ef,
      sim: 1.0,
      ter: 1, ger: 1, tir: 1,
      risk: 'LOW',
      scope: factorObj.scope,
      scope3Category: factorObj.scope3Category || 'Cat 1: Purchased Goods & Services',
      gwpBasis: factorObj.gwpBasis || 'IPCC AR6',
      sourceUrl: factorObj.sourceUrl,
      status: 'Preset Verified',
      approved: true,
      notes: factorObj.notes
    };

    setCurrentBOM([newItem, ...currentBOM]);
    setQuickPreset('');
    showToast(`Added ${factorObj.name} (${quickQty} ${factorObj.unit})`);
  };

  // Inline Qty Edit
  const handleQtyChange = (id, newQty) => {
    const val = parseFloat(newQty);
    if (isNaN(val) || val < 0) return;
    setCurrentBOM(currentBOM.map(item => item.id === id ? { ...item, qty: val } : item));
  };

  // Toggle Approved Status
  const toggleApprove = (id) => {
    setCurrentBOM(currentBOM.map(item => item.id === id ? { ...item, approved: !item.approved } : item));
  };

  // Delete Row
  const handleDeleteRow = (id) => {
    setCurrentBOM(currentBOM.filter(item => item.id !== id));
    showToast("Line item deleted.");
  };

  // Approve All Low Risk
  const handleApproveAllLowRisk = () => {
    setCurrentBOM(currentBOM.map(item => item.risk === 'LOW' ? { ...item, approved: true } : item));
    showToast("Approved all low-risk line items.");
  };

  // Clear Table
  const handleClearTable = () => {
    if (window.confirm("Clear all items from inventory?")) {
      setCurrentBOM([]);
      showToast("Inventory table cleared.");
    }
  };

  // Load Sample Demo Data
  const handleLoadSampleDemo = () => {
    const demoItems = [
      { id: Date.now() + 1, name: "Aluminum Sheet, Primary Ingot 5052-H32", qty: 1450, unit: "kg", process: "Aluminum Sheet Primary Ingot", ef: 14.2, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: true },
      { id: Date.now() + 2, name: "Custom Polyurethane Foam Insert", qty: 320, unit: "pcs", process: "Polyurethane Flexible Foam Fabrication", ef: 4.8, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: true },
      { id: Date.now() + 3, name: "Copper Wire Drawing 12 AWG", qty: 50, unit: "kg", process: "Copper Wire Drawing 12 AWG", ef: 6.5, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: true },
      { id: Date.now() + 4, name: "Grid Electricity (CEA India Grid Mix 2024)", qty: 12000, unit: "kWh", process: "Grid Electricity (CEA India Grid Mix 2024)", ef: 0.716, scope: "Scope 2", scope3Category: "N/A (Scope 2 Location-Based)", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] CEA Verified", approved: true },
      { id: Date.now() + 5, name: "Diesel Fuel (DG Sets & Power Generators)", qty: 500, unit: "Liters", process: "Diesel Fuel Thermal Combustion", ef: 2.6558, scope: "Scope 1", scope3Category: "N/A (Scope 1 Direct)", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] India GHG Factor", approved: true }
    ];
    setCurrentBOM(demoItems);
    showToast("Loaded sample demo inventory data.");
  };

  // Export CBAM CSV
  const handleExportCSV = () => {
    if (currentBOM.length === 0) {
      showToast("No data to export.");
      return;
    }
    let csv = "Item Description,Quantity,Unit,Matched LCI Process,Emission Factor (kgCO2e/unit),Footprint (tCO2e),Scope Category,GHG Protocol Scope 3 Category,GWP Basis,Audit Risk,Status\n";
    currentBOM.forEach(item => {
      let tco2e = (item.result_tco2e !== undefined && item.result_tco2e !== null) ? item.result_tco2e.toFixed(4) : ((item.qty * item.ef) / 1000).toFixed(4);
      csv += `"${item.name.replace(/"/g, '""')}",${item.qty},"${item.unit}","${item.process.replace(/"/g, '""')}",${item.ef},${tco2e},"${item.scope}","${item.scope3Category || 'Cat 1: Purchased Goods'}","${item.gwpBasis || 'IPCC AR6'}","${item.risk}","${item.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ECredits_BOM_LCI_Inventory_${Date.now()}.csv`;
    link.click();
    showToast("Exported CBAM Inventory CSV.");
  };

  return (
    <div className="space-y-6">
      
      {/* UI Fix A: Dominant Full-Width Grand Total Hero Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Total Corporate Carbon Footprint (Location-Based)</span>
              {activePeriod && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  FY{activePeriod.year} {activePeriod.isBaseYear ? '• Base Year' : ''}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-tight">
                {grandTotal.toFixed(3)}
              </span>
              <span className="text-xl md:text-2xl font-bold text-emerald-400 font-mono">tCO₂e</span>
            </div>
            <p className="text-xs text-slate-300 font-medium max-w-xl mt-2 leading-relaxed">
              Consolidated across Scope 1 direct fuel combustion, Scope 2 electricity consumption, and Scope 3 upstream/downstream value chain.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <div className="text-left pr-4 border-r border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Inventory Size</span>
              <span className="text-lg font-black text-white font-mono">{currentBOM.length} Items</span>
            </div>
            <div className="text-left pr-4 border-r border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Sign-Off</span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                {approvedItemsCount} / {currentBOM.length}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Accounting Standard</span>
              <span className="text-xs font-bold text-slate-200 mt-1 block">ISO 14064 & GHG Protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scope 1, 2, 3 Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Scope 1 Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scope 1: Direct Fuels</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">Scope 1</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-3">
            {scope1Total.toFixed(3)} <span className="text-xs font-bold text-slate-500">tCO₂e</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            {grandTotal > 0 ? ((scope1Total / grandTotal) * 100).toFixed(1) : 0}% of inventory footprint
          </div>
        </div>

        {/* Scope 2 Dual Reporting Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scope 2: Purchased Power</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">Scope 2</span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-3">
            {scope2LocationTotal.toFixed(3)} <span className="text-xs font-bold text-slate-500">tCO₂e (Location)</span>
          </div>
          <div className="text-xs font-bold text-emerald-700 font-mono mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>Market PPA:</span>
            <span>{scope2MarketTotal.toFixed(3)} tCO₂e</span>
          </div>
        </div>

        {/* Scope 3 Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scope 3: Value Chain</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">Scope 3</span>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-3">
            {scope3Total.toFixed(3)} <span className="text-xs font-bold text-slate-500">tCO₂e</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            {grandTotal > 0 ? ((scope3Total / grandTotal) * 100).toFixed(1) : 0}% of inventory footprint
          </div>
        </div>

      </div>

      {/* Feature 2: Two-Panel Emissions Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Scope Breakdown Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Emissions Scope Distribution</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                GHG Protocol
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Proportional breakdown across direct fuel emissions (Scope 1), purchased grid power (Scope 2), and value chain (Scope 3).
            </p>
          </div>

          <div className="h-64 w-full my-2">
            {scopeChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No emission data to visualize
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scopeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {scopeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name) => [`${Number(val).toFixed(3)} tCO₂e (${grandTotal > 0 ? ((Number(val) / grandTotal) * 100).toFixed(1) : 0}%)`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-slate-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 block">Scope 1</span>
              <span className="font-mono font-black text-purple-900">{scope1Total.toFixed(2)}t</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 block">Scope 2</span>
              <span className="font-mono font-black text-blue-900">{scope2LocationTotal.toFixed(2)}t</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 block">Scope 3</span>
              <span className="font-mono font-black text-amber-900">{scope3Total.toFixed(2)}t</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Top 5 Emitting Line Items (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Top 5 Decarbonization Levers (Key Emitters)</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Pareto Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Identifies the highest emission intensity activity lines in your inventory to prioritize decarbonization ROI.
            </p>
          </div>

          <div className="h-64 w-full my-2">
            {top5ItemsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                No activity data loaded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={top5ItemsData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" unit=" t" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={130} />
                  <Tooltip 
                    formatter={(val, name, item) => [`${val} tCO₂e`, item.payload.fullName]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="footprint" radius={[0, 8, 8, 0]}>
                    {top5ItemsData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <span>Highest Impact Item: <strong className="text-slate-800 font-bold">{top5ItemsData[0]?.fullName || 'None'}</strong></span>
            <span className="text-emerald-700 font-bold font-mono">{top5ItemsData[0]?.footprint || 0} tCO₂e</span>
          </div>
        </div>

      </div>

      {/* Preset Quick Add Toolbar */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-950/5 rounded-2xl p-8 mb-6 relative overflow-hidden group">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">Quick Add India GHG Factor (Preset Search & Select):</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            {filteredPresets.length} Factors Available
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Search Filter Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              value={quickSearchTerm}
              onChange={(e) => setQuickSearchTerm(e.target.value)}
              placeholder="Search factors (e.g. Diesel, Grid, Coal, Transport...)"
              className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Select Dropdown with Explicit Option Styling */}
          <select 
            value={quickPreset} 
            onChange={(e) => setQuickPreset(e.target.value)}
            className="flex-1 min-w-[260px] text-xs font-bold p-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="" className="bg-white text-slate-900 font-semibold p-2">
              -- Select Verified Factor ({filteredPresets.length} options) --
            </option>
            {filteredPresets.map(f => (
              <option key={f.key} value={f.key} className="bg-white text-slate-900 font-semibold p-2">
                {f.name} ({f.ef} kgCO₂e/{f.unit}) — [{f.scope}]
              </option>
            ))}
          </select>

          {/* Quantity Input */}
          <input 
            type="number"
            value={quickQty}
            onChange={(e) => setQuickQty(e.target.value)}
            placeholder="Qty"
            className="w-24 text-xs font-bold p-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-mono text-center"
          />

          {/* Add Button */}
          <button 
            onClick={handleAddPreset}
            disabled={!quickPreset}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Lead Auditor Pre-Verification Shield & Quality Assurance Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isAuditReady ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Inventory Quality & Pre-Verification Quality Assurance</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isAuditReady ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'}`}>
                {isAuditReady ? 'INTERNAL REVIEW COMPLETE' : 'PRE-VERIFICATION IN PROGRESS'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Assesses data quality ratings (DQR), primary data ratio, and Scope 3 boundary completeness for third-party verifiers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          {/* DQR Score */}
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Overall DQR Score</span>
            <span className="text-emerald-400 font-mono text-sm font-black">{overallDqr} / 5.0</span>
          </div>

          {/* Primary Data Ratio */}
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Primary Data Ratio</span>
            <span className="text-emerald-400 font-mono text-sm font-black">{primaryDataPercent}%</span>
          </div>

          {/* Scope 3 Gaps */}
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Scope 3 Gaps</span>
            <span className={`font-mono text-sm font-black ${unassignedScope3Count > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {unassignedScope3Count} Unassigned
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xl">
        
        {/* Table Toolbar Header */}
        <div className="p-4 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-3 bg-slate-50/80">
          <div>
            <h2 className="font-black text-sm text-slate-900">BOM & Activity Data Inventory Table</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit quantities, verify factor categories, and approve rows for internal audit preparation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Risk Filter Buttons */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold border border-slate-300/60">
              <button 
                onClick={() => setRiskFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-all ${riskFilter === 'ALL' ? 'bg-emerald-600 text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({currentBOM.length})
              </button>
              <button 
                onClick={() => setRiskFilter('LOW')}
                className={`px-3 py-1 rounded-lg transition-all ${riskFilter === 'LOW' ? 'bg-emerald-600 text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Low Risk
              </button>
              <button 
                onClick={() => setRiskFilter('HIGH')}
                className={`px-3 py-1 rounded-lg transition-all ${riskFilter === 'HIGH' ? 'bg-rose-600 text-white font-black shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                High Risk
              </button>
            </div>

            <button 
              onClick={handleApproveAllLowRisk}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-2 rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              Approve All Low Risk
            </button>

            <button 
              onClick={handleClearTable}
              className="border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Table
            </button>

            <button 
              onClick={handleLoadSampleDemo}
              className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Sample Demo
            </button>

            <button 
              onClick={onOpenImportModal}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              Import BOM / Excel
            </button>

            <button 
              onClick={onOpenGoogleSheetsModal}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Sync Google Sheet
            </button>

            <button 
              onClick={onNavigateToCompliance}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] active:scale-[0.96] flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 stroke-[3]" />
              Generate Report
            </button>

            <button 
              onClick={handleExportCSV}
              className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CBAM CSV
            </button>

          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Approved</th>
                <th className="p-3.5">Item Description</th>
                <th className="p-3.5 text-right">Quantity</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5">LCI Matched Process</th>
                <th className="p-3.5 text-right">EF (kgCO₂e/unit)</th>
                <th className="p-3.5 text-right">Footprint (tCO₂e)</th>
                <th className="p-3.5">Scope Boundary</th>
                <th className="p-3.5">GHG Protocol Scope 3 Category</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2">
                      <div className="font-bold text-sm text-slate-700">No inventory items in table</div>
                      <p className="text-xs">Click <strong>"Import BOM / Excel"</strong> or choose a factor from the <strong>Quick Add Dropdown</strong> above to get started.</p>
                      <button 
                        onClick={handleLoadSampleDemo}
                        className="mt-2 text-xs font-bold text-emerald-600 underline hover:text-emerald-700"
                      >
                        Load Sample Demo Inventory
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const tco2e = (item.result_tco2e !== undefined && item.result_tco2e !== null) ? item.result_tco2e.toFixed(3) : ((item.qty * item.ef) / 1000).toFixed(3);
                  const isApproved = item.approved;
                  const scopeBadge = item.scope === 'Scope 1' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                    item.scope === 'Scope 2' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-amber-100 text-amber-800 border-amber-200';

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${isApproved ? 'bg-emerald-50/20' : ''}`}>
                      <td className="p-3">
                        <button 
                          onClick={() => toggleApprove(item.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                            isApproved 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-slate-300 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        <div>{item.name}</div>
                        {item.sourceUrl && (
                          <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 underline font-normal flex items-center gap-0.5 mt-0.5">
                            <span>Source citation</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          className="w-24 text-right p-1 font-mono font-bold border border-slate-300 rounded outline-none focus:border-emerald-500 bg-white"
                        />
                      </td>
                      <td className="p-3 font-semibold text-slate-600">{item.unit}</td>
                      <td className="p-3 text-slate-600 max-w-[200px] truncate" title={item.process}>
                        {item.process}
                        {item.dataQuality && <div className="text-[10px] text-indigo-600 mt-1">DQR: {item.dataQuality}</div>}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">{item.ef}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700">{tco2e} t</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${scopeBadge}`}>
                          {item.scope || 'Scope 3'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          {item.scope3Category || (item.scope === 'Scope 3' ? 'Cat 1: Purchased Goods' : 'N/A')}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleDeleteRow(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
