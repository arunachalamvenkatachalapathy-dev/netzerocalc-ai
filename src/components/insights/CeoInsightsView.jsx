import React, { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  TrendingUp,
  Scale,
  ShieldCheck,
  DollarSign,
  Compass,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  Download,
  Copy,
  Check,
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  Target,
  BarChart3,
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import {
  CEO_STRATEGIC_BRIEFS,
  STRATEGIC_CATEGORIES,
  STRATEGIC_MATURITY_PILLARS,
  getBriefById,
  filterBriefsByCategory,
  calculateInsightsMetrics,
  evaluateMaturityScorecard,
  exportExecutiveSummaryCsv,
  exportBoardroomBriefingMarkdown
} from '../../services/insights/ceoInsightsService.js';

export default function CeoInsightsView({
  activeProject,
  activePeriodYear = '2024',
  onNavigateToTab,
  showToast
}) {
  const companyName = activeProject?.companyName || 'My Enterprise Organization';

  // Sub-tabs: 'briefs' (default), 'scorecard', 'matrix'
  const [activeSubTab, setActiveSubTab] = useState('briefs');

  // Category filter for briefs
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Currently selected brief
  const [selectedBriefId, setSelectedBriefId] = useState('brief-csrd-benchmarking');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive checked boardroom questions: { [key: string]: boolean }
  const [checkedQuestions, setCheckedQuestions] = useState({});

  // Copy indicator
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Strategic maturity scorecard answers: { [pillarId]: 1-5 }
  const [scorecardAnswers, setScorecardAnswers] = useState({
    governance_integration: 3,
    scenario_resilience: 2,
    regulatory_architecture: 3,
    supply_chain_diligence: 2,
    assurance_readiness: 3
  });

  // Filtered briefs list
  const filteredBriefs = useMemo(() => {
    let list = filterBriefsByCategory(selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q) ||
        b.leadHeadline.toLowerCase().includes(q) ||
        b.categoryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Currently active brief object
  const activeBrief = useMemo(() => {
    return getBriefById(selectedBriefId) || CEO_STRATEGIC_BRIEFS[0];
  }, [selectedBriefId]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    return calculateInsightsMetrics(CEO_STRATEGIC_BRIEFS);
  }, []);

  // Evaluated maturity scorecard
  const maturityResult = useMemo(() => {
    return evaluateMaturityScorecard(scorecardAnswers);
  }, [scorecardAnswers]);

  // Handle toggling question check-off
  const handleToggleQuestion = (qIndex) => {
    const key = `${selectedBriefId}-q-${qIndex}`;
    setCheckedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Download Markdown briefing deck
  const handleDownloadMarkdown = () => {
    const md = exportBoardroomBriefingMarkdown(selectedBriefId, companyName, activePeriodYear);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Boardroom_Briefing_${activeBrief.id}_${companyName.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Executive boardroom briefing markdown downloaded.', 'success');
  };

  // Copy Markdown briefing deck
  const handleCopyMarkdown = () => {
    const md = exportBoardroomBriefingMarkdown(selectedBriefId, companyName, activePeriodYear);
    navigator.clipboard.writeText(md);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
    if (showToast) showToast('Boardroom briefing copied to clipboard.', 'success');
  };

  // Export Executive Summary CSV
  const handleDownloadCsv = () => {
    const csv = exportExecutiveSummaryCsv(CEO_STRATEGIC_BRIEFS, companyName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Executive_ESG_Briefs_Summary_${companyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Executive strategic briefs CSV downloaded.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Award className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    Executive CEO Insights & Strategic Briefs
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Boardroom Decision Hub
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Synthesized executive intelligence, corporate filings benchmarks, and decarbonization economics for C-Suite leadership and Audit Committees
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('scorecard')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 transition-all active:scale-95 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Maturity Scorecard</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBrief ? 'Copied' : 'Copy Brief'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Briefing (MD)</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Summary CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Boardroom Briefs</span>
          <div className="text-2xl font-black text-white mt-1">{metrics.totalBriefs} Strategic Briefs</div>
          <span className="text-[10px] text-slate-500">Across {metrics.categoriesCount} C-Suite Domains</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Decision Questions</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{metrics.totalBoardQuestions} Questions</div>
          <span className="text-[10px] text-slate-500">Board & Audit Committee ready</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Executive Action Items</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.totalExecutiveActions} Roles Assigned</div>
          <span className="text-[10px] text-slate-500">CEO, CFO, CSO, General Counsel</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Carbon Price Horizon</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{metrics.carbonPriceHorizon}</div>
          <span className="text-[10px] text-slate-500">EUA projected trajectory to 2035</span>
        </div>
      </div>

      {/* Primary Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'briefs', label: 'Strategic Briefs Hub', icon: BookOpen, badge: '5 Core Briefs' },
          { id: 'scorecard', label: 'Boardroom Maturity Scorecard', icon: Target, badge: `${maturityResult.overallScore} / 5.0` },
          { id: 'matrix', label: 'Regulatory Cohesion Matrix', icon: Layers, badge: '60 Directives' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${
                isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: STRATEGIC BRIEFS HUB */}
      {activeSubTab === 'briefs' && (
        <div className="space-y-6">
          
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {STRATEGIC_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search strategic briefs..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Grid of Brief Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredBriefs.map(brief => {
              const isSelected = selectedBriefId === brief.id;
              return (
                <div
                  key={brief.id}
                  onClick={() => setSelectedBriefId(brief.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {brief.categoryLabel}
                      </span>
                      <span className="text-[10px] text-slate-400">{brief.readTime}</span>
                    </div>

                    <h3 className="text-xs font-black text-white line-clamp-2">
                      {brief.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {brief.subtitle}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-indigo-400 font-bold">{brief.stats[0]?.value}</span>
                    <span className="text-indigo-400 font-bold flex items-center gap-0.5">
                      Read <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Brief Full In-Depth Presentation Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            {/* Brief Header */}
            <div className="border-b border-slate-800 pb-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeBrief.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeBrief.readTime}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                {activeBrief.title}
              </h2>
              <div className="text-sm font-bold text-slate-300">
                {activeBrief.subtitle}
              </div>

              {/* Lead Headline Callout */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs md:text-sm text-indigo-200 leading-relaxed font-sans font-medium">
                {activeBrief.leadHeadline}
              </div>
            </div>

            {/* Empirical KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeBrief.stats.map((stat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</div>
                  <div className="text-xl font-black text-white mt-1 font-mono">{stat.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{stat.desc}</div>
                </div>
              ))}
            </div>

            {/* Actionable NetZeroCalc Engine Deep-Link Banner */}
            {activeBrief.connectedEngine && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Connected NetZeroCalc Action Engine
                    </span>
                    <span className="text-xs font-black text-white">
                      {activeBrief.connectedEngine.label}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeBrief.connectedEngine.description}
                    </p>
                  </div>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab(activeBrief.connectedEngine.id)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Launch Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Section 1: The Strategic Shift */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                {activeBrief.theShift.title}
              </h3>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
                {activeBrief.theShift.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Section 2: Multi-Lens Evaluation Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                Multi-Lens Strategic Evaluation Matrix
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeBrief.threeLenses.map((lens, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-xs font-black text-white block">
                      {lens.title}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {lens.description}
                    </p>
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold">
                      Takeaway: {lens.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: In-Depth Strategic Analyses */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                In-Depth Strategic Analyses & Deep Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBrief.deepInsights.map((insight, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                      {insight.title}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed pl-5">
                      {insight.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Boardroom & Audit Committee Decision Checklist */}
            <div className="p-5 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                    Boardroom & Audit Committee Decision Checklist
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  Click to mark reviewed in board session
                </span>
              </div>

              <div className="space-y-2">
                {activeBrief.boardroomQuestions.map((q, idx) => {
                  const key = `${selectedBriefId}-q-${idx}`;
                  const isChecked = !!checkedQuestions[key];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleQuestion(idx)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                        isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className={isChecked ? 'line-through opacity-80' : ''}>
                        {q}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Executive Action Matrix by Role */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">
                Executive Action Matrix by Role
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeBrief.actionPlan.map((action, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700 shrink-0 mt-0.5">
                      {action.role}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {action.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: BOARDROOM MATURITY SCORECARD */}
      {activeSubTab === 'scorecard' && (
        <div className="space-y-6">
          
          {/* Executive Evaluation Result Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Enterprise Decarbonization & ESG Strategy Readiness
                </span>
                <h2 className="text-lg md:text-xl font-black text-white mt-0.5">
                  {maturityResult.tier}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {maturityResult.executiveSummary}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-black text-white font-mono">{maturityResult.overallScore}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Out of 5.0</div>
                </div>
                <div className="h-10 w-px bg-slate-800"></div>
                <div className="text-center">
                  <div className="text-3xl font-black text-indigo-400 font-mono">{maturityResult.overallPct}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Readiness</div>
                </div>
              </div>
            </div>

            {/* Priority Board Directive */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Boardroom Priority Directive: </strong>
                {maturityResult.priorityDirective}
              </div>
            </div>
          </div>

          {/* Interactive 5-Pillar Scorecard Questions */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              5 Core Strategic Assessment Pillars (Select Current Enterprise Maturity)
            </h3>

            <div className="space-y-4">
              {STRATEGIC_MATURITY_PILLARS.map(pillar => {
                const currentScore = scorecardAnswers[pillar.id] || 1;
                const questionObj = pillar.questions[0];

                return (
                  <div
                    key={pillar.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <h4 className="text-xs md:text-sm font-black text-white">
                          {pillar.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {pillar.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 font-bold">Current Score:</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-black ${
                          currentScore >= 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          currentScore >= 3 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {currentScore}.0 / 5.0
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 font-medium">
                      {questionObj.text}
                    </div>

                    {/* Radio Options 1 to 5 */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-1">
                      {questionObj.options.map(opt => {
                        const isSelected = currentScore === opt.score;
                        return (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => setScorecardAnswers(prev => ({ ...prev, [pillar.id]: opt.score }))}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-950/40'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black font-mono ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                Level {opt.score}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <span className="text-[10px] leading-relaxed">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REGULATORY COHESION MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              The European Green Deal Cohesion Matrix (60 Directives Across 8 Domains)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Strategic cross-reference mapping highlighting how environmental reporting (CSRD), supply chain due diligence (CSDDD), border adjustments (CBAM), taxonomy standards, and product ecodesign (ESPR) operate under a single unified data architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider block">
                1. Centralized Data Spine vs Silos
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                GHG Protocol Scope 1, 2, and 3 accounting directly services ESRS E1, CBAM carbon declarations, EU Taxonomy CapEx KPIs, and SFDR financial reporting. Operating unified data governance reduces total compliance friction by over 40%.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                2. Supply Chain Multiplier & Value Chain Cap
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Large corporations cannot demand information exceeding the statutory VSME standard from non-listed SMEs (Annex II Value Chain Cap). Leveraging this statutory shield defends commercial relationships without regulatory over-reach.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                3. High-Liability Regimes (5/5 Severity)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Ten specific frameworks (EU ETS, REACH, GDPR, CSDDD, IED, Forced Labour) carry severe statutory consequences including customs seizures, commercial bans, and personal director liability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-black text-purple-400 uppercase tracking-wider block">
                4. Capital Markets & ISSB Interoperability
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Building core data systems to ISSB S1/S2 as the global financial baseline with CSRD ESRS as the European double materiality layer guarantees worldwide capital market access with zero duplicate software spend.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
