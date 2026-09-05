import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
  FileText,
  Clock,
  ArrowRight,
  Sliders,
  Scale
} from 'lucide-react';
import {
  VSME_DATAPOINTS,
  VSME_CAP_ITEMS,
  VSME_MODULES,
  ORGANISATION_SIZES,
  NACE_HIGH_CLIMATE_SECTORS,
  getScopedDatapoints,
  isDatapointEssential,
  isWithinValueChainCap,
  calculateVsmeReadiness,
  syncFromGhgInventory,
  exportVsmeAuditCsv,
  exportVsmeReportText
} from '../../services/vsme/vsmeService.js';

export default function VsmeReportingView({
  activeProject,
  activePeriodYear = '2024',
  onNavigateToTab,
  showToast
}) {
  // Scoping & Entity State
  const [companyName, setCompanyName] = useState(activeProject?.companyName || 'My Enterprise Organization');
  const [reportingYear, setReportingYear] = useState(activePeriodYear || '2024');
  const [country, setCountry] = useState('European Union');
  const [preparer, setPreparer] = useState('Sustainability Officer');
  const [size, setSize] = useState('gt10'); // 'le10' or 'gt10'
  const [moduleOption, setModuleOption] = useState('basic'); // 'basic' or 'both'
  const [nace, setNace] = useState('C'); // Default C (Manufacturing - High Climate)

  // Sub-tabs: 'dashboard', 'workbench', 'cap', 'statement', 'audit'
  const [activeSubTab, setActiveSubTab] = useState('dashboard');

  // Disclosures state: { [dpId]: { status: 'Not started'|'In progress'|'Complete'|'N/A', quant: '', narrative: '', source: '' } }
  const [responses, setResponses] = useState(() => {
    // Initial sync from active project if available
    const initialSync = syncFromGhgInventory(activeProject, Number(activePeriodYear) || 2024);
    return {
      'B1-1': {
        status: 'Complete',
        quant: 'Option A (Basic Module)',
        narrative: 'The undertaking applies Option A (Basic Module) in full compliance with Commission Delegated Regulation C(2026) 5011.',
        source: 'Executive Board Mandate'
      },
      'B1-2': {
        status: 'Complete',
        quant: 'Individual entity basis',
        narrative: 'Sustainability statement prepared on an individual entity basis for statutory operations.',
        source: 'Commercial Registry'
      },
      ...initialSync
    };
  });

  // Workbench filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedSection, setExpandedSection] = useState(null);
  const [copiedStatement, setCopiedStatement] = useState(false);

  // Filter scoped datapoints based on selected module
  const scopedDatapoints = useMemo(() => {
    return getScopedDatapoints(moduleOption);
  }, [moduleOption]);

  // Unique sections in current scope
  const availableSections = useMemo(() => {
    return [...new Set(scopedDatapoints.map(d => d.section))];
  }, [scopedDatapoints]);

  // Readiness calculations and metrics
  const readiness = useMemo(() => {
    return calculateVsmeReadiness({
      datapoints: scopedDatapoints,
      responses,
      size,
      module: moduleOption,
      nace,
      companyName
    });
  }, [scopedDatapoints, responses, size, moduleOption, nace, companyName]);

  // Filtered datapoints for the Workbench
  const filteredDatapoints = useMemo(() => {
    return scopedDatapoints.filter(dp => {
      // Section filter
      if (sectionFilter !== 'all' && dp.section !== sectionFilter) return false;

      // Status filter
      const resp = responses[dp.id] || {};
      const status = resp.status || 'Not started';
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      // Type filter (Essential vs Voluntary)
      const isEss = isDatapointEssential(dp, size);
      if (typeFilter === 'essential' && !isEss) return false;
      if (typeFilter === 'voluntary' && isEss) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = dp.id.toLowerCase().includes(q);
        const matchDr = dp.dr.toLowerCase().includes(q);
        const matchTitle = dp.title.toLowerCase().includes(q);
        const matchVerbatim = (dp.verbatim || '').toLowerCase().includes(q);
        const matchEsrs = (dp.esrs || '').toLowerCase().includes(q);
        if (!matchId && !matchDr && !matchTitle && !matchVerbatim && !matchEsrs) return false;
      }

      return true;
    });
  }, [scopedDatapoints, responses, sectionFilter, statusFilter, typeFilter, searchQuery, size]);

  // Handle individual response update
  const handleResponseChange = (dpId, field, value) => {
    setResponses(prev => ({
      ...prev,
      [dpId]: {
        ...(prev[dpId] || { status: 'Not started', quant: '', narrative: '', source: '' }),
        [field]: value
      }
    }));
  };

  // Trigger sync from Corporate GHG inventory
  const handleSyncGhgInventory = () => {
    const synced = syncFromGhgInventory(activeProject, Number(reportingYear) || 2024);
    const count = Object.keys(synced).length;
    if (count > 0) {
      setResponses(prev => ({ ...prev, ...synced }));
      if (showToast) {
        showToast(`Successfully bridged ${count} emissions & energy datapoints from NetZeroCalc corporate inventory!`, 'success');
      }
    } else {
      if (showToast) {
        showToast('No active emissions found in current project BOM to bridge. Add items in BOM Workbench first.', 'info');
      }
    }
  };

  // Populate sample audit-ready disclosures
  const handleLoadSampleDisclosures = () => {
    const sample = {};
    scopedDatapoints.forEach((dp, idx) => {
      sample[dp.id] = {
        status: 'Complete',
        quant: dp.unit.includes('tCO2') ? '42.5 tCO2e' : dp.unit.includes('MWh') ? '310 MWh' : dp.unit.includes('EUR') ? '1,500,000 EUR' : 'Verified',
        narrative: `Compliance verified for ${dp.title} pursuant to C(2026) 5011 standard requirements. Supporting evidence on file in corporate audit archive.`,
        source: `Internal ESG Registry & Audited Accounts [Ref: VSME-${dp.id}-2026]`
      };
    });
    setResponses(sample);
    if (showToast) {
      showToast(`Loaded ${Object.keys(sample).length} compliant sample disclosures across all in-scope sections.`, 'success');
    }
  };

  // Export RFC 4180 CSV
  const handleDownloadCsv = () => {
    const csv = exportVsmeAuditCsv(scopedDatapoints, responses, companyName, reportingYear);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VSME_Audit_Report_${companyName.replace(/\s+/g, '_')}_FY${reportingYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('VSME RFC 4180 Audit CSV downloaded successfully.', 'success');
  };

  // Export Statement Text
  const handleDownloadStatement = () => {
    const text = exportVsmeReportText({
      company: companyName,
      year: reportingYear,
      preparer,
      country,
      nace,
      size,
      module: moduleOption,
      datapoints: scopedDatapoints,
      responses
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VSME_Sustainability_Statement_${companyName.replace(/\s+/g, '_')}_FY${reportingYear}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Voluntary Sustainability Statement downloaded.', 'success');
  };

  // Copy statement text to clipboard
  const handleCopyStatement = () => {
    const text = exportVsmeReportText({
      company: companyName,
      year: reportingYear,
      preparer,
      country,
      nace,
      size,
      module: moduleOption,
      datapoints: scopedDatapoints,
      responses
    });
    navigator.clipboard.writeText(text);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2500);
    if (showToast) showToast('Statement copied to clipboard.', 'success');
  };

  const isNaceHighClimate = NACE_HIGH_CLIMATE_SECTORS.some(s => s.code === nace);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    VSME Voluntary SME Sustainability Reporting
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    C(2026) 5011 Standard
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Authoritative EFRAG standard for non-listed European SMEs · Annex I Disclosures & Annex II Statutory Value Chain Cap Shield
                </p>
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncGhgInventory}
              title="Sync Scope 1, 2, 3 & Energy from NetZeroCalc BOM"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Bridge GHG Inventory</span>
            </button>

            <button
              onClick={handleLoadSampleDisclosures}
              title="Auto-fill sample disclosures for demonstration"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Fill</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              title="Export complete 16-column RFC 4180 audit trail"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Audit CSV</span>
            </button>

            <button
              onClick={handleDownloadStatement}
              title="Download Statement as publication text document"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statement TXT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scoping & Configuration Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Reporting Scoping & Enterprise Entity Profile
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Governed by Commission Delegated Regulation C(2026) 5011
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Reporting Entity Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Company legal name"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Financial Reporting Period
            </label>
            <input
              type="text"
              value={reportingYear}
              onChange={e => setReportingYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 2026"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Operating Country / Jurisdiction
            </label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Denmark / EU"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Sustainability Preparer
            </label>
            <input
              type="text"
              value={preparer}
              onChange={e => setPreparer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Lead Sustainability Officer"
            />
          </div>
        </div>

        {/* Headcount Size & Module Option Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Headcount Size Selector */}
          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Headcount & Size Relief Bracket
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSize('le10')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  size === 'le10'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-black text-white">Micro-Enterprise</div>
                <div className="text-[10px] text-emerald-400 font-bold">≤ 10 Employees</div>
                <div className="text-[9px] text-slate-400 mt-1">Lightweight statutory relief</div>
              </button>

              <button
                type="button"
                onClick={() => setSize('gt10')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  size === 'gt10'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-black text-white">SME Standard</div>
                <div className="text-[10px] text-emerald-400 font-bold">&gt; 10 Employees</div>
                <div className="text-[9px] text-slate-400 mt-1">Full essential disclosures</div>
              </button>
            </div>
          </div>

          {/* Module Selector */}
          <div className="space-y-2">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Reporting Standard Module Scope
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModuleOption('basic')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  moduleOption === 'basic'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-black text-white">Option A: Basic</div>
                <div className="text-[10px] text-emerald-400 font-bold">28 Datapoints</div>
                <div className="text-[9px] text-slate-400 mt-1">Core ESG operations</div>
              </button>

              <button
                type="button"
                onClick={() => setModuleOption('both')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  moduleOption === 'both'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-black text-white">Option B: Comprehensive</div>
                <div className="text-[10px] text-emerald-400 font-bold">55 Datapoints</div>
                <div className="text-[9px] text-slate-400 mt-1">Strategy, targets & NACE</div>
              </button>
            </div>
          </div>

          {/* NACE Sector Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                NACE Economic Activity Sector
              </span>
              {isNaceHighClimate && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  High Climate Impact
                </span>
              )}
            </div>
            <select
              value={nace}
              onChange={e => setNace(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="A">NACE A — Agriculture, Forestry and Fishing (High Climate)</option>
              <option value="B">NACE B — Mining and Quarrying (High Climate)</option>
              <option value="C">NACE C — Manufacturing (High Climate)</option>
              <option value="D">NACE D — Electricity, Gas, Steam & Air Conditioning (High Climate)</option>
              <option value="E">NACE E — Water Supply; Sewerage, Waste Management (High Climate)</option>
              <option value="F">NACE F — Construction (High Climate)</option>
              <option value="G">NACE G — Wholesale and Retail Trade (High Climate)</option>
              <option value="H">NACE H — Transportation and Storage (High Climate)</option>
              <option value="M">NACE M — Professional, Scientific & Technical (High Climate)</option>
              <option value="I">NACE I — Accommodation and Food Service</option>
              <option value="J">NACE J — Information and Communication</option>
              <option value="K">NACE K — Financial and Insurance Activities</option>
              <option value="L">NACE L — Real Estate Activities</option>
              <option value="N">NACE N — Administrative and Support Service</option>
              <option value="P">NACE P — Education</option>
              <option value="Q">NACE Q — Human Health and Social Work</option>
            </select>
          </div>
        </div>

        {/* High Climate Trigger Notification */}
        {isNaceHighClimate && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Statutory High-Climate Sector Requirement: </span>
              Under Commission Delegated Regulation C(2026) 5011, enterprises in NACE Sector {nace} are legally required to disclose whether they have adopted a Climate Transition Plan (C3-3), or disclose its absence with a planned adoption roadmap.
            </div>
          </div>
        )}
      </div>

      {/* Primary Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Readiness Dashboard', icon: FileSpreadsheet, badge: `${readiness.completionPct}%` },
          { id: 'workbench', label: 'Disclosures Workbench', icon: Sliders, badge: `${readiness.completed}/${readiness.total}` },
          { id: 'cap', label: 'Value Chain Cap Shield (Annex II)', icon: ShieldCheck, badge: '23 Protected' },
          { id: 'statement', label: 'Voluntary Statement Preview', icon: FileText, badge: 'Shadow Report' },
          { id: 'audit', label: 'Assurance & Audit Registry', icon: Scale, badge: 'RFC 4180' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${
                isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: READINESS DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total In-Scope</span>
              <div className="text-2xl font-black text-white mt-1">{readiness.total}</div>
              <span className="text-[10px] text-slate-500">{moduleOption === 'basic' ? 'Basic Module only' : 'Basic + Comprehensive'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Complete / Verified</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{readiness.completed}</div>
              <span className="text-[10px] text-slate-500">Fully documented</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">In Progress</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{readiness.inProgress}</div>
              <span className="text-[10px] text-slate-500">Draft underway</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Exempt / N/A</span>
              <div className="text-2xl font-black text-blue-400 mt-1">{readiness.na}</div>
              <span className="text-[10px] text-slate-500">Verified not applicable</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Pending Action</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{readiness.pending}</div>
              <span className="text-[10px] text-slate-500">Awaiting input</span>
            </div>
          </div>

          {/* Overall Readiness Gauge & Essential Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Overall Completion Gauge */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Overall Standard Completion
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${
                  readiness.completionPct >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                  readiness.completionPct >= 50 ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                }`}>
                  {readiness.completionPct}% Completed
                </span>
              </div>

              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                  style={{ width: `${readiness.completionPct}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Resolved: {readiness.completed + readiness.na} / {readiness.total}</span>
                <span>Audit Status: {readiness.completionPct === 100 ? 'Audit-Ready' : 'In Preparation'}</span>
              </div>
            </div>

            {/* Essential Datapoints Gauge */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Essential vs Voluntary Coverage
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-500/20 text-blue-400">
                  {readiness.essentialCompleted} / {readiness.essentialTotal} Essential
                </span>
              </div>

              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-500"
                  style={{ width: `${readiness.essentialTotal > 0 ? (readiness.essentialCompleted / readiness.essentialTotal) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Essential Pending: {readiness.essentialPending}</span>
                <span>Size Tier: {size === 'le10' ? '≤ 10 Micro-Relief' : '> 10 Standard SME'}</span>
              </div>
            </div>

            {/* Value Chain Cap Protection Shield Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  Value Chain Cap Shield
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Annex II establishes legal immunity: large undertakings subject to CSRD cannot mandate disclosure requests exceeding VSME boundaries.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-emerald-400 font-bold">23 Statutory Protections Active</span>
                <button
                  onClick={() => setActiveSubTab('cap')}
                  className="text-[10px] font-extrabold text-white hover:text-emerald-400 flex items-center gap-1"
                >
                  View Shield <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Compliance Alerts */}
          {readiness.alerts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Regulatory Alerts & Directives
              </span>
              <div className="space-y-2">
                {readiness.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs leading-relaxed ${
                      alert.type === 'high-climate'
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : alert.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                    }`}
                  >
                    {alert.type === 'high-climate' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : alert.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    )}
                    <span>{alert.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Progress Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Progress Across All {readiness.sections.length} Disclosure Sections
              </span>
              <span className="text-[11px] text-slate-400">
                Click any section card to jump to its workbench disclosures
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {readiness.sections.map((sec, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSectionFilter(sec.name);
                    setActiveSubTab('workbench');
                  }}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                      {sec.name}
                    </span>
                    <span className="text-[11px] font-black text-slate-400">
                      {sec.completed}/{sec.total}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-3 border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${sec.pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <span>{sec.pct}% Complete</span>
                    <span className="text-emerald-400 group-hover:underline flex items-center gap-0.5">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCLOSURES WORKBENCH */}
      {activeSubTab === 'workbench' && (
        <div className="space-y-4">
          
          {/* Filters & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search datapoint ID, title, ESRS, or standard text..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Section:</span>
              <select
                value={sectionFilter}
                onChange={e => setSectionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Sections ({scopedDatapoints.length})</option>
                {availableSections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="Complete">Complete</option>
                <option value="In progress">In Progress</option>
                <option value="Not started">Not Started</option>
                <option value="N/A">Not Applicable</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="essential">Essential Only</option>
                <option value="voluntary">Voluntary Only</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || sectionFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSectionFilter('all');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {filteredDatapoints.length} of {scopedDatapoints.length} scoped datapoints</span>
            <span className="text-[11px]">Size Tier: {size === 'le10' ? '≤10 Micro Relief Active' : '>10 SME Standard'}</span>
          </div>

          {/* Datapoints Accordion / List */}
          <div className="space-y-3">
            {filteredDatapoints.map(dp => {
              const r = responses[dp.id] || { status: 'Not started', quant: '', narrative: '', source: '' };
              const isEss = isDatapointEssential(dp, size);
              const isCap = isWithinValueChainCap(dp.dr, size);
              const isExpanded = expandedSection === dp.id;

              return (
                <div
                  key={dp.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 transition-all"
                >
                  {/* Datapoint Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-950 text-emerald-400 border border-slate-800 shrink-0">
                        {dp.id}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs md:text-sm font-black text-white">
                            {dp.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            DR {dp.dr}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            dp.module === 'Basic' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {dp.module}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEss ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isEss ? 'Essential' : 'Voluntary'}
                          </span>
                          {isCap && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VC Cap Protected
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          Section: {dp.section} · Metric Unit: <code className="text-slate-300">{dp.unit}</code>
                        </span>
                      </div>
                    </div>

                    {/* Status Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={r.status || 'Not started'}
                        onChange={e => handleResponseChange(dp.id, 'status', e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border focus:outline-none cursor-pointer ${
                          r.status === 'Complete'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : r.status === 'In progress'
                            ? 'bg-amber-950 border-amber-500 text-amber-300'
                            : r.status === 'N/A'
                            ? 'bg-blue-950 border-blue-500 text-blue-300'
                            : 'bg-slate-950 border-slate-700 text-slate-400'
                        }`}
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Complete">Complete</option>
                        <option value="N/A">Not applicable</option>
                      </select>

                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : dp.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Toggle Details & Guidance"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Standard Verbatim Requirements */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      C(2026) 5011 Standard Specification:
                    </span>
                    {dp.verbatim}
                  </div>

                  {/* Disclosure Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Quantitative Value / Metric ({dp.unit})
                      </label>
                      <input
                        type="text"
                        value={r.quant || ''}
                        onChange={e => handleResponseChange(dp.id, 'quant', e.target.value)}
                        placeholder={`e.g. 150 ${dp.unit}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Evidence Citation / Documentation Source
                      </label>
                      <input
                        type="text"
                        value={r.source || ''}
                        onChange={e => handleResponseChange(dp.id, 'source', e.target.value)}
                        placeholder="e.g. Energy utility bill, ISO 14064 report, HR registry..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Qualitative Narrative Disclosure Statement
                      </label>
                      <textarea
                        rows={2}
                        value={r.narrative || ''}
                        onChange={e => handleResponseChange(dp.id, 'narrative', e.target.value)}
                        placeholder="Provide the context, methodology, boundary description, or explanation for this disclosure..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>

                  {/* Expanded Regulatory Cross-References & Value Chain Cap Details */}
                  {isExpanded && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-2">
                      <div className="flex flex-wrap items-center gap-4">
                        {dp.esrs && dp.esrs !== '-' && (
                          <span>
                            <strong className="text-slate-300">ESRS Cross-Reference: </strong>
                            {dp.esrs}
                          </span>
                        )}
                        {dp.sfdr && dp.sfdr !== '-' && (
                          <span>
                            <strong className="text-slate-300">SFDR Cross-Reference: </strong>
                            {dp.sfdr}
                          </span>
                        )}
                        <span>
                          <strong className="text-slate-300">Micro Relief (≤10): </strong>
                          {dp.le10 ? 'Applicable' : 'Voluntary exemption applies'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: VALUE CHAIN CAP SHIELD (ANNEX II) */}
      {activeSubTab === 'cap' && (
        <div className="space-y-4">
          
          {/* Cap Shield Legal Explainer Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-500/30 space-y-2">
            <div className="flex items-center gap-2 text-teal-300">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide">
                Statutory Value Chain Cap Protection Shield (Annex II)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under Commission Delegated Regulation C(2026) 5011, Annex II establishes statutory legal protection for SMEs in corporate value chains. Large mandatory CSRD reporters are legally constrained from requiring sustainability information from value chain SMEs that exceeds the datapoints listed below.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-teal-400 pt-1 font-bold">
              <span>✓ 23 Protected Disclosure Requirements</span>
              <span>✓ Shields Against Disproportionate Corporate Demands</span>
              <span>✓ Pre-vetted by EFRAG</span>
            </div>
          </div>

          {/* Value Chain Cap Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">DR</th>
                    <th className="py-3 px-4">Standard Para</th>
                    <th className="py-3 px-4">Disclosure Title</th>
                    <th className="py-3 px-4 text-center">≤ 10 Employees</th>
                    <th className="py-3 px-4 text-center">&gt; 10 Employees</th>
                    <th className="py-3 px-4">Statutory Legal Implication for Corporate Buyers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {VSME_CAP_ITEMS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-black text-emerald-400">
                        {item.dr}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {item.para}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {item.title}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          item.le10 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {item.le10 ? 'YES' : 'EXEMPT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          item.gt10 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {item.gt10 ? 'YES' : 'EXEMPT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-300 leading-relaxed">
                        {item.implication}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VOLUNTARY SUSTAINABILITY STATEMENT PREVIEW */}
      {activeSubTab === 'statement' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Publication-Ready Voluntary Sustainability Statement (Shadow Report)
              </h2>
              <p className="text-xs text-slate-400">
                Official structured document prepared under Commission Delegated Regulation C(2026) 5011
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyStatement}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                {copiedStatement ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedStatement ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={handleDownloadStatement}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner max-h-[700px] overflow-y-auto">
            {exportVsmeReportText({
              company: companyName,
              year: reportingYear,
              preparer,
              country,
              nace,
              size,
              module: moduleOption,
              datapoints: scopedDatapoints,
              responses
            })}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL & ASSURANCE REGISTRY */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Assurance Registry & RFC 4180 Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Full 16-column dataset matrix ready for statutory auditor or supply chain inspection
              </p>
            </div>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">DR</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Metric Value</th>
                    <th className="py-2.5 px-3">Evidence Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {scopedDatapoints.map(dp => {
                    const r = responses[dp.id] || {};
                    return (
                      <tr key={dp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                          {dp.id}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {dp.dr}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white max-w-xs truncate" title={dp.title}>
                          {dp.title}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dp.module === 'Basic' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {dp.module}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400">
                          {dp.type}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'Complete' ? 'bg-emerald-500/20 text-emerald-300' :
                            r.status === 'In progress' ? 'bg-amber-500/20 text-amber-300' :
                            r.status === 'N/A' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {r.status || 'Not started'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-white max-w-xs truncate">
                          {r.quant || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-400 max-w-xs truncate">
                          {r.source || '-'}
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

    </div>
  );
}
