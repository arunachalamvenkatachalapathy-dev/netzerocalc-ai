import React, { useState, useMemo, useEffect } from 'react';
import {
  Scale,
  Search,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  FileText,
  Filter,
  Layers,
  ChevronRight,
  X,
  Globe,
  Info,
  Building2,
  CheckCircle2
} from 'lucide-react';
import {
  REGULATIONS_2026_DATABASE,
  REGULATION_STATUSES,
  REGULATION_REGIONS
} from '../../data/regulations2026Data.js';
import {
  fetchRegulations,
  getRegulationStats,
  exportRegulationsToCSV,
  exportRegulationsToJSON
} from '../../services/regulationService.js';

export default function RegulationsTrackerView() {
  const [regulations, setRegulations] = useState(REGULATIONS_2026_DATABASE);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedReg, setInspectedReg] = useState(null);

  // Fetch regulations on mount or filter change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await fetchRegulations({
        status: selectedStatus,
        region: selectedRegion,
        search: searchQuery
      });
      if (isMounted) {
        setRegulations(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [selectedStatus, selectedRegion, searchQuery]);

  // Compute aggregated stats
  const stats = useMemo(() => getRegulationStats(REGULATIONS_2026_DATABASE), []);

  const getStatusBadge = (statusCode, label) => {
    switch (statusCode) {
      case 'in-force':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {label || 'In Force'}
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {label || 'Upcoming / Phased-in'}
          </span>
        );
      case 'developing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            {label || 'Developing'}
          </span>
        );
      case 'not-in-force':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {label || 'Not in Force'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-8 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
            <Scale className="w-3.5 h-3.5" />
            Global Compliance Tracker • Status 2026
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sustainability Reporting Regulations
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A comprehensive, verified regulatory intelligence tracker covering corporate ESG reporting mandates, greenhouse gas disclosure requirements, assurance timelines, and official legal sources across all G20 and international jurisdictions.
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tracked</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Jurisdictions & Frameworks</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
            In Force
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.inForce}</div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            {((stats.inForce / stats.total) * 100).toFixed(0)}% of tracked regimes
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            Upcoming
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.upcoming}</div>
          <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">Phasing in 2025–2027</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Developing
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.developing}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In consultation / roadmap</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Not in Force
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.notInForce}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">No statewide mandate</div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Status Pills */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {REGULATION_STATUSES.map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedStatus === st.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportRegulationsToCSV(regulations)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition shadow-xs"
              title="Download filtered regulations as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              Export CSV
            </button>
            <button
              onClick={() => exportRegulationsToJSON(regulations)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition shadow-xs"
              title="Download filtered regulations as JSON"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Search & Region Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, acronym (CSRD, BRSR, SEC), regulation name, or authority..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              {REGULATION_REGIONS.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 4. Regulations Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Regulatory Mandates Registry
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{regulations.length}</strong> of {stats.total} regulations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Country / Region</th>
                <th className="py-3 px-4">Regulation Title</th>
                <th className="py-3 px-3">Short Form</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-3">Timeline</th>
                <th className="py-3 px-4">Authority &amp; Source</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {regulations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No regulations match your filter or search criteria.
                  </td>
                </tr>
              ) : (
                regulations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => setInspectedReg(reg)}
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="mr-2 text-base">{reg.flag}</span>
                      {reg.country}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium max-w-sm">
                      <div className="line-clamp-2">{reg.regulation}</div>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        {reg.shortForm}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(reg.statusCode, reg.status)}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {reg.year}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <a
                        href={reg.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition underline underline-offset-2"
                      >
                        {reg.sourceName || 'Official Source'}
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedReg(reg);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Detail Inspector Drawer */}
      {inspectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-950/50 backdrop-blur-xs">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{inspectedReg.flag}</span>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{inspectedReg.country}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {inspectedReg.shortForm}
                  </h3>
                </div>
              </div>
              <button
                aria-label="Close detail drawer"
                onClick={() => setInspectedReg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="mt-5 space-y-5 text-xs">
              
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Full Legal Title</label>
                <div className="text-slate-900 dark:text-white text-sm font-semibold mt-1">
                  {inspectedReg.regulation}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                  <div className="mt-1">{getStatusBadge(inspectedReg.statusCode, inspectedReg.status)}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Enforcement Timeline</span>
                  <div className="mt-1 font-mono font-bold text-slate-900 dark:text-white text-sm">{inspectedReg.year}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Regulating Authority</span>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5">{inspectedReg.authority}</div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Materiality Approach</span>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5">{inspectedReg.materiality}</div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Assurance Requirement</span>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5">{inspectedReg.assurance}</div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">GHG Scope Coverage</span>
                  <div className="font-medium text-slate-900 dark:text-white mt-0.5 text-emerald-600 dark:text-emerald-400">
                    {inspectedReg.ghgScopesRequired}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Regulatory Scope &amp; Legal Mandate</label>
                <p className="mt-1.5 text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {inspectedReg.scopeSummary}
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={inspectedReg.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
                >
                  Visit Official Regulatory Publication
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
