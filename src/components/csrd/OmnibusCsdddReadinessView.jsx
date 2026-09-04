import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Layers,
  Scale,
  Building2,
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  Info,
  Sliders,
  ExternalLink,
  Plus,
  Trash2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Flame,
  Zap,
  Target,
  ArrowUpRight,
  RefreshCw,
  Save,
  Check
} from 'lucide-react';
import {
  OMNIBUS_STANDARDS_DATA,
  OMNIBUS_SUMMARY,
  NSF_WATCHLIST,
  evaluateCsdddScope,
  CSDDD_6_STEPS,
  CSDDD_CSRD_BRIDGE_DATA,
  calculateCsdddRiskScore,
  evaluateDueDiligenceReadiness,
  evaluateTransitionPlanArt22,
  createDefaultCsdddWorkspace,
  exportCsdddWorkspaceToJson,
  exportCsdddActionsToCsv,
  exportCsdddSuppliersToCsv
} from '../../services/csrd/omnibusCsdddService.js';
import { calculateCorporateGhg } from '../../services/ghg/calculationEngine.js';

const STORAGE_KEY = 'netzerocalc_csddd_workspace_v1';

export default function OmnibusCsdddReadinessView({
  activeProject,
  activePeriodYear = '2024',
  onNavigateToTab
}) {
  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState('audit'); // 'audit', 'scope', 'due-diligence', 'bridge', 'risks', 'transition'
  
  // Workspace State
  const [workspace, setWorkspace] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved CSDDD workspace:', e);
    }
    return createDefaultCsdddWorkspace();
  });

  const [saveStatus, setSaveStatus] = useState('saved');

  // Autosave to localStorage
  useEffect(() => {
    try {
      setSaveStatus('saving');
      const timer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
        setSaveStatus('saved');
      }, 500);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('LocalStorage autosave failed:', e);
      setSaveStatus('error');
    }
  }, [workspace]);

  // Tab 1 State: Omnibus Audit
  const [selectedStandardStd, setSelectedStandardStd] = useState('ESRS 2');
  const [nsfSearchQuery, setNsfSearchQuery] = useState('');
  const [isNsfExpanded, setIsNsfExpanded] = useState(false);

  // Tab 2 State: Scope Checker
  const [scopeInputs, setScopeInputs] = useState(() => {
    return workspace.scopeCheck?.inputs || {
      companyType: 'eu',
      employees: 2500,
      turnoverM: 650,
      euTurnoverM: 550,
      royaltiesM: 30,
      franchiseTurnoverM: 95
    };
  });

  const scopeResult = useMemo(() => {
    return evaluateCsdddScope(scopeInputs);
  }, [scopeInputs]);

  const handleScopeInputChange = (field, val) => {
    setScopeInputs(prev => {
      const updated = { ...prev, [field]: val };
      setWorkspace(ws => ({
        ...ws,
        scopeCheck: {
          inputs: updated,
          result: evaluateCsdddScope(updated),
          updatedAt: new Date().toISOString()
        }
      }));
      return updated;
    });
  };

  // Tab 3 State: 6-Step Due Diligence
  const ddReadiness = useMemo(() => {
    return evaluateDueDiligenceReadiness(workspace.dueDiligenceChecks || {});
  }, [workspace.dueDiligenceChecks]);

  const handleToggleRequirement = (reqId) => {
    setWorkspace(ws => {
      const current = { ...(ws.dueDiligenceChecks || {}) };
      current[reqId] = !current[reqId];
      return { ...ws, dueDiligenceChecks: current };
    });
  };

  // Tab 4 State: 34 Bridge
  const [bridgeStdFilter, setBridgeStdFilter] = useState('ALL');
  const [bridgeSearch, setBridgeSearch] = useState('');
  const [bridgeStatuses, setBridgeStatuses] = useState(() => {
    const initial = {};
    CSDDD_CSRD_BRIDGE_DATA.forEach(b => {
      initial[b.id] = 'Ready to populate';
    });
    return initial;
  });

  const filteredBridge = useMemo(() => {
    return CSDDD_CSRD_BRIDGE_DATA.filter(b => {
      const matchesStd = bridgeStdFilter === 'ALL' || b.std === bridgeStdFilter;
      const q = bridgeSearch.toLowerCase();
      const matchesSearch = !q ||
        b.csrdId.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.csdddArticle.toLowerCase().includes(q) ||
        b.csdddRequirement.toLowerCase().includes(q);
      return matchesStd && matchesSearch;
    });
  }, [bridgeStdFilter, bridgeSearch]);

  // Tab 5 State: Risk Register & Supplier
  const [newRisk, setNewRisk] = useState({
    desc: '',
    category: 'human_rights',
    supplierId: '',
    severity: 3,
    likelihood: 3,
    urgency: 2,
    control: 2
  });

  const calculatedRiskPreview = useMemo(() => {
    return calculateCsdddRiskScore(newRisk);
  }, [newRisk]);

  const handleAddRisk = (e) => {
    e.preventDefault();
    if (!newRisk.desc.trim()) return;
    const scoreObj = calculateCsdddRiskScore(newRisk);
    const riskItem = {
      id: 'r_' + Date.now(),
      ...scoreObj,
      createdAt: new Date().toISOString()
    };
    setWorkspace(ws => ({
      ...ws,
      risks: [riskItem, ...ws.risks]
    }));
    setNewRisk({
      desc: '',
      category: 'human_rights',
      supplierId: '',
      severity: 3,
      likelihood: 3,
      urgency: 2,
      control: 2
    });
  };

  const handleRemoveRisk = (id) => {
    setWorkspace(ws => ({
      ...ws,
      risks: ws.risks.filter(r => r.id !== id),
      actions: ws.actions.map(a => a.riskId === id ? { ...a, riskId: '' } : a)
    }));
  };

  const [newAction, setNewAction] = useState({
    owner: '',
    deadline: '',
    details: '',
    riskId: '',
    status: 'open'
  });

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newAction.owner.trim() || !newAction.details.trim()) return;
    const actionItem = {
      id: 'act_' + Date.now(),
      ...newAction,
      createdAt: new Date().toISOString()
    };
    setWorkspace(ws => ({
      ...ws,
      actions: [actionItem, ...ws.actions]
    }));
    setNewAction({
      owner: '',
      deadline: '',
      details: '',
      riskId: '',
      status: 'open'
    });
  };

  const handleToggleActionStatus = (actionId) => {
    setWorkspace(ws => ({
      ...ws,
      actions: ws.actions.map(a => {
        if (a.id !== actionId) return a;
        const nextStatus = a.status === 'completed' ? 'open' : a.status === 'in_progress' ? 'completed' : 'in_progress';
        return { ...a, status: nextStatus };
      })
    }));
  };

  const handleRemoveAction = (actionId) => {
    setWorkspace(ws => ({
      ...ws,
      actions: ws.actions.filter(a => a.id !== actionId)
    }));
  };

  // Tab 6 State: Art. 22 Climate Transition Plan
  const activeGhgData = useMemo(() => {
    try {
      const periodData = activeProject?.corporateGhg?.periods?.[activePeriodYear];
      if (!periodData) return null;
      return calculateCorporateGhg(periodData, activeProject?.facilities || []);
    } catch (e) {
      return null;
    }
  }, [activeProject, activePeriodYear]);

  const transitionEvaluation = useMemo(() => {
    const ghgSummary = activeGhgData ? {
      totalTons: activeGhgData.totals.scope1 + activeGhgData.totals.scope2Mb + activeGhgData.totals.scope3,
      scope1Tons: activeGhgData.totals.scope1,
      scope2MbTons: activeGhgData.totals.scope2Mb,
      scope3Tons: activeGhgData.totals.scope3
    } : null;
    return evaluateTransitionPlanArt22(workspace.transitionPlan || {}, ghgSummary);
  }, [workspace.transitionPlan, activeGhgData]);

  const handleToggleTransitionCheck = (key) => {
    setWorkspace(ws => ({
      ...ws,
      transitionPlan: {
        ...(ws.transitionPlan || {}),
        [key]: !ws.transitionPlan?.[key]
      }
    }));
  };

  // Exporters
  const handleExportJson = () => {
    const json = exportCsdddWorkspaceToJson(workspace);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csddd_readiness_audit_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportActionsCsv = () => {
    const csv = exportCsdddActionsToCsv(workspace.actions, workspace.risks);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csddd_actions_register_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSuppliersCsv = () => {
    const csv = exportCsdddSuppliersToCsv(workspace.suppliers);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csddd_suppliers_register_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetWorkspace = () => {
    if (window.confirm('Reset all CSDDD data to factory defaults? All logged suppliers, risks, and checks will be cleared.')) {
      const def = createDefaultCsdddWorkspace();
      setWorkspace(def);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
    }
  };

  const selectedStandard = useMemo(() => {
    return OMNIBUS_STANDARDS_DATA.find(s => s.std === selectedStandardStd) || OMNIBUS_STANDARDS_DATA[0];
  }, [selectedStandardStd]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Executive Insights */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Executive Brief 02 • Directive (EU) 2024/1760 & CSRD Omnibus
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Post-Omnibus 325 Clusters
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                {saveStatus === 'saved' ? 'Workspace Autosaved' : 'Saving changes...'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              EU CSRD Omnibus Simplification & CSDDD Readiness
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              The Omnibus proposal cuts mandatory CSRD datapoints by <span className="text-emerald-400 font-bold">61%</span> — but does <span className="underline decoration-rose-500 font-semibold">not</span> remove the disclosure obligation, third-party limited assurance, or the Corporate Sustainability Due Diligence Directive underneath it.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Download full CSDDD workspace JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit JSON</span>
            </button>
            <button
              onClick={handleExportActionsCsv}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export Corrective Actions to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>Actions CSV</span>
            </button>
            <button
              onClick={handleResetWorkspace}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-xs font-bold border border-slate-700 hover:border-rose-800/60 transition-all cursor-pointer"
              title="Reset workspace to factory template"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Omnibus Cut</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">61%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">~1,100 → 325 clusters</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Big Three Share</div>
            <div className="text-xl font-black text-blue-400 mt-0.5">51.7%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">ESRS 2, E1 & S1 (168 clusters)</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Non-Phaseable</div>
            <div className="text-xl font-black text-purple-400 mt-0.5">41</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Day-1 mandatory items</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">CSDDD Overlap</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">34</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct duplicate clusters</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">NSF Watchlist</div>
            <div className="text-xl font-black text-rose-400 mt-0.5">19</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Unresolved EFRAG items</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">CSDDD Maturity</div>
            <div className="text-xl font-black text-white mt-0.5">{ddReadiness.overallPct}%</div>
            <div className="text-[10px] text-emerald-400 font-medium mt-0.5">{ddReadiness.maturityTier}</div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'audit', label: '1. Omnibus 61% Audit', icon: Layers, count: '325 Clusters' },
          { id: 'scope', label: '2. CSDDD Scope Checker', icon: Scale, count: scopeResult.inScope ? 'In Scope' : 'Exempt' },
          { id: 'due-diligence', label: '3. OECD 6-Step Framework', icon: CheckCircle2, count: `${ddReadiness.overallPct}% Ready` },
          { id: 'bridge', label: '4. 34 Direct Duplicate Bridge', icon: FileCheck2, count: '34 Shared' },
          { id: 'risks', label: '5. Risk & Supplier Register', icon: AlertTriangle, count: `${workspace.risks.length} Risks` },
          { id: 'transition', label: '6. Art. 22 Transition Plan', icon: Flame, count: transitionEvaluation.isArt22Compliant ? 'Compliant' : `${transitionEvaluation.complianceScore}%` }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/80 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content Rendering */}

      {/* SUBTAB 1: Omnibus 61% Simplification Audit */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          
          {/* Executive Insight Pill */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-950">Simplification is Not Relaxation: </span>
              The headline 61% reduction cuts raw field reporting granularity from 1,100 down to 325 clusters, but the fundamental legal duty to identify impacts, execute value-chain due diligence under CSDDD, and submit the statement for external limited assurance remains 100% legally binding.
            </div>
          </div>

          {/* 11-Standard Segmented Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Post-Omnibus ESRS Datapoint Cluster Allocation</span>
                  <span className="text-xs font-normal text-slate-500">(11 Standards • Click any standard to inspect)</span>
                </h3>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-600 flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1a6b3a]"></span>Retained Exact (71)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#4a9e6b]"></span>Retained Simplified (176)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#e67e22]"></span>Modified (12)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#3a8fc4]"></span>Moved/Merged (26)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#8e44ad]"></span>New (18)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#c0392b]"></span>Removed (3)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#7f8c8d]"></span>No Successor (19)</span>
              </div>
            </div>

            {/* Standard Rows */}
            <div className="space-y-2 pt-2">
              {OMNIBUS_STANDARDS_DATA.map(std => {
                const isSelected = selectedStandardStd === std.std;
                const total = std.rows;
                const retExact = Math.round(std.ret * (71 / 247));
                const retSimp = std.ret - retExact;
                const pct = (val) => `${(val / total) * 100}%`;

                return (
                  <div
                    key={std.std}
                    onClick={() => setSelectedStandardStd(std.std)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-slate-50 border-slate-900 shadow-sm ring-1 ring-slate-900'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                    } ${std.isBigThree ? 'border-l-4 border-l-emerald-600' : ''}`}
                  >
                    <div className="w-20 font-black text-xs text-slate-800 flex items-center gap-1 shrink-0">
                      <span>{std.std}</span>
                      {std.isBigThree && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Core
                        </span>
                      )}
                    </div>

                    <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden flex">
                      {retExact > 0 && <div style={{ width: pct(retExact) }} className="bg-[#1a6b3a]" title={`Retained Exact: ${retExact}`} />}
                      {retSimp > 0 && <div style={{ width: pct(retSimp) }} className="bg-[#4a9e6b]" title={`Retained Simplified: ${retSimp}`} />}
                      {std.mod > 0 && <div style={{ width: pct(std.mod) }} className="bg-[#e67e22]" title={`Modified: ${std.mod}`} />}
                      {std.mov > 0 && <div style={{ width: pct(std.mov) }} className="bg-[#3a8fc4]" title={`Moved/Merged: ${std.mov}`} />}
                      {std.nw > 0 && <div style={{ width: pct(std.nw) }} className="bg-[#8e44ad]" title={`New: ${std.nw}`} />}
                      {std.rem > 0 && <div style={{ width: pct(std.rem) }} className="bg-[#c0392b]" title={`Removed: ${std.rem}`} />}
                      {std.nsf > 0 && <div style={{ width: pct(std.nsf) }} className="bg-[#7f8c8d]" title={`No Successor Found: ${std.nsf}`} />}
                    </div>

                    <div className="w-10 text-right text-xs font-bold text-slate-700 shrink-0">
                      {std.rows}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Inspector Panel for Selected Standard */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Standard Technical Inspector
                </div>
                <h2 className="text-lg font-black text-white mt-0.5">
                  {selectedStandard.std} — {selectedStandard.full}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedStandard.rows} Datapoint Clusters • {selectedStandard.csddd} Direct CSDDD Overlap Links
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  Retained: <strong className="text-emerald-400">{selectedStandard.ret}</strong> ({Math.round((selectedStandard.ret / selectedStandard.rows) * 100)}%)
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  Modified: <strong className="text-amber-400">{selectedStandard.mod}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  Moved/Merged: <strong className="text-blue-400">{selectedStandard.mov}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                  New: <strong className="text-purple-400">{selectedStandard.nw}</strong>
                </span>
                {selectedStandard.nsf > 0 && (
                  <span className="px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 font-bold">
                    No Successor: {selectedStandard.nsf} ⚠
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <strong className="text-white">Authoritative Executive Analysis: </strong>
              {selectedStandard.note}
            </div>
          </div>

          {/* Two Critical Traps / Watchlists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Trap 1: G1-3 Misclassification */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Highest-Risk Misclassification Trap: ESRS G1-3</span>
              </div>
              <h4 className="text-sm font-black text-rose-950">
                G1-3 Label Shift: Anti-Corruption → Targets Related to Business Conduct
              </h4>
              <p className="text-xs text-rose-900 leading-relaxed">
                In post-Omnibus ESRS, <strong>G1-3</strong> retains the same identifier code but changes completely in substance. Pre-Omnibus, G1-3 requested descriptions of anti-corruption prevention and detection procedures. Post-Omnibus, G1-3 exclusively mandates <em>quantitative and qualitative targets</em> related to business conduct. Anti-corruption procedures have shifted to G1-1 and general governance.
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-rose-200/80 text-[11px] text-rose-800 font-medium">
                Recommendation: Do not populate G1-3 with procedural narratives. Ensure G1-3 contains quantifiable business conduct KPIs (e.g. 100% tier-1 code sign-offs).
              </div>
            </div>

            {/* Trap 2: The 19 NSF Items */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <Search className="w-4 h-4 text-slate-500" />
                  <span>The 19 "No Successor Found" (NSF) Watchlist</span>
                </div>
                <button
                  onClick={() => setIsNsfExpanded(!isNsfExpanded)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {isNsfExpanded ? 'Collapse' : `View All (${NSF_WATCHLIST.length})`}
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                These 19 items are <strong>not confirmed deleted</strong>. They are currently unresolved pending EFRAG's formal Basis for Conclusions publication. Treat them as an internal monitoring watchlist.
              </p>

              {isNsfExpanded ? (
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {NSF_WATCHLIST.map(item => (
                    <div key={item.id} className="p-2 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded mr-1.5">{item.code}</span>
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.note}</div>
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        item.risk === 'CRITICAL TRAP' ? 'bg-rose-100 text-rose-800' :
                        item.risk === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.risk}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>19 unresolved items across E3, E5, S1, S2, S3, S4, G1</span>
                  <span className="font-bold text-blue-600 cursor-pointer" onClick={() => setIsNsfExpanded(true)}>Expand Table →</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: CSDDD Scope Checker */}
      {activeSubTab === 'scope' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Input Controls */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>CSDDD Legal Applicability Parameters</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Threshold Reference: Directive (EU) 2024/1760 Art. 2 (Scope) & Art. 37 (Transposition & Phase-In)
                </p>
              </div>

              {/* Company Type Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'eu', label: 'EU Company / Group', desc: 'Registered in EU Member State' },
                  { id: 'non-eu', label: 'Non-EU Company / Group', desc: 'Parent outside EU with EU turnover' },
                  { id: 'franchise', label: 'Franchise / Licensing', desc: 'Royalties & franchise revenue' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleScopeInputChange('companyType', type.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                      scopeInputs.companyType === type.id
                        ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div>{type.label}</div>
                  </button>
                ))}
              </div>

              {/* Sliders & Inputs based on Type */}
              <div className="space-y-5 pt-2">
                {scopeInputs.companyType === 'eu' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Total Worldwide Employees:</span>
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">
                          {scopeInputs.employees.toLocaleString()} emp
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="10000"
                        step="100"
                        value={scopeInputs.employees}
                        onChange={(e) => handleScopeInputChange('employees', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>100</span>
                        <span className="text-amber-600 font-bold">1,000 (General Threshold)</span>
                        <span className="text-purple-600 font-bold">5,000 (Wave 1 Threshold)</span>
                        <span>10,000+</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Worldwide Net Turnover (€ Millions):</span>
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">
                          €{scopeInputs.turnoverM.toLocaleString()}M
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="3000"
                        step="25"
                        value={scopeInputs.turnoverM}
                        onChange={(e) => handleScopeInputChange('turnoverM', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>€50M</span>
                        <span className="text-amber-600 font-bold">€450M (General Threshold)</span>
                        <span className="text-purple-600 font-bold">€1,500M (Wave 1 Threshold)</span>
                        <span>€3,000M+</span>
                      </div>
                    </div>
                  </>
                )}

                {scopeInputs.companyType === 'non-eu' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Net Turnover Generated in the EU (€ Millions):</span>
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">
                        €{scopeInputs.euTurnoverM.toLocaleString()}M
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="3000"
                      step="25"
                      value={scopeInputs.euTurnoverM}
                      onChange={(e) => handleScopeInputChange('euTurnoverM', Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>€50M</span>
                      <span className="text-amber-600 font-bold">€450M (Wave 2)</span>
                      <span className="text-purple-600 font-bold">€1,500M (Wave 1)</span>
                      <span>€3,000M+</span>
                    </div>
                  </div>
                )}

                {scopeInputs.companyType === 'franchise' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Worldwide Royalties Received (€ Millions):</span>
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">
                          €{scopeInputs.royaltiesM.toLocaleString()}M
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="2.5"
                        value={scopeInputs.royaltiesM}
                        onChange={(e) => handleScopeInputChange('royaltiesM', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>€5M</span>
                        <span className="text-amber-600 font-bold">€22.5M (Statutory Threshold)</span>
                        <span>€100M</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Net Franchise Turnover in EU (€ Millions):</span>
                        <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">
                          €{scopeInputs.franchiseTurnoverM.toLocaleString()}M
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="250"
                        step="5"
                        value={scopeInputs.franchiseTurnoverM}
                        onChange={(e) => handleScopeInputChange('franchiseTurnoverM', Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>€10M</span>
                        <span className="text-amber-600 font-bold">€80M (Statutory Threshold)</span>
                        <span>€250M</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Real-Time Scope Verdict Card */}
            <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
              scopeResult.inScope
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Statutory Applicability Verdict
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    scopeResult.inScope ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {scopeResult.inScope ? 'In Scope' : 'Exempt from Direct Duty'}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Compliance Wave & Date:</div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {scopeResult.band}
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Effective Deadline: {scopeResult.date}</span>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-slate-700 bg-white/70 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="font-bold text-slate-900 mb-1">Legal Finding:</div>
                  {scopeResult.reason}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Citation: {scopeResult.legalCitation}
                </div>
              </div>

              {/* Warning note on indirect supply chain pass-through */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600">
                <strong className="text-slate-800">Supply Chain Pass-Through Rule: </strong>
                Even if your company is out of direct scope, tier-1 customers subject to CSDDD will require you to sign Model Contractual Clauses (Art. 19) and submit due diligence records.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 3: OECD 6-Step Due Diligence Framework */}
      {activeSubTab === 'due-diligence' && (
        <div className="space-y-6">
          
          {/* Maturity Score Header */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">
                  OECD 6-Step Corporate Due Diligence Audit
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Directive (EU) 2024/1760 Articles 5–14 statutory audit checklist (22 statutory criteria)
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">CSDDD Readiness Index</div>
                <div className="text-xl font-black text-emerald-600">{ddReadiness.overallPct}%</div>
              </div>
              <div className="h-9 w-px bg-slate-200"></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Status</div>
                <div className="text-xs font-black text-slate-800">{ddReadiness.maturityTier}</div>
              </div>
            </div>
          </div>

          {/* 6 Steps Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CSDDD_6_STEPS.map(s => {
              const stepSummary = ddReadiness.stepBreakdown.find(b => b.step === s.step) || {};
              return (
                <div key={s.step} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                        Step {s.step} • {s.article}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        stepSummary.pct === 100 ? 'bg-emerald-100 text-emerald-800' :
                        stepSummary.pct > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {stepSummary.completedInStep}/{stepSummary.totalInStep} Ready ({stepSummary.pct}%)
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 mt-2">
                      {s.title}
                    </h4>
                    <div className="text-[11px] text-slate-500 mb-3">
                      {s.description}
                    </div>

                    {/* Checkboxes for requirements */}
                    <div className="space-y-2">
                      {s.requirements.map(req => {
                        const isChecked = Boolean(workspace.dueDiligenceChecks?.[req.id]);
                        return (
                          <div
                            key={req.id}
                            onClick={() => handleToggleRequirement(req.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 text-xs ${
                              isChecked
                                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium'
                                : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                              isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="flex-1">
                              <div>{req.text}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                <span className="text-emerald-700 font-semibold">{req.standard}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step Progress Bar */}
                  <div className="pt-2">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${stepSummary.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUBTAB 4: 34 CSDDD / CSRD Direct Duplicate Bridge */}
      {activeSubTab === 'bridge' && (
        <div className="space-y-6">
          
          {/* Bridge Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-blue-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-300">
              <FileCheck2 className="w-4 h-4" />
              <span>Single Workstream Efficiency Architecture</span>
            </div>
            <h3 className="text-lg font-black text-white">
              The 34 Direct Duplicate Datapoints Bridge
            </h3>
            <p className="text-xs text-blue-200 max-w-3xl leading-relaxed">
              Exactly 34 datapoint clusters in CSRD are direct duplicates of CSDDD due diligence requirements. By maintaining unified documentation in NetZeroCalc, completing your CSDDD due diligence registers automatically populates the required CSRD disclosures without duplicate third-party audits.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {['ALL', 'ESRS 2', 'E1', 'S1', 'S2', 'G1'].map(std => (
                <button
                  key={std}
                  onClick={() => setBridgeStdFilter(std)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    bridgeStdFilter === std
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {std}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={bridgeSearch}
                onChange={(e) => setBridgeSearch(e.target.value)}
                placeholder="Search 34 bridge items..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Bridge Cards Table */}
          <div className="space-y-3">
            {filteredBridge.map(item => {
              const status = bridgeStatuses[item.id] || 'Ready to populate';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.csrdId}
                      </span>
                      <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        CSDDD {item.csdddArticle}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Standard {item.std}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800">
                      {item.name}
                    </h4>

                    <div className="text-[11px] text-slate-600">
                      <strong className="text-slate-700">CSDDD Requirement: </strong>
                      {item.csdddRequirement}
                    </div>

                    <div className="text-[11px] text-emerald-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/60 font-medium">
                      ✓ {item.synergyValue}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setBridgeStatuses(prev => ({
                          ...prev,
                          [item.id]: prev[item.id] === 'Ready to populate' ? 'Integrated' : 'Ready to populate'
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        status === 'Integrated'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{status}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* SUBTAB 5: Risk Register & Supplier Due Diligence */}
      {activeSubTab === 'risks' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Logged Suppliers</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{workspace.suppliers.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tier 1 to Tier N</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Active Risks</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{workspace.risks.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">HR & Environmental</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Critical Risks</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {workspace.risks.filter(r => r.score >= 16).length}
              </div>
              <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Score ≥ 16</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-slate-400">Corrective Actions</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{workspace.actions.length}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {workspace.actions.filter(a => a.status === 'completed').length} Completed
              </div>
            </div>
          </div>

          {/* Supplier Register Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Supplier Due Diligence Register</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audited supply chain partners with Model Contractual Clauses (Art. 19)
                </p>
              </div>
              <button
                onClick={handleExportSuppliersCsv}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Supplier Name</th>
                    <th className="pb-2">Country</th>
                    <th className="pb-2">Tier</th>
                    <th className="pb-2">Sector</th>
                    <th className="pb-2">Risk Score</th>
                    <th className="pb-2">Model Clauses</th>
                    <th className="pb-2">Grievance</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workspace.suppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 text-slate-600">{s.country}</td>
                      <td className="py-2.5 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {s.tier}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{s.sector}</td>
                      <td className="py-2.5 font-black text-slate-800">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          s.score >= 16 ? 'bg-rose-100 text-rose-800' :
                          s.score >= 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {s.score}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {s.contractualClause ? (
                          <span className="text-emerald-700 font-bold">✓ Secured</span>
                        ) : (
                          <span className="text-rose-600 font-bold">✗ Missing</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {s.grievanceAccess ? (
                          <span className="text-emerald-700 font-bold">✓ Active</span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Risk Scoring Calculator Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Log New Adverse Impact Risk (Statutory CSDDD Formula)</span>
            </h3>
            <p className="text-xs text-slate-500 -mt-2">
              Formula: <span className="font-mono font-bold text-slate-800">(Severity × Likelihood) + Urgency - Control</span>
            </p>

            <form onSubmit={handleAddRisk} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Risk Description:</label>
                  <input
                    type="text"
                    required
                    value={newRisk.desc}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="e.g. Unverified overtime in tier-2 molding workshop"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category:</label>
                  <select
                    value={newRisk.category}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="human_rights">Human Rights (Labor, Living Wage, Safety)</option>
                    <option value="environmental">Environmental (GHG, Deforestation, Water)</option>
                    <option value="governance">Governance & Anti-Corruption</option>
                  </select>
                </div>
              </div>

              {/* 4 Factor Sliders */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Severity (1-5):</span>
                    <span className="font-mono">{newRisk.severity}</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={newRisk.severity}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, severity: Number(e.target.value) }))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="text-[9px] text-slate-400 mt-0.5">Scale & Irremediability</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Likelihood (1-5):</span>
                    <span className="font-mono">{newRisk.likelihood}</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={newRisk.likelihood}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, likelihood: Number(e.target.value) }))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="text-[9px] text-slate-400 mt-0.5">Probability of Occurrence</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Urgency (1-3):</span>
                    <span className="font-mono">+{newRisk.urgency}</span>
                  </div>
                  <input
                    type="range" min="1" max="3"
                    value={newRisk.urgency}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, urgency: Number(e.target.value) }))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="text-[9px] text-slate-400 mt-0.5">Regulatory Penalty Risk</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Control (1-3):</span>
                    <span className="font-mono">-{newRisk.control}</span>
                  </div>
                  <input
                    type="range" min="1" max="3"
                    value={newRisk.control}
                    onChange={(e) => setNewRisk(prev => ({ ...prev, control: Number(e.target.value) }))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="text-[9px] text-slate-400 mt-0.5">Mitigation Robustness</div>
                </div>
              </div>

              {/* Calculated Result Preview & Submit */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600">Calculated Score:</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {calculatedRiskPreview.score}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    calculatedRiskPreview.score >= 16 ? 'bg-rose-100 text-rose-800' :
                    calculatedRiskPreview.score >= 10 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {calculatedRiskPreview.level.label}
                  </span>
                  <span className="text-[11px] text-slate-500 hidden md:inline">
                    {calculatedRiskPreview.level.action}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Risk to Register</span>
                </button>
              </div>
            </form>
          </div>

          {/* Action Tracker Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Preventative & Corrective Action Tracker (Arts. 7 & 10)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Time-bound corrective mitigation programs with assigned designated owners
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {workspace.actions.map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        act.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        act.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {act.status}
                      </span>
                      <span className="font-bold text-slate-800">Owner: {act.owner}</span>
                      <span className="text-slate-400">• Deadline: {act.deadline || 'N/A'}</span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      {act.details}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleActionStatus(act.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 cursor-pointer"
                    >
                      Cycle Status
                    </button>
                    <button
                      onClick={() => handleRemoveAction(act.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Action Form */}
            <form onSubmit={handleAddAction} className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                required
                placeholder="Action Owner"
                value={newAction.owner}
                onChange={(e) => setNewAction(prev => ({ ...prev, owner: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
              <input
                type="date"
                value={newAction.deadline}
                onChange={(e) => setNewAction(prev => ({ ...prev, deadline: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
              <input
                type="text"
                required
                placeholder="Corrective action details..."
                value={newAction.details}
                onChange={(e) => setNewAction(prev => ({ ...prev, details: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 md:col-span-1"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                + Log Action
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUBTAB 6: Art. 22 Climate Transition Plan */}
      {activeSubTab === 'transition' && (
        <div className="space-y-6">
          
          {/* Article 22 Explainer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Directive (EU) 2024/1760 Art. 22
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Combating Climate Change — Mandatory Paris 1.5°C Transition Plan
                </h3>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Art. 22 Compliance</div>
                <div className="text-xl font-black text-emerald-600">
                  {transitionEvaluation.complianceScore}%
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Companies in scope of CSDDD must adopt and put into effect a transition plan for climate change mitigation. The plan must ensure, through best efforts, that the business model and strategy are compatible with the transition to a sustainable economy and with the limiting of global warming to <strong>1.5°C</strong> in line with the Paris Agreement and EU Climate Law.
            </p>
          </div>

          {/* 5 Mandatory Criteria Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Statutory Plan Criteria (Art. 22 Paragraph 1)
            </h4>

            <div className="space-y-2">
              {transitionEvaluation.checklist.map(item => (
                <div
                  key={item.key}
                  onClick={() => handleToggleTransitionCheck(item.key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    item.passed
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      item.passed ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {item.passed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{item.label}</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.passed ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.passed ? 'Validated' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Bridge to Corporate GHG Calculations */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  NetZeroCalc Corporate GHG Inventory Parity
                </div>
                <h4 className="text-sm font-black text-white mt-0.5">
                  Live Baseline Emissions for Transition Plan Execution
                </h4>
              </div>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('ghg-calculator')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Open GHG Engine</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeGhgData ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Scope 1-3</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                    {activeGhgData.totals.scope1 + activeGhgData.totals.scope2Mb + activeGhgData.totals.scope3 > 0
                      ? (activeGhgData.totals.scope1 + activeGhgData.totals.scope2Mb + activeGhgData.totals.scope3).toFixed(2)
                      : '0.00'} t
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Period FY{activePeriodYear}</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Scope 1 (Direct)</div>
                  <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                    {activeGhgData.totals.scope1.toFixed(2)} t
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Stationary + Mobile</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Scope 2 (Market-Based)</div>
                  <div className="text-lg font-black text-blue-400 font-mono mt-0.5">
                    {activeGhgData.totals.scope2Mb.toFixed(2)} t
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">EACs + Residual Grid</div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Scope 3 (Value Chain)</div>
                  <div className="text-lg font-black text-purple-400 font-mono mt-0.5">
                    {activeGhgData.totals.scope3.toFixed(2)} t
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Categories 1 to 15</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/50 rounded-xl text-xs text-slate-400 border border-slate-700/50 flex items-center justify-between">
                <span>No period inventory recorded yet for FY{activePeriodYear}. Populate stationary and mobile fuels in the GHG Master Calculator.</span>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
