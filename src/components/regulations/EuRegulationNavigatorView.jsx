import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Sliders,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ExternalLink,
  FileText,
  ChevronRight,
  ArrowUpDown,
  Layers,
  Info,
  Calendar,
  Building,
  CheckSquare,
  Square,
  Sparkles,
  Target,
  FileCheck2,
  DollarSign,
  Scale
} from 'lucide-react';
import {
  EU_REGULATIONS_60,
  EU_CATEGORIES,
  INDUSTRY_SECTORS,
  STRATEGIC_QUADRANTS
} from '../../data/euRegulations60Data.js';
import {
  filterRegulations,
  calculateNavigatorStatistics,
  calculateScatterCoordinates,
  generateRadarGeometry,
  exportShortlistToCsv,
  getCategoryColor,
  getQuadrantBadgeClass,
  getLegalStatusBadgeClass,
  getRegulationQuadrant
} from '../../services/regulations/euNavigatorService.js';

// Helper to normalize any regulation record from raw dataset
function normalizeRegulation(r) {
  if (!r) return null;
  const id = r.id || (r.short || r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const acronym = r.short || r.acronym || '';
  const fullName = r.name || r.fullName || '';
  const shortName = r.shortName || r.name || '';
  const desc = r.summary || r.desc || '';
  const directive = r.link || r.directive || r.legalStatus || '';
  const timeline = r.firstYear || r.timeline || 'Ongoing';
  const data = r.dataIntensity ?? r.data ?? 1;
  const enforce = r.enforcement ?? r.enforce ?? 1;

  // Parse mustDo into clean actionable checklist items
  let mustDoList = [];
  if (Array.isArray(r.mustDo)) {
    mustDoList = r.mustDo;
  } else if (r.mustDo) {
    const s = String(r.mustDo).trim();
    if (s.includes(';')) {
      mustDoList = s.split(';').map(x => x.trim().replace(/\.$/, '')).filter(Boolean);
    } else if (s.includes(',')) {
      mustDoList = s.split(',').map(x => x.trim().replace(/\.$/, '')).filter(Boolean);
    } else {
      mustDoList = [s.replace(/\.$/, '')];
    }
  }

  // Parse industry into tag chips
  let industryList = [];
  if (Array.isArray(r.industries)) {
    industryList = r.industries;
  } else if (r.industry) {
    industryList = String(r.industry).split(',').map(x => x.trim()).filter(Boolean);
  }

  return {
    ...r,
    id,
    acronym,
    short: acronym,
    name: fullName,
    fullName,
    shortName,
    desc,
    summary: desc,
    directive,
    timeline,
    firstYear: timeline,
    data,
    dataIntensity: data,
    enforce,
    enforcement: enforce,
    mustDoList,
    industryList,
    industries: industryList
  };
}

export default function EuRegulationNavigatorView({
  activeProject,
  activePeriodYear,
  onNavigateToTab
}) {
  // Filter States
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [targetYear, setTargetYear] = useState(2031); // 2031 represents 'All Years'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuadrant, setSelectedQuadrant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected regulation for inspector profile
  const [selectedRegId, setSelectedRegId] = useState('csrd');
  // Hovered regulation for scatter plot tooltip
  const [hoveredRegId, setHoveredRegId] = useState(null);

  // Table sorting
  const [sortField, setSortField] = useState('liability');
  const [sortDirection, setSortDirection] = useState('desc');

  // Track completed checklist items per regulation: { [regId]: { [itemIndex]: true } }
  const [completedMustDos, setCompletedMustDos] = useState({});

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedIndustry('all');
    setTargetYear(2031);
    setSelectedCategory('all');
    setSelectedQuadrant('all');
    setSearchQuery('');
  };

  // Filter raw regulations
  const rawFilteredRegs = useMemo(() => {
    return filterRegulations(EU_REGULATIONS_60, {
      industry: selectedIndustry,
      targetYear: targetYear,
      category: selectedCategory,
      quadrant: selectedQuadrant,
      search: searchQuery
    });
  }, [selectedIndustry, targetYear, selectedCategory, selectedQuadrant, searchQuery]);

  // Normalized filtered regulations
  const filteredRegs = useMemo(() => {
    return rawFilteredRegs.map(normalizeRegulation);
  }, [rawFilteredRegs]);

  // Aggregate statistics
  const stats = useMemo(() => {
    return calculateNavigatorStatistics(filteredRegs);
  }, [filteredRegs]);

  // Currently selected regulation for the inspector
  const selectedReg = useMemo(() => {
    const found =
      filteredRegs.find((r) => r.id === selectedRegId) ||
      EU_REGULATIONS_60.map(normalizeRegulation).find((r) => r.id === selectedRegId) ||
      filteredRegs[0] ||
      normalizeRegulation(EU_REGULATIONS_60[0]);
    return found;
  }, [filteredRegs, selectedRegId]);

  // Sorted regulations for shortlist table
  const sortedRegs = useMemo(() => {
    return [...filteredRegs].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'quadrant') {
        valA = getRegulationQuadrant(a);
        valB = getRegulationQuadrant(b);
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [filteredRegs, sortField, sortDirection]);

  // Toggle checklist item
  const toggleMustDo = (regId, index) => {
    setCompletedMustDos((prev) => {
      const currentRegState = prev[regId] || {};
      return {
        ...prev,
        [regId]: {
          ...currentRegState,
          [index]: !currentRegState[index]
        }
      };
    });
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const csvContent = exportShortlistToCsv(filteredRegs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EU_ESG_Regulations_Shortlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Scatter plot dimensions & coordinates
  const scatterWidth = 620;
  const scatterHeight = 520;
  const scatterPadding = 60;
  const scatterCoords = useMemo(() => {
    return calculateScatterCoordinates(filteredRegs, scatterWidth, scatterHeight, scatterPadding);
  }, [filteredRegs]);

  // Radar chart geometry for selected regulation
  const radarGeometry = useMemo(() => {
    if (!selectedReg) return null;
    return generateRadarGeometry(selectedReg, 130, 130, 85);
  }, [selectedReg]);

  // Helper for timeline label
  const getTimelineLabel = (year) => {
    if (year === 2023) return 'Ongoing Mandates';
    if (year === 2031) return 'All Horizon Years (2024–2030+)';
    return `Active on or before ${year}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/40 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              <span>European Green Deal • Strategic Policy Navigator</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              EU ESG Regulation Navigator
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                60 Authoritative Frameworks
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Multi-factor 5-dimensional radar and effort-vs-liability scatter matrix across all 60 European Union environmental, social, product, and financial market sustainability mandates.
            </p>

            {/* Cross-linking shortcuts to other NetZeroCalc modules */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold">Enterprise Bridge:</span>
              <button
                onClick={() => onNavigateToTab && onNavigateToTab('omnibus-csddd')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <Shield className="w-3 h-3 text-emerald-400" />
                Omnibus & CSDDD
              </button>
              <button
                onClick={() => onNavigateToTab && onNavigateToTab('csrd-materiality')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <FileCheck2 className="w-3 h-3 text-blue-400" />
                CSRD Materiality
              </button>
              <button
                onClick={() => onNavigateToTab && onNavigateToTab('carbon-cost')}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition flex items-center gap-1.5 font-semibold cursor-pointer"
              >
                <DollarSign className="w-3 h-3 text-amber-400" />
                Carbon Cost & EUA
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCsv}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Shortlist (CSV)
            </button>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 active:scale-95 cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            In Scope
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalCount}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 60</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.percentInScope}% of EU universe
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-red-200/80 dark:border-red-900/40 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Board Critical (Q1)
          </div>
          <div className="mt-2 text-2xl font-black text-red-600 dark:text-red-400">
            {stats.quadrants.Q1}
          </div>
          <div className="mt-1 text-[11px] text-red-600/80 dark:text-red-400/80 font-medium">
            High Effort & Liability
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            High Liability (≥4)
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {stats.highLiabilityCount}
          </div>
          <div className="mt-1 text-[11px] text-purple-600/80 dark:text-purple-400/80 font-medium">
            Severe sanctions/fines
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg Effort
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgEffort}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${(stats.avgEffort / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg Liability
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgLiability}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-red-500 h-full rounded-full"
              style={{ width: `${(stats.avgLiability / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Avg Enforcement
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.avgEnforcement}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${(stats.avgEnforcement / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Multi-Faceted Filter & Controller Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        {/* Top filter row: Sector, Quadrant, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Industry Sector Dropdown */}
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Industry Sector Scope
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition appearance-none cursor-pointer"
              >
                {INDUSTRY_SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Strategic Quadrant Dropdown */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Strategic Quadrant
            </label>
            <div className="relative">
              <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedQuadrant}
                onChange={(e) => setSelectedQuadrant(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition appearance-none cursor-pointer"
              >
                <option value="all">All Strategic Quadrants</option>
                <option value="Q1">Q1: Board Critical ({stats.quadrants.Q1})</option>
                <option value="Q2">Q2: High-Exposure Quick Wins ({stats.quadrants.Q2})</option>
                <option value="Q3">Q3: Operational Heavyweights ({stats.quadrants.Q3})</option>
                <option value="Q4">Q4: Monitored / Targeted ({stats.quadrants.Q4})</option>
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Keyword Search (Acronym, Directive, Title)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CSRD, CBAM, EUDR, Battery, Deforestation..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Slider Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Compliance Horizon:
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {getTimelineLabel(targetYear)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setTargetYear(2023)}
                className={`px-2 py-1 rounded-md font-bold transition text-[11px] cursor-pointer ${
                  targetYear === 2023
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setTargetYear(2025)}
                className={`px-2 py-1 rounded-md font-bold transition text-[11px] cursor-pointer ${
                  targetYear === 2025
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                ≤ 2025
              </button>
              <button
                onClick={() => setTargetYear(2026)}
                className={`px-2 py-1 rounded-md font-bold transition text-[11px] cursor-pointer ${
                  targetYear === 2026
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                ≤ 2026
              </button>
              <button
                onClick={() => setTargetYear(2028)}
                className={`px-2 py-1 rounded-md font-bold transition text-[11px] cursor-pointer ${
                  targetYear === 2028
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                ≤ 2028
              </button>
              <button
                onClick={() => setTargetYear(2031)}
                className={`px-2 py-1 rounded-md font-bold transition text-[11px] cursor-pointer ${
                  targetYear === 2031
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Years
              </button>
            </div>
          </div>

          <div className="relative flex items-center px-1">
            <input
              type="range"
              min={2023}
              max={2031}
              step={1}
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 px-1">
            <span>Ongoing</span>
            <span>2024</span>
            <span>2025</span>
            <span>2026</span>
            <span>2027</span>
            <span>2028</span>
            <span>2029</span>
            <span>2030</span>
            <span>All (2031+)</span>
          </div>
        </div>

        {/* Policy Domain (Category) Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase tracking-wider">
            Policy Domain:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Policy Areas ({filteredRegs.length})
          </button>
          {Object.keys(EU_CATEGORIES).map((catName) => {
            const cat = EU_CATEGORIES[catName];
            const count = stats.categories[catName] || 0;
            const isSelected = selectedCategory === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-offset-1 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.hex : undefined,
                  borderColor: isSelected ? cat.hex : undefined
                }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: isSelected ? '#ffffff' : cat.hex }}
                />
                <span>{catName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main 2-Column Split: 2D Strategic Scatter Matrix + Technical Profile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive 2D Strategic Scatter Matrix */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Strategic Scatter Matrix: Effort vs. Liability
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quadrant placement based on implementation effort (X) and legal liability / sanctions exposure (Y).
              </p>
            </div>
            <div className="text-xs font-bold text-slate-400">
              {filteredRegs.length} Plotted
            </div>
          </div>

          {/* SVG 2D Scatter Matrix Canvas */}
          <div className="relative w-full overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-inner">
            <svg
              viewBox={`0 0 ${scatterWidth} ${scatterHeight}`}
              className="w-full h-auto select-none"
            >
              <defs>
                {/* Subtle gradient fills for the 4 quadrants */}
                <radialGradient id="q1Gradient" cx="100%" cy="0%" r="90%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.03" />
                </radialGradient>
                <radialGradient id="q2Gradient" cx="0%" cy="0%" r="90%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
                </radialGradient>
                <radialGradient id="q3Gradient" cx="100%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
                </radialGradient>
                <radialGradient id="q4Gradient" cx="0%" cy="100%" r="90%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
                </radialGradient>
              </defs>

              {/* Quadrant 1 (Top-Right): Board Critical (High Effort, High Liability) */}
              <rect
                x={scatterWidth / 2}
                y={scatterPadding}
                width={scatterWidth / 2 - scatterPadding}
                height={scatterHeight / 2 - scatterPadding}
                fill="url(#q1Gradient)"
                stroke="#ef4444"
                strokeOpacity="0.2"
                strokeDasharray="4,4"
              />
              <text
                x={scatterWidth - scatterPadding - 10}
                y={scatterPadding + 22}
                textAnchor="end"
                className="text-[11px] font-black fill-red-400 uppercase tracking-wider"
              >
                Q1: Board Critical (High Effort & Liability)
              </text>

              {/* Quadrant 2 (Top-Left): Quick Wins (Low Effort, High Liability) */}
              <rect
                x={scatterPadding}
                y={scatterPadding}
                width={scatterWidth / 2 - scatterPadding}
                height={scatterHeight / 2 - scatterPadding}
                fill="url(#q2Gradient)"
                stroke="#6366f1"
                strokeOpacity="0.2"
                strokeDasharray="4,4"
              />
              <text
                x={scatterPadding + 10}
                y={scatterPadding + 22}
                textAnchor="start"
                className="text-[11px] font-black fill-indigo-400 uppercase tracking-wider"
              >
                Q2: Quick Wins (Low Effort, High Risk)
              </text>

              {/* Quadrant 3 (Bottom-Right): Operational Heavyweights (High Effort, Low Liability) */}
              <rect
                x={scatterWidth / 2}
                y={scatterHeight / 2}
                width={scatterWidth / 2 - scatterPadding}
                height={scatterHeight / 2 - scatterPadding}
                fill="url(#q3Gradient)"
                stroke="#f59e0b"
                strokeOpacity="0.2"
                strokeDasharray="4,4"
              />
              <text
                x={scatterWidth - scatterPadding - 10}
                y={scatterHeight - scatterPadding - 12}
                textAnchor="end"
                className="text-[11px] font-black fill-amber-400 uppercase tracking-wider"
              >
                Q3: Operational (High Effort, Low Risk)
              </text>

              {/* Quadrant 4 (Bottom-Left): Monitored / Targeted (Low Effort, Low Liability) */}
              <rect
                x={scatterPadding}
                y={scatterHeight / 2}
                width={scatterWidth / 2 - scatterPadding}
                height={scatterHeight / 2 - scatterPadding}
                fill="url(#q4Gradient)"
                stroke="#10b981"
                strokeOpacity="0.2"
                strokeDasharray="4,4"
              />
              <text
                x={scatterPadding + 10}
                y={scatterHeight - scatterPadding - 12}
                textAnchor="start"
                className="text-[11px] font-black fill-emerald-400 uppercase tracking-wider"
              >
                Q4: Monitored (Low Effort, Low Risk)
              </text>

              {/* Center Dividing Crosshairs */}
              <line
                x1={scatterWidth / 2}
                y1={scatterPadding}
                x2={scatterWidth / 2}
                y2={scatterHeight - scatterPadding}
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />
              <line
                x1={scatterPadding}
                y1={scatterHeight / 2}
                x2={scatterWidth - scatterPadding}
                y2={scatterHeight / 2}
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="6,4"
              />

              {/* Axis Labels & Ticks */}
              {/* X Axis */}
              <line
                x1={scatterPadding}
                y1={scatterHeight - scatterPadding}
                x2={scatterWidth - scatterPadding}
                y2={scatterHeight - scatterPadding}
                stroke="#64748b"
                strokeWidth="1.5"
              />
              <text
                x={scatterWidth / 2}
                y={scatterHeight - 16}
                textAnchor="middle"
                className="text-[11px] font-black fill-slate-300 uppercase tracking-wider"
              >
                Implementation Effort & Friction → (1 to 5)
              </text>

              {/* Y Axis */}
              <line
                x1={scatterPadding}
                y1={scatterPadding}
                x2={scatterPadding}
                y2={scatterHeight - scatterPadding}
                stroke="#64748b"
                strokeWidth="1.5"
              />
              <text
                x={-scatterHeight / 2}
                y={22}
                transform="rotate(-90)"
                textAnchor="middle"
                className="text-[11px] font-black fill-slate-300 uppercase tracking-wider"
              >
                Legal Liability & Penalties → (1 to 5)
              </text>

              {/* Axis Ticks */}
              {[1, 2, 3, 4, 5].map((score) => {
                const norm = (score - 1) / 4;
                const tx = scatterPadding + norm * (scatterWidth - 2 * scatterPadding);
                const ty = scatterHeight - scatterPadding - norm * (scatterHeight - 2 * scatterPadding);

                return (
                  <g key={`tick-${score}`}>
                    {/* X Tick */}
                    <line
                      x1={tx}
                      y1={scatterHeight - scatterPadding}
                      x2={tx}
                      y2={scatterHeight - scatterPadding + 5}
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x={tx}
                      y={scatterHeight - scatterPadding + 18}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-slate-400"
                    >
                      {score}
                    </text>

                    {/* Y Tick */}
                    <line
                      x1={scatterPadding - 5}
                      y1={ty}
                      x2={scatterPadding}
                      y2={ty}
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x={scatterPadding - 10}
                      y={ty + 3}
                      textAnchor="end"
                      className="text-[10px] font-bold fill-slate-400"
                    >
                      {score}
                    </text>
                  </g>
                );
              })}

              {/* Plotted Regulation Points */}
              {scatterCoords.map((item) => {
                const isSelected = selectedReg && selectedReg.id === item.id;
                const isHovered = hoveredRegId === item.id;
                const catColor = getCategoryColor(item.category);

                return (
                  <g
                    key={item.id}
                    className="cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedRegId(item.id)}
                    onMouseEnter={() => setHoveredRegId(item.id)}
                    onMouseLeave={() => setHoveredRegId(null)}
                  >
                    {/* Selection Pulse Ring */}
                    {isSelected && (
                      <circle
                        cx={item.x}
                        cy={item.y}
                        r={16}
                        fill={catColor}
                        fillOpacity="0.25"
                        stroke={catColor}
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={item.x}
                      cy={item.y}
                      r={isSelected ? 8 : isHovered ? 7 : 5.5}
                      fill={catColor}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Short Acronym Label */}
                    <text
                      x={item.x}
                      y={item.y - (isSelected ? 10 : 8)}
                      textAnchor="middle"
                      className={`text-[9px] font-black pointer-events-none transition-all ${
                        isSelected
                          ? 'fill-white font-extrabold text-[10px]'
                          : isHovered
                          ? 'fill-slate-200'
                          : 'fill-slate-400'
                      }`}
                    >
                      {item.acronym}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Floating Tooltip */}
            {hoveredRegId && (
              (() => {
                const hReg = EU_REGULATIONS_60.map(normalizeRegulation).find((r) => r.id === hoveredRegId);
                if (!hReg) return null;
                return (
                  <div className="absolute top-3 left-3 bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl pointer-events-none text-xs space-y-1 max-w-xs z-20 backdrop-blur-md">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-white text-sm">
                        {hReg.acronym}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                        style={{ backgroundColor: getCategoryColor(hReg.category) }}
                      >
                        {hReg.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 line-clamp-1 font-medium">
                      {hReg.fullName}
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-[10px] font-bold text-slate-400">
                      <span>Effort: <strong className="text-amber-400">{hReg.effort}/5</strong></span>
                      <span>Liability: <strong className="text-red-400">{hReg.liability}/5</strong></span>
                      <span>Timeline: <strong className="text-emerald-400">{hReg.timeline}</strong></span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Matrix Footer Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-slate-700 dark:text-slate-300">Legend:</span>
              {Object.keys(EU_CATEGORIES).map((catName) => (
                <div key={catName} className="flex items-center gap-1 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EU_CATEGORIES[catName].hex }} />
                  <span>{catName}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] italic">
              Click any node or row below to inspect
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Technical Profile Inspector & 5-Factor Radar */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
          {selectedReg ? (
            <div className="space-y-4">
              {/* Header Details */}
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {selectedReg.acronym}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: getCategoryColor(selectedReg.category) }}
                    >
                      {selectedReg.category}
                    </span>
                  </div>
                  <span className={getLegalStatusBadgeClass(selectedReg.legalStatus)}>
                    {selectedReg.legalStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {selectedReg.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {selectedReg.directive}
                </p>
              </div>

              {/* Status & Timeline Pill Row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Timeline / Horizon</div>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedReg.timeline}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Strategic Quadrant</div>
                  <div className="mt-0.5">
                    <span className={getQuadrantBadgeClass(getRegulationQuadrant(selectedReg))}>
                      {getRegulationQuadrant(selectedReg)}: {STRATEGIC_QUADRANTS[getRegulationQuadrant(selectedReg)]?.name || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Factor SVG Radar Chart */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                  <span>5-Factor Impact Profile</span>
                  <span className="text-emerald-400 font-bold">1–5 Scale</span>
                </div>

                <div className="relative w-64 h-64 select-none">
                  <svg viewBox="0 0 260 260" className="w-full h-full">
                    {/* Concentric Background Pentagon Rings (20%, 40%, 60%, 80%, 100%) */}
                    {radarGeometry &&
                      radarGeometry.rings.map((ringPoints, i) => (
                        <polygon
                          key={`ring-${i}`}
                          points={ringPoints}
                          fill="none"
                          stroke="#334155"
                          strokeWidth="1"
                          strokeDasharray={i === 3 ? 'none' : '2,2'}
                          opacity={(i + 1) * 0.22}
                        />
                      ))}

                    {/* Spokes from center to 5 vertices */}
                    {radarGeometry &&
                      radarGeometry.axes.map((axis, i) => (
                        <line
                          key={`axis-${i}`}
                          x1={axis.x1}
                          y1={axis.y1}
                          x2={axis.x2}
                          y2={axis.y2}
                          stroke="#334155"
                          strokeWidth="1"
                        />
                      ))}

                    {/* Data Polygon */}
                    {radarGeometry && (
                      <>
                        <polygon
                          points={radarGeometry.polygonPoints}
                          fill={getCategoryColor(selectedReg.category)}
                          fillOpacity="0.35"
                          stroke={getCategoryColor(selectedReg.category)}
                          strokeWidth="2.5"
                        />
                        {radarGeometry.points.map((pt, i) => (
                          <circle
                            key={`radar-pt-${i}`}
                            cx={pt.x}
                            cy={pt.y}
                            r={4}
                            fill="#ffffff"
                            stroke={getCategoryColor(selectedReg.category)}
                            strokeWidth="2"
                          />
                        ))}
                      </>
                    )}

                    {/* Labels around perimeter */}
                    {radarGeometry &&
                      radarGeometry.axes.map((axis, i) => (
                        <text
                          key={`label-${i}`}
                          x={axis.labelX}
                          y={axis.labelY}
                          textAnchor={axis.labelX < 125 ? 'end' : axis.labelX > 135 ? 'start' : 'middle'}
                          className="text-[9px] font-black fill-slate-300 uppercase tracking-wider"
                        >
                          {axis.label} ({axis.value})
                        </text>
                      ))}
                  </svg>
                </div>

                {/* Score breakdown pills */}
                <div className="grid grid-cols-5 gap-1.5 w-full mt-2 text-center">
                  <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Effort</div>
                    <div className="text-xs font-black text-amber-400">{selectedReg.effort}/5</div>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Liability</div>
                    <div className="text-xs font-black text-red-400">{selectedReg.liability}/5</div>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Market</div>
                    <div className="text-xs font-black text-sky-400">{selectedReg.market}/5</div>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Data</div>
                    <div className="text-xs font-black text-purple-400">{selectedReg.data}/5</div>
                  </div>
                  <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-[8px] font-bold text-slate-400 uppercase">Enforce</div>
                    <div className="text-xs font-black text-emerald-400">{selectedReg.enforce}/5</div>
                  </div>
                </div>
              </div>

              {/* Executive Synopsis */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  Statutory Objective & Scope
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {selectedReg.desc}
                </p>
              </div>

              {/* Statutory "Must Do" Action Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Statutory Action Checklist ({selectedReg.mustDoList.length} Requirements)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {Object.values(completedMustDos[selectedReg.id] || {}).filter(Boolean).length} / {selectedReg.mustDoList.length} Completed
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedReg.mustDoList.map((item, idx) => {
                    const isChecked = !!(completedMustDos[selectedReg.id] && completedMustDos[selectedReg.id][idx]);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleMustDo(selectedReg.id, idx)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl text-xs cursor-pointer transition border ${
                          isChecked
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <span className={`leading-relaxed ${isChecked ? 'line-through opacity-80' : 'font-medium'}`}>
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* In-Scope Industry Tags */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Target Industry Applicability:
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedReg.industryList.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* NetZeroCalc Deep-Link Bridge */}
              {onNavigateToTab && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  {selectedReg.id.includes('csrd') && (
                    <button
                      onClick={() => onNavigateToTab('csrd-materiality')}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      Open CSRD Double Materiality Hub
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {selectedReg.id.includes('csddd') && (
                    <button
                      onClick={() => onNavigateToTab('omnibus-csddd')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Shield className="w-4 h-4" />
                      Open CSDDD 6-Step Readiness Engine
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(selectedReg.id.includes('cbam') || selectedReg.id.includes('ets')) && (
                    <button
                      onClick={() => onNavigateToTab('carbon-cost')}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      Open Carbon Cost & EUA Simulator
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {selectedReg.id.includes('taxonomy') && (
                    <button
                      onClick={() => onNavigateToTab('ghg-calculator')}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      Open GHG Master Calculator
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
              <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No Regulation Selected
              </div>
              <p className="text-xs mt-1">
                Select any regulation from the scatter matrix or shortlist table.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Bottom Section: Boardroom Compliance Shortlist Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Boardroom Compliance Shortlist Table
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive registry of all {sortedRegs.length} regulations matching current sector, timeline, and policy filters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {sortedRegs.length} of {EU_REGULATIONS_60.length} regulations
            </span>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                <th
                  onClick={() => handleSort('acronym')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Regulation</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Policy Domain</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('timeline')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Horizon</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('quadrant')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>Quadrant</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('effort')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Effort</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('liability')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Liability</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('enforce')}
                  className="py-3 px-4 text-center cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Enforcement</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Legal Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {sortedRegs.length > 0 ? (
                sortedRegs.map((reg) => {
                  const isSelected = selectedReg && selectedReg.id === reg.id;
                  const quad = getRegulationQuadrant(reg);

                  return (
                    <tr
                      key={reg.id}
                      onClick={() => setSelectedRegId(reg.id)}
                      className={`transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{reg.acronym}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                          {reg.fullName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
                          style={{ backgroundColor: getCategoryColor(reg.category) }}
                        >
                          {reg.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {reg.timeline}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getQuadrantBadgeClass(quad)}>
                          {quad}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-amber-500">{reg.effort}</span>
                          <span className="text-[10px] text-slate-400">/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-red-500">{reg.liability}</span>
                          <span className="text-[10px] text-slate-400">/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          <span className="text-emerald-500">{reg.enforce}</span>
                          <span className="text-[10px] text-slate-400">/5</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={getLegalStatusBadgeClass(reg.legalStatus)}>
                          {reg.legalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegId(reg.id);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    <div className="text-sm font-bold text-slate-500">
                      No regulations match the current filter selection.
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
