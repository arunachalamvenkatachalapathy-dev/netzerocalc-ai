import React, { useState, useMemo } from 'react';
import {
  Target,
  Sparkles,
  TrendingDown,
  Layers,
  ShieldCheck,
  Compass,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Factory,
  Download,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import {
  calculateACA,
  calculateSDA,
  calculateNetZeroTrajectory,
  buildSbtiChartGeometry,
  SECTOR_SDA_BENCHMARKS_2050
} from '../../services/ghg/sbtiService.js';

export default function SbtiTrajectorySimulatorView({
  activeProject,
  activePeriodYear = '2024'
}) {
  // Pull baseline emissions from active project corporate GHG results if available
  const detectedBaseEmissions = useMemo(() => {
    const existingTonnes = activeProject?.corporateGhg?.results?.[activePeriodYear]?.totalLb;
    return existingTonnes && existingTonnes > 0 ? Number(existingTonnes.toFixed(2)) : 147.03;
  }, [activeProject, activePeriodYear]);

  // Method state: 'aca', 'sda', 'netzero'
  const [method, setMethod] = useState('aca');

  // Shared / ACA state
  const [baseYear, setBaseYear] = useState(parseInt(activePeriodYear) || 2024);
  const [targetYear, setTargetYear] = useState(2030);
  const [annualRatePct, setAnnualRatePct] = useState(4.2); // 4.2% default for 1.5C
  const [baseEmissionsTonnes, setBaseEmissionsTonnes] = useState(detectedBaseEmissions);

  // SDA state
  const [sdaSector, setSdaSector] = useState('power');
  const [sdaProjectedOutput, setSdaProjectedOutput] = useState(100000);
  const [sdaConvergenceYear, setSdaConvergenceYear] = useState(2050);

  // Net Zero state
  const [netZeroYear, setNetZeroYear] = useState(2050);
  const [abatementFloorPct, setAbatementFloorPct] = useState(90.0);

  // 1. Calculate Active Method Result
  const acaResult = useMemo(() => {
    return calculateACA({
      baseYear,
      targetYear,
      annualRatePct,
      baseEmissionsTonnes
    });
  }, [baseYear, targetYear, annualRatePct, baseEmissionsTonnes]);

  const sdaResult = useMemo(() => {
    return calculateSDA({
      sector: sdaSector,
      baseYear,
      targetYear,
      convergenceYear: sdaConvergenceYear,
      projectedOutput: sdaProjectedOutput
    });
  }, [sdaSector, baseYear, targetYear, sdaConvergenceYear, sdaProjectedOutput]);

  const netZeroResult = useMemo(() => {
    return calculateNetZeroTrajectory({
      baseYear,
      netZeroYear,
      abatementFloorPct,
      baseEmissionsTonnes
    });
  }, [baseYear, netZeroYear, abatementFloorPct, baseEmissionsTonnes]);

  // 2. Prepare Chart Geometry
  const chartGeometry = useMemo(() => {
    const hist = [
      { year: baseYear - 1, tonnes: baseEmissionsTonnes * 1.05 },
      { year: baseYear, tonnes: baseEmissionsTonnes }
    ];

    let traj = [];
    if (method === 'aca') {
      traj = acaResult.trajectory.map(t => ({ year: t.year, targetTonnes: t.targetTonnes }));
    } else if (method === 'sda') {
      traj = sdaResult.trajectory.map(t => ({ year: t.year, targetTonnes: t.absoluteTonnes }));
    } else {
      traj = netZeroResult.trajectory.map(t => ({ year: t.year, targetTonnes: t.targetTonnes }));
    }

    return buildSbtiChartGeometry({
      historicalPoints: hist,
      targetTrajectory: traj,
      width: 620,
      height: 240
    });
  }, [method, baseYear, baseEmissionsTonnes, acaResult, sdaResult, netZeroResult]);

  // Export Target Schedule to CSV
  const handleExportCSV = () => {
    let rows = [];
    let title = '';

    if (method === 'aca') {
      title = `NetZeroCalc_SBTi_ACA_1.5C_Trajectory_${baseYear}_${targetYear}.csv`;
      rows = [
        ['Year', 'Target Emissions (tCO2e)', 'Cumulative Reduction vs Base (%)', 'Annual Reduction Rate (%)'],
        ...acaResult.trajectory.map(t => [t.year, t.targetTonnes, `${t.reductionFromBasePct}%`, `${t.annualReductionRatePct}%`])
      ];
    } else if (method === 'sda') {
      title = `NetZeroCalc_SBTi_SDA_Intensity_Trajectory_${sdaSector}_${baseYear}_${targetYear}.csv`;
      rows = [
        ['Year', `Intensity (${sdaResult.unit})`, 'Absolute Emissions (tCO2e)', 'Intensity Reduction (%)'],
        ...sdaResult.trajectory.map(t => [t.year, t.intensity, t.absoluteTonnes, `${t.reductionPct}%`])
      ];
    } else {
      title = `NetZeroCalc_SBTi_NetZero_2050_Residual_Schedule_${baseYear}_${netZeroYear}.csv`;
      rows = [
        ['Year', 'Target Emissions (tCO2e)', 'Abatement vs Base (%)'],
        ...netZeroResult.trajectory.map(t => [t.year, t.targetTonnes, `${t.abatementPct}%`])
      ];
    }

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border border-slate-800 shadow-xl text-white">
        <div className="max-w-2xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            Science Based Targets initiative • Net-Zero Standard v1.2
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            SBTi Target Setting &amp; Net-Zero Trajectory Simulator
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Model science-aligned decarbonization pathways. Compare the 1.5°C Absolute Contraction Approach (ACA), sector physical intensity convergence (SDA), and 2050 Net-Zero residual neutralization budgets with permanent carbon removals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Pathway CSV
          </button>
        </div>
      </div>

      {/* Target Methodology Selector Pills */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex-wrap">
        <button
          onClick={() => setMethod('aca')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            method === 'aca'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          Absolute Contraction (ACA)
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">1.5°C / WB2°C</span>
        </button>

        <button
          onClick={() => setMethod('sda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            method === 'sda'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          Sectoral Decarbonization (SDA)
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">Intensity Convergence</span>
        </button>

        <button
          onClick={() => setMethod('netzero')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            method === 'netzero'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Net-Zero 2050 Residuals
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">≥90% Abatement</span>
        </button>
      </div>

      {/* Interactive Controls & Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Parameter Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Target className="w-4 h-4 text-emerald-500" />
            Pathway Parameters
          </h3>

          {/* Base Year & Base Emissions */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Base Year (Inventory Baseline)
              </label>
              <input
                type="number"
                value={baseYear}
                onChange={(e) => setBaseYear(parseInt(e.target.value) || 2024)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Base Emissions (tCO2e)
              </label>
              <input
                type="number"
                step="0.1"
                value={baseEmissionsTonnes}
                onChange={(e) => setBaseEmissionsTonnes(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Prefilled from current NetZeroCalc inventory
              </span>
            </div>

            {/* Method-specific inputs */}
            {method === 'aca' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Near-Term Target Year
                  </label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value={2028}>2028 (4 years)</option>
                    <option value={2030}>2030 (SBTi Standard Near-Term)</option>
                    <option value={2035}>2035 (Long-Term Milestone)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Linear Reduction Rate
                  </label>
                  <select
                    value={annualRatePct}
                    onChange={(e) => setAnnualRatePct(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value={4.2}>4.2% / yr — 1.5°C Alignment (SBTi Mandatory)</option>
                    <option value={2.5}>2.5% / yr — Well-Below 2°C (Legacy)</option>
                    <option value={7.0}>7.0% / yr — Accelerated Decarbonization</option>
                  </select>
                </div>
              </>
            )}

            {method === 'sda' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={sdaSector}
                    onChange={(e) => setSdaSector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    {Object.entries(SECTOR_SDA_BENCHMARKS_2050).map(([k, v]) => (
                      <option key={k} value={k}>{v.name} ({v.unit})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Year Activity Output ({SECTOR_SDA_BENCHMARKS_2050[sdaSector]?.unit?.split('/')[1] || 'units'})
                  </label>
                  <input
                    type="number"
                    value={sdaProjectedOutput}
                    onChange={(e) => setSdaProjectedOutput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {method === 'netzero' && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Net-Zero Target Commitment Year
                  </label>
                  <select
                    value={netZeroYear}
                    onChange={(e) => setNetZeroYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value={2040}>2040 (Aggressive Net-Zero)</option>
                    <option value={2045}>2045 (Accelerated Net-Zero)</option>
                    <option value={2050}>2050 (SBTi Standard Net-Zero)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Value-Chain Abatement Floor (Direct Reduction)
                  </label>
                  <select
                    value={abatementFloorPct}
                    onChange={(e) => setAbatementFloorPct(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value={90.0}>90% Abatement (SBTi Minimum Rule)</option>
                    <option value={95.0}>95% Abatement (Heavy Industry/Energy)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Key KPI Metric Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Target Year Target:</span>
              <strong className="font-mono text-slate-900 dark:text-white text-sm">
                {method === 'aca' && `${acaResult.targetEmissionsTonnes} tCO2e`}
                {method === 'sda' && `${sdaResult.targetAbsoluteTonnes} tCO2e`}
                {method === 'netzero' && `${netZeroResult.residualEmissionsTonnes} tCO2e`}
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Required Reduction:</span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {method === 'aca' && `-${acaResult.cumulativeReductionPct}%`}
                {method === 'sda' && `-${sdaResult.intensityReductionPct}%`}
                {method === 'netzero' && `-${netZeroResult.abatementFloorPct}%`}
              </strong>
            </div>

            {method === 'netzero' && (
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Residual Removals Budget:</span>
                <strong className="font-mono text-purple-600 dark:text-purple-400 text-sm">
                  {netZeroResult.residualEmissionsTonnes} tCO2e
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Trajectory Curve Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Trajectory Projection (Base {baseYear} → Target {method === 'netzero' ? netZeroYear : targetYear})
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Historical
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> SBTi 1.5°C Pathway
              </span>
            </div>
          </div>

          {/* SVG Vector Chart */}
          <div className="py-4">
            {chartGeometry && (
              <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-auto max-h-64">
                {/* Horizontal Ticks */}
                {chartGeometry.ticks.map((t, i) => (
                  <g key={i}>
                    <line
                      x1={chartGeometry.padding.left}
                      y1={t.y}
                      x2={chartGeometry.width - chartGeometry.padding.right}
                      y2={t.y}
                      stroke="currentColor"
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartGeometry.padding.left - 8}
                      y={t.y + 3.5}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                    >
                      {t.value}
                    </text>
                  </g>
                ))}

                {/* X-Axis Milestone Labels */}
                {chartGeometry.xLabels.map((xl, i) => (
                  <text
                    key={i}
                    x={xl.x}
                    y={xl.y}
                    textAnchor="middle"
                    className="text-[11px] font-mono font-bold fill-slate-600 dark:fill-slate-400"
                  >
                    {xl.year}
                  </text>
                ))}

                {/* Historical Trajectory Line */}
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  points={chartGeometry.histPolyline}
                />
                {chartGeometry.histPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#94a3b8"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}

                {/* Future Target Trajectory Line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={chartGeometry.targetPolyline}
                />
                {chartGeometry.targetPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            )}
          </div>

          {/* SBTi Neutralization & Mitigation Hierarchy Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-white">
                SBTi Corporate Net-Zero Mitigation Hierarchy Mandate
              </div>
              <p className="text-[11px] leading-relaxed">
                Companies must reach at least <strong>90% absolute emissions abatement</strong> across Scopes 1, 2, and 3 before claiming Net Zero. Any residual emissions (&le; 10%) must be neutralized with verified <strong>permanent carbon dioxide removals (CDR)</strong> with durable geological storage. Interim carbon credits or avoided emissions cannot count toward net-zero targets.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Pathway Milestones Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              SBTi Milestone Target Schedule ({method.toUpperCase()})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Annual trajectory points for disclosure &amp; submission
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4">
                  {method === 'sda' ? `Target Intensity (${sdaResult.unit})` : 'Target Emissions (tCO2e)'}
                </th>
                {method === 'sda' && <th className="py-3 px-4">Absolute Projected Emissions (tCO2e)</th>}
                <th className="py-3 px-4">Cumulative Abatement (%)</th>
                <th className="py-3 px-4">SBTi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {(method === 'aca'
                ? acaResult.trajectory
                : method === 'sda'
                ? sdaResult.trajectory
                : netZeroResult.trajectory
              ).map((row) => (
                <tr key={row.year} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono">
                    {row.year}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {method === 'sda' ? row.intensity : row.targetTonnes}
                  </td>
                  {method === 'sda' && (
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {row.absoluteTonnes} t
                    </td>
                  )}
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {method === 'aca' ? `${row.reductionFromBasePct}%` : method === 'sda' ? `${row.reductionPct}%` : `${row.abatementPct}%`}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      1.5°C Aligned
                    </span>
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
