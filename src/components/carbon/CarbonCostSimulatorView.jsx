import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldAlert,
  AlertOctagon,
  Calculator,
  Download,
  ArrowRight,
  Zap,
  Flame,
  Network,
  Sparkles,
  Sliders,
  CheckCircle2,
  Info,
  Scale,
  Briefcase
} from 'lucide-react';
import {
  CARBON_PRICE_BENCHMARKS,
  CURRENCY_RATES,
  calculateMultiYearCarbonExposure,
  calculateShadowPricingPayback
} from '../../services/ghg/carbonCostService.js';

export default function CarbonCostSimulatorView({
  activeProject,
  activePeriodYear = '2024'
}) {
  // Pull calculated inventory from project state
  const emissionsTonnes = useMemo(() => {
    const existing = activeProject?.corporateGhg?.results?.[activePeriodYear];
    if (existing && existing.totalLb > 0) {
      return {
        scope1: Number(existing.scope1 || 0),
        scope2lb: Number(existing.scope2lb || 0),
        scope3: Number(existing.scope3 || 0),
        totalLb: Number(existing.totalLb || 0)
      };
    }
    // Fallback baseline for initial exploration
    return {
      scope1: 21.62,
      scope2lb: 93.97,
      scope3: 31.43,
      totalLb: 147.03
    };
  }, [activeProject, activePeriodYear]);

  // Controls State
  const [currency, setCurrency] = useState('EUR');
  const [scenario, setScenario] = useState('consensus'); // 'consensus', 'accelerated', 'custom'
  const [customPrice2030, setCustomPrice2030] = useState(145);
  const [customPrice2035, setCustomPrice2035] = useState(200);
  const [scope3PassThroughPct, setScope3PassThroughPct] = useState(50);
  const [abatementRatePct, setAbatementRatePct] = useState(4.2); // 4.2% default for SBTi 1.5C

  // CapEx Shadow Pricing State
  const [capexInvestment, setCapexInvestment] = useState(250000);
  const [annualAvoidedTonnes, setAnnualAvoidedTonnes] = useState(350);
  const [directEnergySavings, setDirectEnergySavings] = useState(25000);
  const [shadowPriceEur, setShadowPriceEur] = useState(145);

  // Currency metadata
  const currMeta = CURRENCY_RATES[currency] || CURRENCY_RATES.EUR;

  // 1. Calculate Multi-Year Carbon Liability Trajectory
  const exposure = useMemo(() => {
    let p30 = 145;
    let p35 = 200;
    if (scenario === 'accelerated') {
      p30 = 250;
      p35 = 320;
    } else if (scenario === 'custom') {
      p30 = customPrice2030;
      p35 = customPrice2035;
    }

    return calculateMultiYearCarbonExposure({
      emissionsTonnes,
      customPrice2030: p30,
      customPrice2035: p35,
      scope3PassThroughRatePct: scope3PassThroughPct,
      currency,
      annualAbatementRatePct: abatementRatePct
    });
  }, [emissionsTonnes, scenario, customPrice2030, customPrice2035, scope3PassThroughPct, currency, abatementRatePct]);

  // 2. Calculate CapEx Shadow Pricing Payback
  const capexResult = useMemo(() => {
    return calculateShadowPricingPayback({
      capexInvestment,
      annualEmissionReductionTonnes: annualAvoidedTonnes,
      shadowCarbonPriceEur: shadowPriceEur,
      directEnergySavingsAnnual: directEnergySavings,
      currency
    });
  }, [capexInvestment, annualAvoidedTonnes, shadowPriceEur, directEnergySavings, currency]);

  // Export Exposure Matrix to CSV
  const handleExportCSV = () => {
    const s = exposure.scenarios;
    const rows = [
      ['Year', 'Carbon Price / Tonne', 'Scope 1 Direct Liability', 'Scope 2 Power Liability', 'Scope 3 Supply Chain Pass-Through', 'Total Annual Carbon Liability', 'BAU Unmitigated Liability'],
      ['2025 (Current)', `${currMeta.symbol}${s.year2025.priceLocal}`, `${currMeta.symbol}${s.year2025.scope1Cost}`, `${currMeta.symbol}${s.year2025.scope2Cost}`, `${currMeta.symbol}${s.year2025.scope3Cost}`, `${currMeta.symbol}${s.year2025.totalCost}`, `${currMeta.symbol}${s.year2025.totalCost}`],
      ['2030 (Medium)', `${currMeta.symbol}${s.year2030.priceLocal}`, `${currMeta.symbol}${s.year2030.scope1Cost}`, `${currMeta.symbol}${s.year2030.scope2Cost}`, `${currMeta.symbol}${s.year2030.scope3Cost}`, `${currMeta.symbol}${s.year2030.totalCost}`, `${currMeta.symbol}${s.year2030.bauTotalCost}`],
      ['2035 (Phase-Out)', `${currMeta.symbol}${s.year2035.priceLocal}`, `${currMeta.symbol}${s.year2035.scope1Cost}`, `${currMeta.symbol}${s.year2035.scope2Cost}`, `${currMeta.symbol}${s.year2035.scope3Cost}`, `${currMeta.symbol}${s.year2035.totalCost}`, `${currMeta.symbol}${s.year2035.bauTotalCost}`]
    ];

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetZeroCalc_Carbon_Cost_Exposure_${currency}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-8 border border-slate-800 shadow-2xl overflow-hidden text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
              <Briefcase className="w-3.5 h-3.5" />
              CFO Decarbonization Intelligence • Executive Brief 03
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Carbon Cost Exposure &amp; Shadow Pricing
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Quantify balance sheet liability and cost inflation under escalating carbon tax and EU ETS trajectories (€145/t by 2030, €200/t by 2035). Test internal shadow carbon pricing to accelerate green CapEx paybacks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Export Carbon Balance Sheet
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            2025 Current Liability
            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">€70/t</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {currMeta.symbol}{exposure.scenarios.year2025.totalCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct compliance + power pass-through</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 shadow-xs bg-emerald-50/20">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-between">
            2030 Exposure Target
            <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">€145/t</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
            {currMeta.symbol}{exposure.scenarios.year2030.totalCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            BAU Unmitigated: {currMeta.symbol}{exposure.scenarios.year2030.bauTotalCost.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            2035 Free-Allowance Zero
            <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">€200/t</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {currMeta.symbol}{exposure.scenarios.year2035.totalCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            BAU Unmitigated: {currMeta.symbol}{exposure.scenarios.year2035.bauTotalCost.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-xs bg-purple-50/20">
          <div className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center justify-between">
            Decarbonization Savings
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-2">
            {currMeta.symbol}{exposure.cumulativeSavingsBy2035.toLocaleString()}
          </div>
          <div className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-1">
            Avoided tax liability through 2035 at {abatementRatePct}%/yr pace
          </div>
        </div>

      </div>

      {/* 3. Parameter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            Pricing Scenarios &amp; Pass-Through Assumptions
          </h3>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {Object.keys(CURRENCY_RATES).map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currency === cur
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {CURRENCY_RATES[cur].symbol} {cur}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Pricing Trajectory Scenario */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              EUA / Carbon Price Trajectory
            </label>
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="consensus">EU ETS Consensus (€145/2030, €200/2035)</option>
              <option value="accelerated">Accelerated 1.5°C Stress Test (€250/2030, €320/2035)</option>
              <option value="custom">Custom Carbon Price Trajectory</option>
            </select>
            <span className="text-[10px] text-slate-400 block">
              Aligned with IEA Net Zero and EU CBAM regulation
            </span>
          </div>

          {/* Scope 3 Pass-Through Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Scope 3 Supplier Pass-Through Rate
              </label>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{scope3PassThroughPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={scope3PassThroughPct}
              onChange={(e) => setScope3PassThroughPct(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              Proportion of upstream supplier carbon taxes passed to your procurement cost
            </span>
          </div>

          {/* Annual Decarbonization Abatement Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Annual Emissions Abatement Pace
              </label>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">-{abatementRatePct}% / yr</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={abatementRatePct}
              onChange={(e) => setAbatementRatePct(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              SBTi 1.5°C baseline pace: 4.2%/yr linear reduction
            </span>
          </div>

        </div>

        {/* Custom Price Inputs if selected */}
        {scenario === 'custom' && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Custom 2030 Carbon Price (€/tCO2e)
              </label>
              <input
                type="number"
                value={customPrice2030}
                onChange={(e) => setCustomPrice2030(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Custom 2035 Carbon Price (€/tCO2e)
              </label>
              <input
                type="number"
                value={customPrice2035}
                onChange={(e) => setCustomPrice2035(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Financial Liability Breakdown Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Corporate Carbon Balance Sheet Liability Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Values in {currMeta.label}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Milestone Horizon</th>
                <th className="py-3 px-4">Carbon Price</th>
                <th className="py-3 px-4">Scope 1 Direct Liability</th>
                <th className="py-3 px-4">Scope 2 Power Tariff Exposure</th>
                <th className="py-3 px-4">Scope 3 Supply Chain Pass-Through</th>
                <th className="py-3 px-4">Total Mitigated Liability</th>
                <th className="py-3 px-4">BAU Unmitigated Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  2025 Baseline
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {currMeta.symbol}{exposure.scenarios.year2025.priceLocal}/t
                </td>
                <td className="py-3.5 px-4 font-medium text-amber-600 dark:text-amber-400">
                  {currMeta.symbol}{exposure.scenarios.year2025.scope1Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-medium text-blue-600 dark:text-blue-400">
                  {currMeta.symbol}{exposure.scenarios.year2025.scope2Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-medium text-purple-600 dark:text-purple-400">
                  {currMeta.symbol}{exposure.scenarios.year2025.scope3Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {currMeta.symbol}{exposure.scenarios.year2025.totalCost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  {currMeta.symbol}{exposure.scenarios.year2025.totalCost.toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition bg-emerald-50/10">
                <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                  2030 Consensus Target
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {currMeta.symbol}{exposure.scenarios.year2030.priceLocal}/t
                </td>
                <td className="py-3.5 px-4 font-medium text-amber-600 dark:text-amber-400">
                  {currMeta.symbol}{exposure.scenarios.year2030.scope1Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-medium text-blue-600 dark:text-blue-400">
                  {currMeta.symbol}{exposure.scenarios.year2030.scope2Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-medium text-purple-600 dark:text-purple-400">
                  {currMeta.symbol}{exposure.scenarios.year2030.scope3Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-300">
                  {currMeta.symbol}{exposure.scenarios.year2030.totalCost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-rose-500 font-bold">
                  {currMeta.symbol}{exposure.scenarios.year2030.bauTotalCost.toLocaleString()}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-amber-700 dark:text-amber-400">
                  2035 Free-Allowance Zero
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                  {currMeta.symbol}{exposure.scenarios.year2035.priceLocal}/t
                </td>
                <td className="py-3.5 px-4 font-medium text-amber-600 dark:text-amber-400">
                  {currMeta.symbol}{exposure.scenarios.year2035.scope1Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-medium text-blue-600 dark:text-blue-400">
                  {currMeta.symbol}{exposure.scenarios.year2035.scope2Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-medium text-purple-600 dark:text-purple-400">
                  {currMeta.symbol}{exposure.scenarios.year2035.scope3Cost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 font-bold text-amber-700 dark:text-amber-300">
                  {currMeta.symbol}{exposure.scenarios.year2035.totalCost.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-rose-500 font-bold">
                  {currMeta.symbol}{exposure.scenarios.year2035.bauTotalCost.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Internal Shadow Carbon Pricing CapEx Hurdle Simulator */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Internal Shadow Carbon Pricing — CapEx Hurdle Rate Engine
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            De-risking capital investments against future regulatory carbon prices
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CapEx Inputs Form */}
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              When evaluating energy efficiency, solar PPAs, or equipment electrification, incorporating an internal shadow carbon price (€145/t) quantifies the risk of inaction and dramatically improves project IRR.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Proposed CapEx Investment ({currMeta.symbol})
                </label>
                <input
                  type="number"
                  value={capexInvestment}
                  onChange={(e) => setCapexInvestment(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Annual Emissions Avoided (tCO2e)
                </label>
                <input
                  type="number"
                  value={annualAvoidedTonnes}
                  onChange={(e) => setAnnualAvoidedTonnes(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Direct Energy Savings / Yr ({currMeta.symbol})
                </label>
                <input
                  type="number"
                  value={directEnergySavings}
                  onChange={(e) => setDirectEnergySavings(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Internal Shadow Carbon Price (€/t)
                </label>
                <input
                  type="number"
                  value={shadowPriceEur}
                  onChange={(e) => setShadowPriceEur(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Payback Comparison Result Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Investment Hurdle Acceleration
              </div>
              <div className="text-lg font-extrabold">
                Shadow Carbon Payback Comparison
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Traditional Payback</div>
                <div className="text-2xl font-black text-slate-300 mt-1 font-mono">
                  {capexResult.traditionalPaybackYears} <span className="text-sm font-sans">years</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Energy savings only</div>
              </div>

              <div>
                <div className="text-xs text-emerald-400 font-bold">Shadow-Priced Payback</div>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  {capexResult.shadowPaybackYears} <span className="text-sm font-sans">years</span>
                </div>
                <div className="text-[10px] text-emerald-500/80 mt-0.5">Energy + avoided carbon cost</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Payback accelerated by {capexResult.paybackReductionYears} years
              </span>
              <span className="font-mono text-[11px] font-bold">
                +{currMeta.symbol}{capexResult.carbonCostAvoidedAnnual.toLocaleString()}/yr benefit
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
