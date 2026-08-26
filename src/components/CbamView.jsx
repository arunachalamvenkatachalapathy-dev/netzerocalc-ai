import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Globe, Scale, TrendingDown, DollarSign, Download, 
  HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Filter, BarChart3, Info
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend 
} from 'recharts';
import { CBAM_BENCHMARKS, CBAM_SECTORS } from '../data/cbamBenchmarks.js';

export default function CbamView({ currentBOM = [], activeProject, userProfile, showToast }) {
  const [selectedSector, setSelectedSector] = useState('All Covered Sectors');
  const [selectedCnCode, setSelectedCnCode] = useState('7606 12 00');
  const [exportTonnes, setExportTonnes] = useState(500);
  const [customIntensity, setCustomIntensity] = useState('');
  const [cbamPriceEur, setCbamPriceEur] = useState(85); // User-editable EU ETS price
  const [inrEurRateInput, setInrEurRateInput] = useState(90); // User-editable INR/EUR rate

  // Filter benchmarks by selected sector
  const filteredBenchmarks = useMemo(() => {
    if (selectedSector === 'All Covered Sectors') return CBAM_BENCHMARKS;
    return CBAM_BENCHMARKS.filter(b => b.sector === selectedSector);
  }, [selectedSector]);

  // Active selected benchmark product
  const activeBenchmark = useMemo(() => {
    return CBAM_BENCHMARKS.find(b => b.cnCode === selectedCnCode) || CBAM_BENCHMARKS[0];
  }, [selectedCnCode]);

  // Compute calculated specific carbon intensity from inventory
  const inventoryTotalTco2e = currentBOM.reduce((acc, i) => {
    if (i.result_tco2e !== undefined && i.result_tco2e !== null) return acc + Number(i.result_tco2e);
    return acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000);
  }, 0);

  // Derived baseline intensity from actual BOM — NO static fallback
  const hasBomData = inventoryTotalTco2e > 0;
  const defaultCalculatedIntensity = hasBomData && exportTonnes > 0
    ? parseFloat((inventoryTotalTco2e / exportTonnes).toFixed(3))
    : null; // null = no data, will show warning

  const actualIntensity = customIntensity !== ''
    ? parseFloat(customIntensity)
    : (defaultCalculatedIntensity ?? 0);

  // Financial Liability Calculations
  const tonnes = Math.max(0, parseFloat(exportTonnes) || 0);
  const price = Math.max(0, parseFloat(cbamPriceEur) || 85);
  const inrEurRate = Math.max(1, parseFloat(inrEurRateInput) || 90);

  const defaultTotalEmissions = tonnes * activeBenchmark.euDefaultBenchmark;
  const verifiedTotalEmissions = tonnes * actualIntensity;
  const avoidedEmissions = Math.max(0, defaultTotalEmissions - verifiedTotalEmissions);

  const defaultLiabilityEur = defaultTotalEmissions * price;
  const verifiedLiabilityEur = verifiedTotalEmissions * price;
  const netSavingsEur = Math.max(0, defaultLiabilityEur - verifiedLiabilityEur);
  const netSavingsInr = netSavingsEur * inrEurRate;
  const savingsPct = defaultTotalEmissions > 0 ? ((avoidedEmissions / defaultTotalEmissions) * 100).toFixed(1) : '0.0';

  // Intensity Comparison Chart Data
  const chartData = [
    {
      name: 'Your Verified Actual',
      intensity: actualIntensity,
      color: '#059669',
      label: 'Verified Facility Data'
    },
    {
      name: 'EU ETS Top-10% Best',
      intensity: activeBenchmark.euEtsBestInClass,
      color: '#3b82f6',
      label: 'EU ETS Benchmark'
    },
    {
      name: 'EU Default Penalty',
      intensity: activeBenchmark.euDefaultBenchmark,
      color: '#ef4444',
      label: 'Punitive Default Benchmark'
    }
  ];

  const handleExportCbamSummary = () => {
    const report = {
      reportingStandard: 'EU Carbon Border Adjustment Mechanism (Regulation EU 2023/956)',
      company: activeProject?.companyName || 'Exporting Installation',
      project: activeProject?.projectName || 'CBAM Declarant Profile',
      declarantName: userProfile?.name || 'Authorized Representative',
      organization: userProfile?.organization || activeProject?.companyName || 'Exporting Installation',
      declarationDate: new Date().toISOString(),
      goodsDetails: {
        sector: activeBenchmark.sector,
        cnCode: activeBenchmark.cnCode,
        productName: activeBenchmark.productName,
        annualExportTonnes: tonnes,
        productionRoute: activeBenchmark.productionRoute
      },
      emissionIntensityComparison: {
        actualVerifiedIntensityTco2ePerTonne: actualIntensity,
        euDefaultBenchmarkTco2ePerTonne: activeBenchmark.euDefaultBenchmark,
        euEtsBestInClassTco2ePerTonne: activeBenchmark.euEtsBestInClass,
        unit: 'tCO2e / tonne of good'
      },
      financialImpactAnalysis: {
        euEtsCarbonPriceEurPerTonne: price,
        defaultCbamTariffLiabilityEur: defaultLiabilityEur.toFixed(2),
        verifiedCbamTariffLiabilityEur: verifiedLiabilityEur.toFixed(2),
        netCommercialSavingsEur: netSavingsEur.toFixed(2),
        netCommercialSavingsInr: netSavingsInr.toFixed(0),
        effectiveTariffReductionPct: `${savingsPct}%`
      },
      regulatoryCitation: activeBenchmark.regulationRef
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CBAM_Benchmark_Audit_${activeBenchmark.cnCode.replace(/\s+/g, '_')}_${Date.now()}.json`;
    link.click();
    showToast && showToast("Exported CBAM Compliance Summary JSON.");
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>EU CBAM Definitive Phase Compliance (Regulation EU 2023/956)</span>
          </div>
          <h2 className="text-xl font-black text-white">CN-Code Benchmark Comparison & Tariff Savings Calculator</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compare your actual verified facility emissions against the European Union's punitive default benchmarks across the 6 covered sectors to quantify real CBAM certificate savings.
          </p>
        </div>

        <button
          onClick={handleExportCbamSummary}
          disabled={!hasBomData && customIntensity === ''}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CBAM Declaration Summary</span>
        </button>
      </div>

      {/* No BOM data warning — show prominently if no inventory is loaded */}
      {!hasBomData && customIntensity === '' && (
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-blue-900">No Inventory Data Loaded — Calculations Are Inactive</div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              To activate CBAM savings calculations, first go to <strong>BOM Workbench</strong> and add your materials inventory. Your actual carbon intensity (tCO₂e per tonne of exported good) will be automatically calculated from your BOM. Alternatively, manually enter your <strong>Verified Intensity</strong> below.
            </p>
          </div>
        </div>
      )}

      {/* Regulatory & Compliance Disclaimer Notice */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-900">Regulatory Advisory & Benchmark Methodology Notice:</div>
          <p className="text-[11px] leading-relaxed text-amber-950">
            Benchmark values sourced from <strong>Regulation (EU) 2023/956</strong>, Commission Implementing Regulation <strong>(EU) 2023/1773</strong>, and <strong>EU ETS Benchmark Implementing Reg (EU) 2021/447</strong>. Verify against current European Commission DG TAXUD guidance before use in official CBAM declaration or commercial contracting.
          </p>
        </div>
      </div>

      {/* Product Selection & Parameter Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">1. Select Exported Product & CN Classification</h3>
          </div>
          
          {/* Sector Filter Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {CBAM_SECTORS.map(sec => (
              <button
                key={sec}
                onClick={() => {
                  setSelectedSector(sec);
                  const firstInSec = sec === 'All Covered Sectors' ? CBAM_BENCHMARKS[0] : CBAM_BENCHMARKS.find(b => b.sector === sec);
                  if (firstInSec) setSelectedCnCode(firstInSec.cnCode);
                }}
                className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedSector === sec 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Product CN Code Dropdown & Trade Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* CN Code Selector */}
          <div className="space-y-1 md:col-span-1">
            <label className="text-xs font-bold text-slate-700 block">Product CN Code & Description</label>
            <select
              value={selectedCnCode}
              onChange={(e) => setSelectedCnCode(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono"
            >
              {filteredBenchmarks.map(b => (
                <option key={b.cnCode} value={b.cnCode}>
                  [{b.cnCode}] {b.productName}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 block">Sector: <strong>{activeBenchmark.sector}</strong> ({activeBenchmark.productionRoute})</span>
          </div>

          {/* Annual Export Tonnes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Annual Export Volume to EU (Tonnes)</label>
            <input
              type="number"
              min="1"
              value={exportTonnes}
              onChange={(e) => setExportTonnes(e.target.value)}
              className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 block">Shipped net mass of covered good</span>
          </div>

          {/* Facility Actual Verified Intensity */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Verified Intensity (tCO₂e/t)</label>
              {customIntensity !== '' && (
                <button 
                  onClick={() => setCustomIntensity('')} 
                  className="text-[10px] text-emerald-700 hover:underline font-bold"
                >
                  Reset to BOM Auto
                </button>
              )}
            </div>
            <input
              type="number"
              step="0.001"
              value={customIntensity !== '' ? customIntensity : (defaultCalculatedIntensity ?? '')}
              onChange={(e) => setCustomIntensity(e.target.value)}
              placeholder={hasBomData ? `Auto: ${defaultCalculatedIntensity}` : 'Enter manually (e.g. 8.45)'}
              className={`w-full text-xs font-black p-2.5 border rounded-xl outline-none font-mono ${
                hasBomData || customIntensity !== ''
                  ? 'bg-emerald-50/60 text-emerald-950 border-emerald-300 focus:border-emerald-600'
                  : 'bg-amber-50 text-amber-900 border-amber-300 focus:border-amber-500'
              }`}
            />
            <span className="text-[10px] font-medium block">
              {customIntensity !== ''
                ? <span className="text-indigo-700">⚙ Manual override active</span>
                : hasBomData
                  ? <span className="text-emerald-700">⬆ Auto-calculated from BOM ({inventoryTotalTco2e.toFixed(3)} tCO₂e ÷ {exportTonnes}t)</span>
                  : <span className="text-amber-700">⚠ Enter BOM data or type intensity manually above</span>
              }
            </span>
          </div>

        </div>
      </div>

      {/* User-configurable market parameters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">2. Market Parameters (User-Configurable)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase block">EU ETS Carbon Price (€/tCO₂e)</label>
            <input
              type="number" min="1" step="1"
              value={cbamPriceEur}
              onChange={(e) => setCbamPriceEur(e.target.value)}
              className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400">EU ETS spot ~€60–100 (check EEX)</span>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-600 uppercase block">INR / EUR Exchange Rate</label>
            <input
              type="number" min="1" step="0.5"
              value={inrEurRateInput}
              onChange={(e) => setInrEurRateInput(e.target.value)}
              className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400">Current rate (check RBI / XE.com)</span>
          </div>
          <div className="col-span-2 flex items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Note:</strong> EU ETS prices fluctuate daily. CBAM tariff liability is assessed at the time of EU Customs declaration. Update these values before each scenario run to reflect current market rates.
            </p>
          </div>
        </div>
      </div>

      {/* Commercial Impact KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* EU Default Penalty Tariff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> EU Default Penalty Liability
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            €{defaultLiabilityEur.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500">
            Based on punitive fallback: <strong>{activeBenchmark.euDefaultBenchmark} tCO₂e/t</strong>
          </div>
        </div>

        {/* Verified Facility Liability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Actual Liability
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            €{verifiedLiabilityEur.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500">
            Based on actual measured: <strong>{actualIntensity} tCO₂e/t</strong>
          </div>
        </div>

        {/* Net CBAM Tariff Savings (EUR) */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Net CBAM Certificate Savings
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono">
            €{netSavingsEur.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400">
            <strong>{savingsPct}%</strong> cost reduction vs. default penalty
          </div>
        </div>

        {/* Value in INR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Total Commercial Advantage (INR)
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{netSavingsInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-500">
            Valued @ ₹{inrEurRate}/€ & €{price}/tCO₂e EU ETS
          </div>
        </div>

      </div>

      {/* Side-by-Side Visual Intensity Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recharts Horizontal Bar Comparison (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Emissions Intensity vs. Regulatory Benchmarks</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Specific embedded carbon intensity ({activeBenchmark.unit}) for CN {activeBenchmark.cnCode}.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              CN {activeBenchmark.cnCode}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit=" t" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 700 }} width={140} />
                <Tooltip 
                  formatter={(val, name, item) => [`${val} tCO₂e/tonne`, item.payload.label]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Bar dataKey="intensity" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex justify-between items-center">
            <span>Avoided Carbon Tariffs per Tonne:</span>
            <strong className="text-emerald-700 font-mono font-bold">
              €{((activeBenchmark.euDefaultBenchmark - actualIntensity) * price).toFixed(2)} / tonne exported
            </strong>
          </div>
        </div>

        {/* Right: Regulatory Reference & Audit Context (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Regulatory Audit Reference</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Official EU Legal Citation</span>
                <span className="font-semibold text-slate-900 block">{activeBenchmark.regulationRef}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Direct & Indirect Scope Boundary</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeBenchmark.includedGases.map(g => (
                    <span key={g} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Auditor Verification Note</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {activeBenchmark.notes}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
            <div className="font-bold text-slate-500">Official Data Sources:</div>
            <div>• Regulation (EU) 2023/956 — CBAM Framework (Annex I & IV)</div>
            <div>• Commission Implementing Regulation (EU) 2023/1773 — Transitional Rules</div>
            <div>• Commission Implementing Regulation (EU) 2021/447 — EU ETS Benchmarks</div>
            <div>• DG TAXUD Default Value Guidance Tables (2024 update)</div>
          </div>
        </div>

      </div>

    </div>
  );
}
