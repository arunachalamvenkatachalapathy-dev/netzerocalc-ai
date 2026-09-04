import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import {
  STANDARDS_ORDER,
  STANDARD_NAMES,
  evaluateDoubleMateriality,
  calculateCsrdProgress,
  evaluateCsrdPeerBenchmark,
  DANISH_BENCHMARK_PILLARS
} from '../../services/csrd/csrdService.js';
import { CSRD_DATAPOINTS } from '../../data/csrdDatapoints.js';

export default function CsrdDoubleMaterialityView({
  activeProject,
  activePeriodYear = '2024',
  onNavigateToTab
}) {
  const companyName = activeProject?.companyName || 'My Enterprise Organization';

  // Sub-tabs: 'matrix', 'dashboard', 'workbench', 'benchmark', 'audit'
  const [activeTab, setActiveTab] = useState('matrix');

  // Materiality scores map: { [std]: { impact: 1-5, financial: 1-5, phaseIn: bool } }
  // Initialize with sensible defaults: E1, S1, G1 marked material
  const [materialityScores, setMaterialityScores] = useState({
    'E1': { impact: 5, financial: 5, phaseIn: false },
    'E2': { impact: 3, financial: 2, phaseIn: false },
    'E5': { impact: 4, financial: 3, phaseIn: false },
    'S1': { impact: 4, financial: 4, phaseIn: false },
    'S2': { impact: 3, financial: 3, phaseIn: false },
    'G1': { impact: 4, financial: 4, phaseIn: false }
  });

  // Peer Benchmark company scores: { [pillarId]: score 1-5 }
  const [peerScores, setPeerScores] = useState({
    gov: 4.0,
    strategy: 3.5,
    decarb: 4.5,
    nature: 3.2,
    value_chain: 3.8
  });

  // User responses to datapoints: { [dpId]: { status, narrative, quantValue, source, reviewer } }
  const [responses, setResponses] = useState({});

  // Filters for Workbench
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [nonPhFilterOnly, setNonPhFilterOnly] = useState(false);
  const [csdddFilterOnly, setCsdddFilterOnly] = useState(false);

  // Materiality evaluation mapping
  const materialityEvaluation = useMemo(() => {
    const map = {};
    STANDARDS_ORDER.forEach(std => {
      if (std === 'ESRS 2') {
        map[std] = { isMaterial: true, status: 'material', rationale: 'Always mandatory by regulation' };
      } else {
        const s = materialityScores[std] || { impact: 1, financial: 1, phaseIn: false };
        const evaluated = evaluateDoubleMateriality(s.impact, s.financial, s.phaseIn);
        map[std] = { ...evaluated, status: evaluated.materialityStatus };
      }
    });
    return map;
  }, [materialityScores]);

  // Overall CSRD Progress
  const progress = useMemo(() => {
    return calculateCsrdProgress(materialityEvaluation, responses);
  }, [materialityEvaluation, responses]);

  // Peer Benchmark Evaluation
  const benchmarkResult = useMemo(() => {
    return evaluateCsrdPeerBenchmark(peerScores);
  }, [peerScores]);

  // Filtered Datapoints for Workbench
  const filteredDatapoints = useMemo(() => {
    return CSRD_DATAPOINTS.filter(dp => {
      // Must belong to a material standard
      const isMat = dp.std === 'ESRS 2' || materialityEvaluation[dp.std]?.isMaterial;
      if (!isMat) return false;

      // Standard filter
      if (selectedStandard !== 'ALL' && dp.std !== selectedStandard) return false;

      // Non-phaseable filter
      if (nonPhFilterOnly && !dp.nonph) return false;

      // CSDDD filter
      if (csdddFilterOnly && dp.csddd === 'None') return false;

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const inRef = (dp.ref || '').toLowerCase().includes(q);
        const inCur = (dp.current || '').toLowerCase().includes(q);
        const inDr = (dp.dr || '').toLowerCase().includes(q);
        const inSec = (dp.section || '').toLowerCase().includes(q);
        if (!inRef && !inCur && !inDr && !inSec) return false;
      }

      return true;
    });
  }, [materialityEvaluation, selectedStandard, nonPhFilterOnly, csdddFilterOnly, searchQuery]);

  // Update response helper
  const handleUpdateResponse = (dpId, field, val) => {
    setResponses(prev => ({
      ...prev,
      [dpId]: {
        ...(prev[dpId] || {}),
        [field]: val,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  // Export Audit CSV
  const handleExportCSV = () => {
    const headers = [
      'Standard', 'DR Code', 'Section', 'Pre-Omnibus Reference', 'Post-Omnibus Ref',
      'Info Type', 'Unit', 'Non-Phaseable', 'CSDDD Overlap', 'Status',
      'Narrative Response', 'Quantitative Value', 'Evidence Source Citation', 'Updated At'
    ];

    const rows = filteredDatapoints.map(dp => {
      const r = responses[dp.id] || {};
      return [
        dp.std,
        dp.dr,
        dp.section,
        dp.ref,
        dp.current,
        dp.type,
        dp.unit,
        dp.nonph ? 'YES' : 'NO',
        dp.csddd,
        r.status || 'not_started',
        r.narrative || '',
        r.quantValue || '',
        r.source || '',
        r.updatedAt || ''
      ].map(v => '"' + String(v).replace(/"/g, '""') + '"');
    });

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetZeroCalc_CSRD_Audit_Trail_${activePeriodYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-8 border border-slate-800 shadow-2xl overflow-hidden text-white">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wider uppercase">
              <FileCheck2 className="w-3.5 h-3.5" />
              Corporate Sustainability Reporting Directive (CSRD) • ESRS Set 1
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              CSRD Double Materiality &amp; ESRS Benchmark Matrix
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Conduct Impact &amp; Financial Materiality scoring across all 11 standards. Disclose across all 325 post-Omnibus datapoints, track non-phaseable SFDR requirements, and benchmark disclosure depth against top Danish global brands.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Export Audit Trail (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* CSDDD & Omnibus Cross-Link Banner */}
      {onNavigateToTab && (
        <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              <strong>EU Omnibus Simplification &amp; CSDDD Due Diligence: </strong>
              34 of your CSRD datapoints directly duplicate CSDDD statutory duties. Unify both under a single corporate workstream.
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('omnibus-csddd')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
          >
            Open Omnibus &amp; CSDDD Tool →
          </button>
        </div>
      )}

      {/* 2. Top Secondary Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex-wrap">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Double Materiality Matrix
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">
            {progress.totalMaterialStandards} Material
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Progress &amp; Readiness
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">
            {progress.completionPct}% Done
          </span>
        </button>

        <button
          onClick={() => setActiveTab('workbench')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'workbench'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          ESRS Datapoint Workbench
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">
            {progress.totalMaterialDatapoints} Datapoints
          </span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'benchmark'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-300" />
          Danish Brands Benchmark (Brief 01)
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20">
            Avg {benchmarkResult.avgCompanyScore}/5.0
          </span>
        </button>
      </div>

      {/* 3. TAB 1: DOUBLE MATERIALITY ASSESSMENT MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-xs flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Double Materiality Principle (EFRAG / CSRD Art. 19a &amp; 29a):</strong> A sustainability topic is material if it meets either <em>Impact Materiality</em> (scale, scope, irremediable character of outward impacts on society/nature) OR <em>Financial Materiality</em> (inward cash flow risks and asset valuation impacts &ge; score 3). Topics scoring &ge; 3 on either axis trigger mandatory disclosures.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STANDARDS_ORDER.map(std => {
              const isEsrs2 = std === 'ESRS 2';
              const s = materialityScores[std] || { impact: 1, financial: 1, phaseIn: false };
              const evalRes = materialityEvaluation[std];

              return (
                <div
                  key={std}
                  className={`p-5 rounded-2xl border transition shadow-xs flex flex-col justify-between space-y-4 ${
                    evalRes.isMaterial
                      ? 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                        {std}
                      </span>
                      {isEsrs2 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300">
                          Always Required
                        </span>
                      ) : evalRes.materialityStatus === 'phasein' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                          Phase-In Relief
                        </span>
                      ) : evalRes.isMaterial ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                          Material
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Not Material
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      {STANDARD_NAMES[std]}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {CSRD_DATAPOINTS.filter(d => d.std === std).length} post-Omnibus datapoints
                    </div>
                  </div>

                  {/* Impact and Financial Materiality Sliders */}
                  {!isEsrs2 && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Impact (Inside-Out)
                          </label>
                          <span className="font-mono font-bold text-blue-600">{s.impact}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={s.impact}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setMaterialityScores(prev => ({
                              ...prev,
                              [std]: { ...(prev[std] || { financial: 1, phaseIn: false }), impact: val }
                            }));
                          }}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            Financial (Outside-In)
                          </label>
                          <span className="font-mono font-bold text-emerald-600">{s.financial}/5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={s.financial}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setMaterialityScores(prev => ({
                              ...prev,
                              [std]: { ...(prev[std] || { impact: 1, phaseIn: false }), financial: val }
                            }));
                          }}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 italic">
                    {evalRes.rationale}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: PROGRESS & READINESS DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Material Standards</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {progress.totalMaterialStandards} <span className="text-sm font-sans font-normal text-slate-400">/ 11</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Activated via double materiality</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-xs bg-blue-50/20">
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300">Overall Completion</div>
              <div className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">
                {progress.completionPct}%
              </div>
              <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">
                {progress.completedDatapoints} of {progress.totalMaterialDatapoints} datapoints
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-xs bg-amber-50/20">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                Non-Phaseable Mandatory
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {progress.nonPhaseableOutstanding}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
                SFDR &amp; Pillar 3 non-deferrable items
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-xs bg-emerald-50/20">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                CSDDD Direct Duplicates
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {progress.csdddDirectDuplicates}
              </div>
              <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                Directly reusable from CSDDD due diligence
              </div>
            </div>
          </div>

          {/* Progress Bars by Standard */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Completion Progress by Material Standard
            </h3>

            <div className="space-y-3">
              {progress.standardsBreakdown.filter(s => s.isMaterial).map(std => (
                <div key={std.std} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800 dark:text-slate-200 font-mono">
                      {std.std} — {std.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {std.completedCount} / {std.totalCount} ({std.completionPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        std.completionPct === 100
                          ? 'bg-emerald-500'
                          : std.completionPct > 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${std.completionPct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. TAB 3: ESRS DATAPOINT WORKBENCH */}
      {activeTab === 'workbench' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search DR, post-Omnibus clause, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={selectedStandard}
                onChange={(e) => setSelectedStandard(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="ALL">All Material Standards</option>
                {STANDARDS_ORDER.filter(s => s === 'ESRS 2' || materialityEvaluation[s]?.isMaterial).map(s => (
                  <option key={s} value={s}>{s} — {STANDARD_NAMES[s]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer text-amber-700 dark:text-amber-400">
                <input
                  type="checkbox"
                  checked={nonPhFilterOnly}
                  onChange={(e) => setNonPhFilterOnly(e.target.checked)}
                  className="rounded accent-amber-600"
                />
                Non-Phaseable Only
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-400">
                <input
                  type="checkbox"
                  checked={csdddFilterOnly}
                  onChange={(e) => setCsdddFilterOnly(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                CSDDD Overlap Only
              </label>
            </div>
          </div>

          {/* Datapoints Feed */}
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Showing {filteredDatapoints.length} matching datapoint clusters
            </div>

            {filteredDatapoints.slice(0, 50).map(dp => {
              const r = responses[dp.id] || {};
              const isDone = r.status === 'complete';

              return (
                <div
                  key={dp.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {dp.std} {dp.dr}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {dp.section}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                        {dp.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {dp.nonph && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300">
                          Non-Phaseable
                        </span>
                      )}
                      {dp.csddd !== 'None' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                          CSDDD: {dp.csddd}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pre vs Post Omnibus Reference */}
                  <div className="text-xs space-y-1">
                    <div className="text-slate-500 text-[11px]">
                      <strong>Pre-Omnibus:</strong> {dp.ref}
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                      <strong>Post-Omnibus Clause:</strong> {dp.current}
                    </div>
                    {dp.notes && (
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 italic">
                        Guidance: {dp.notes}
                      </div>
                    )}
                  </div>

                  {/* Response Inputs */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <textarea
                        rows="2"
                        placeholder="Enter narrative statement or policy disclosure..."
                        value={r.narrative || ''}
                        onChange={(e) => handleUpdateResponse(dp.id, 'narrative', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                      ></textarea>
                    </div>

                    <div className="space-y-2">
                      {(dp.type === 'Quantitative' || dp.type === 'Both') && (
                        <input
                          type="text"
                          placeholder={`Quantitative value (${dp.unit})`}
                          value={r.quantValue || ''}
                          onChange={(e) => handleUpdateResponse(dp.id, 'quantValue', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-900 dark:text-white"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Evidence source / auditor citation..."
                        value={r.source || ''}
                        onChange={(e) => handleUpdateResponse(dp.id, 'source', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* 6. TAB 4: DANISH BRANDS BENCHMARK (BRIEF 01) */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-2xl space-y-1">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                CEO Insights Brief 01 • Wave 1 Analysis
              </div>
              <h2 className="text-xl font-black">
                CSRD Benchmarking: Danish Global Brands
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ten Danish global leaders (Novo Nordisk, Vestas, Maersk, DSV, etc.) averaged 4.0 out of 5 in their first mandatory statements — with a 1.6-point spread between top performers and lagging filers.
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Danish Peer Benchmark</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">4.0 / 5.0</div>
              <div className="text-[11px] text-slate-300">Your Score: {benchmarkResult.avgCompanyScore}/5.0</div>
            </div>
          </div>

          {/* Pillar Assessment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {benchmarkResult.pillars.map(p => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {p.name}
                    </h4>
                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">
                      {p.esrs}
                    </span>
                  </div>
                  <span className={`font-mono text-sm font-black px-2.5 py-1 rounded-lg ${
                    p.userScore >= p.danishPeerAvg
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {p.userScore} / 5.0
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {p.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Self-Assessment Score</span>
                    <span>Peer Avg: {p.danishPeerAvg} | Top Leader: {p.leaderScore}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={p.userScore}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setPeerScores(prev => ({ ...prev, [p.id]: v }));
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Recommendation Callout */}
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Strategic Investor Readiness Assessment: {benchmarkResult.statusBadge}
            </div>
            <p className="text-[11px] leading-relaxed">
              {benchmarkResult.recommendation}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
