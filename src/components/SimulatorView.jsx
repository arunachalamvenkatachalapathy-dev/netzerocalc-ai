import React, { useState, useMemo } from 'react';
import { Sliders, TrendingDown, DollarSign, Download, CheckCircle, Info, AlertCircle, BarChart3 } from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { INDIA_GHG_FACTORS } from '../data/indiaGhgFactors.js';

export default function SimulatorView({ currentBOM, showToast, onApplyScenario }) {
  const [recycledPct, setRecycledPct] = useState(25);
  const [renewablePct, setRenewablePct] = useState(50);
  const [efficiencyPct, setEfficiencyPct] = useState(15);
  const [fuelSwitchPct, setFuelSwitchPct] = useState(30);

  // Custom Price Inputs (§ Indicative Market Benchmarks)
  const [carbonPriceInr, setCarbonPriceInr] = useState(1500); // ₹1,500/tCO2e
  const [cbamTariffEur, setCbamTariffEur] = useState(85); // €85/tCO2e
  const [inrEurRate, setInrEurRate] = useState(90); // User-editable INR/EUR rate

  // Baseline Calculation
  const baselineTotal = currentBOM.reduce((acc, i) => {
    if (i.result_tco2e !== undefined && i.result_tco2e !== null) return acc + Number(i.result_tco2e);
    return acc + (i.qty * i.ef / 1000);
  }, 0);

  // Secondary Recycled Factor Lookup
  const secondaryAluminumEf = INDIA_GHG_FACTORS.find(f => f.key === 'Aluminum_Secondary_Recycled')?.ef || 1.80;

  // Sim Matrix Calculation (Using exact database factor swapping)
  const simMatrix = currentBOM.map(item => {
    let factor = item.ef;
    const nameLower = item.name.toLowerCase();

    // 1. Recycled material lever (Swap primary virgin metal factor with secondary database scrap factor)
    if (recycledPct > 0 && nameLower.includes('aluminum')) {
      // Blend primary virgin factor (14.20) with secondary scrap factor (1.80) based on recycledPct
      const recycledFraction = recycledPct / 100;
      factor = (item.ef * (1 - recycledFraction)) + (secondaryAluminumEf * recycledFraction);
    } else if (recycledPct > 0 && (nameLower.includes('steel') || nameLower.includes('copper') || nameLower.includes('plastic'))) {
      factor = factor * (1 - (recycledPct / 100) * 0.70);
    }

    // 2. Renewable PPA lever
    if (renewablePct > 0 && item.scope === 'Scope 2') {
      factor = factor * (1 - (renewablePct / 100));
    }
    // 3. Efficiency lever
    if (efficiencyPct > 0 && (item.scope === 'Scope 1' || item.scope === 'Scope 2')) {
      factor = factor * (1 - (efficiencyPct / 100));
    }
    // 4. Fuel switch lever
    if (fuelSwitchPct > 0 && item.scope === 'Scope 1') {
      factor = factor * (1 - (fuelSwitchPct / 100) * 0.60);
    }

    const baselineTco2e = item.result_tco2e !== undefined && item.result_tco2e !== null 
      ? Number(item.result_tco2e) 
      : (item.qty * item.ef) / 1000;
    
    // For simTco2e, apply the ratio of reduction if result_tco2e exists
    const reductionRatio = item.ef > 0 ? (factor / item.ef) : 1;
    const simTco2e = item.result_tco2e !== undefined && item.result_tco2e !== null
      ? Number(item.result_tco2e) * reductionRatio
      : (item.qty * factor) / 1000;
    const avoidedTco2e = Math.max(0, baselineTco2e - simTco2e);

    return {
      ...item,
      simEf: factor,
      baselineTco2e,
      simTco2e,
      avoidedTco2e
    };
  });

  const netFootprint = simMatrix.reduce((acc, i) => acc + i.simTco2e, 0);
  const avoidedTotal = Math.max(0, baselineTotal - netFootprint);

  // Financial Metrics
  const internalDecarbonizationValueInr = avoidedTotal * (parseFloat(carbonPriceInr) || 1500);
  const cbamSavingsEur = avoidedTotal * (parseFloat(cbamTariffEur) || 85);
  const cbamSavingsInr = cbamSavingsEur * (parseFloat(inrEurRate) || 90);

  // Comparison Chart Data: Baseline vs. Simulated Decarbonization
  const comparisonData = useMemo(() => [
    {
      name: 'Scope 1',
      Baseline: parseFloat(simMatrix.filter(i => i.scope === 'Scope 1').reduce((acc, i) => acc + i.baselineTco2e, 0).toFixed(3)),
      Simulated: parseFloat(simMatrix.filter(i => i.scope === 'Scope 1').reduce((acc, i) => acc + i.simTco2e, 0).toFixed(3))
    },
    {
      name: 'Scope 2',
      Baseline: parseFloat(simMatrix.filter(i => i.scope === 'Scope 2').reduce((acc, i) => acc + i.baselineTco2e, 0).toFixed(3)),
      Simulated: parseFloat(simMatrix.filter(i => i.scope === 'Scope 2').reduce((acc, i) => acc + i.simTco2e, 0).toFixed(3))
    },
    {
      name: 'Scope 3',
      Baseline: parseFloat(simMatrix.filter(i => (i.scope || 'Scope 3') === 'Scope 3').reduce((acc, i) => acc + i.baselineTco2e, 0).toFixed(3)),
      Simulated: parseFloat(simMatrix.filter(i => (i.scope || 'Scope 3') === 'Scope 3').reduce((acc, i) => acc + i.simTco2e, 0).toFixed(3))
    },
    {
      name: 'Total',
      Baseline: parseFloat(baselineTotal.toFixed(3)),
      Simulated: parseFloat(netFootprint.toFixed(3))
    }
  ], [simMatrix, baselineTotal, netFootprint]);

  const handleExportRoadmap = () => {
    const roadmap = {
      timestamp: new Date().toISOString(),
      baselineFootprintTco2e: baselineTotal.toFixed(3),
      netFootprintTco2e: netFootprint.toFixed(3),
      avoidedEmissionsTco2e: avoidedTotal.toFixed(3),
      levers: {
        recycledMaterialScrapPct: recycledPct,
        renewableEnergyPpaPct: renewablePct,
        energyEfficiencyPct: efficiencyPct,
        fuelSwitchingPct: fuelSwitchPct
      },
      indicativeValuation: {
        carbonMarketPriceInrPerTon: carbonPriceInr,
        internalDecarbonizationValueInr: internalDecarbonizationValueInr.toFixed(2),
        cbamTariffSavingsEur: cbamSavingsEur.toFixed(2),
        disclaimer: "Internal decarbonization valuation for strategic planning only. Official carbon credit issuance requires third-party verification under carbon registry standards (Verra VCS / Gold Standard)."
      },
      itemizedMatrix: simMatrix.map(i => ({
        itemName: i.name,
        qty: i.qty,
        unit: i.unit,
        baselineEf: i.ef,
        simulatedEf: i.simEf.toFixed(4),
        avoidedTco2e: i.avoidedTco2e.toFixed(3)
      }))
    };

    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ECredits_WhatIf_Decarbonization_Roadmap_${Date.now()}.json`;
    link.click();
    showToast("Downloaded Decarbonization Roadmap JSON.");
  };

  const handleApplyScenario = () => {
    onApplyScenario({
      recycledPct, renewablePct, efficiencyPct, fuelSwitchPct,
      baselineTotal, netFootprint, avoidedTotal
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>ISO 14064-2 Decarbonization Scenario Engine</span>
          </div>
          <h2 className="text-xl font-black text-white">What-If Decarbonization Simulator</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate Scope 1-3 decarbonization levers. Replaces primary virgin factors with database secondary scrap factors (e.g. 14.20 → 1.80 kgCO₂e/kg) and models location vs. market-based PPA reductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleApplyScenario}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Apply as ISO 14064-2 Scenario
          </button>
          <button 
            onClick={handleExportRoadmap}
            className="border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export Roadmap JSON
          </button>
        </div>
      </div>

      {/* 4 Decarbonization Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Lever 1: Recycled Scrap Factor Swapping */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Recycled Scrap Material</span>
            <span className="text-sm font-black text-emerald-600 font-mono">{recycledPct}%</span>
          </div>
          <input 
            type="range" min="0" max="100" value={recycledPct} 
            onChange={(e) => setRecycledPct(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Swaps primary virgin factors with secondary database scrap factors (Aluminum: 14.20 → 1.80 kgCO₂e/kg).
          </p>
        </div>

        {/* Lever 2: Renewable Energy PPA */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Renewable Energy PPA</span>
            <span className="text-sm font-black text-emerald-600 font-mono">{renewablePct}%</span>
          </div>
          <input 
            type="range" min="0" max="100" value={renewablePct} 
            onChange={(e) => setRenewablePct(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">Procure solar/wind PPA zero-carbon power (Scope 2 Market-based reduction).</p>
        </div>

        {/* Lever 3: Energy Efficiency */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Energy Efficiency</span>
            <span className="text-sm font-black text-emerald-600 font-mono">{efficiencyPct}%</span>
          </div>
          <input 
            type="range" min="0" max="100" value={efficiencyPct} 
            onChange={(e) => setEfficiencyPct(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">VFDs, heat recovery, and LED retrofits (Scope 1 & 2 energy reduction).</p>
        </div>

        {/* Lever 4: Fuel Switching */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Fuel Switching</span>
            <span className="text-sm font-black text-emerald-600 font-mono">{fuelSwitchPct}%</span>
          </div>
          <input 
            type="range" min="0" max="100" value={fuelSwitchPct} 
            onChange={(e) => setFuelSwitchPct(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">Switch boilers/generators from diesel/coal to CNG or biomass pellets.</p>
        </div>

      </div>

      {/* Real-time Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Baseline Card */}
        <div className="bg-slate-100 rounded-xl p-5 border border-slate-300">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Baseline Footprint</div>
          <div className="text-2xl font-extrabold text-slate-800 font-mono">{baselineTotal.toFixed(3)} <span className="text-xs font-bold">tCO₂e</span></div>
          <div className="text-[11px] text-slate-500 mt-2">Unmitigated Current State</div>
        </div>

        {/* Avoided Emissions Card */}
        <div className="bg-emerald-950 text-white rounded-xl p-5 shadow-md">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> Avoided Carbon Emissions
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono">{avoidedTotal.toFixed(3)} <span className="text-xs font-bold text-white">tCO₂e</span></div>
          <div className="text-[11px] text-emerald-400/80 mt-2">Calculated Carbon Reductions</div>
        </div>

        {/* Internal Decarbonization Valuation Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-1">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Internal Decarbonization Value
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">₹{internalDecarbonizationValueInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-slate-500">
            Valued @ ₹{carbonPriceInr}/tCO₂e (Indicative Internal Carbon Price)
          </div>
        </div>

        {/* CBAM Tariff Savings Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-1">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">EU CBAM Tariff Savings</div>
          <div className="text-2xl font-black text-blue-900 font-mono">€{cbamSavingsEur.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          <div className="text-[10px] text-slate-500">
            ≈ ₹{cbamSavingsInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (@ €{cbamTariffEur}/tCO₂e EU ETS)
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <label className="text-[10px] text-slate-400 shrink-0">INR/EUR:</label>
            <input
              type="number" min="1" step="0.5"
              value={inrEurRate}
              onChange={(e) => setInrEurRate(e.target.value)}
              className="w-16 text-[10px] font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[10px] text-slate-400">(check RBI / XE.com)</span>
          </div>
        </div>

      </div>

      {/* Feature 2: Before vs After Decarbonization Comparison Visualizer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Baseline (BAU) vs. Simulated Decarbonization Impact
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing emissions reductions across Scope 1 direct fuels, Scope 2 electricity, Scope 3 materials, and Grand Total.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-sm bg-slate-400 inline-block"></span> Baseline (BAU)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Simulated Net
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
              <YAxis unit=" t" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip 
                formatter={(val, name) => [`${val} tCO₂e`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Auditor Disclaimer Box */}
      <div className="p-4 bg-amber-50 rounded-xl text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold text-slate-900">Methodology & Regulatory Disclaimer on Financial Values:</div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            Internal decarbonization valuation ($₹$) represents calculated internal carbon cost savings for strategic planning. It <strong>does NOT</strong> constitute registry-issued carbon credits (Verra VCS / Gold Standard). Official carbon credit issuance requires project validation, monitoring, and independent third-party verification under carbon credit registry rules.
          </p>
        </div>
      </div>

      {/* Itemized Substitution Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-extrabold text-sm text-slate-900">Line-Item Specific Factor Swapping & Decarbonization Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3">Unit</th>
                <th className="p-3 text-right">Baseline EF</th>
                <th className="p-3 text-right">Simulated EF</th>
                <th className="p-3 text-right">Baseline (tCO₂e)</th>
                <th className="p-3 text-right">Simulated (tCO₂e)</th>
                <th className="p-3 text-right">Avoided (tCO₂e)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {simMatrix.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold">{item.name}</td>
                  <td className="p-3 text-right font-mono font-semibold">{item.qty}</td>
                  <td className="p-3 text-slate-600">{item.unit}</td>
                  <td className="p-3 text-right font-mono">{item.ef}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{item.simEf.toFixed(4)}</td>
                  <td className="p-3 text-right font-mono">{item.baselineTco2e.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono font-bold">{item.simTco2e.toFixed(3)}</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-600">
                    +{item.avoidedTco2e.toFixed(3)} t
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
