import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, FileText, Lock, Check, BarChart2, 
  Download, Loader2, TrendingDown, TrendingUp, Calendar, ChevronDown, FileSpreadsheet, Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, Legend 
} from 'recharts';
import { pdf } from '@react-pdf/renderer';
import GhgDeclarationDocument from '../pdf/GhgDeclarationDocument.jsx';
import { downloadBrsrCorePcfJson, downloadBrsrCorePcfCsv } from '../services/pcfExport.js';
import { downloadOpenLcaJsonLd } from '../services/openLcaBridge.js';

export default function ComplianceView({ 
  currentBOM, 
  userProfile = { name: '', role: 'Internal Analyst' },
  activeProject, 
  activePeriod,
  periods = [],
  baseYearPeriod,
  accountingStandard, 
  appliedScenario, 
  showToast 
}) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isReady = currentBOM.length > 0 && currentBOM.every(i => i.approved);
  const totalFootprint = currentBOM.reduce((acc, i) => acc + (i.result_tco2e !== undefined && i.result_tco2e !== null ? i.result_tco2e : (i.qty * i.ef / 1000)), 0);
  // Stable serial from project state — never regenerate on render
  const declarationSerial = activeProject?.declarationSerial || `DECL-GHG-${activePeriod?.year || new Date().getFullYear()}-000000`;

  // Base Year Calculations for YoY Reduction Target Tracking
  const baseYearTotal = useMemo(() => {
    if (!baseYearPeriod || !baseYearPeriod.bom) return 0;
    return baseYearPeriod.bom.reduce((acc, i) => {
      if (i.result_tco2e !== undefined && i.result_tco2e !== null) return acc + Number(i.result_tco2e);
      return acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000);
    }, 0);
  }, [baseYearPeriod]);

  const vsBaseYearDeltaPct = useMemo(() => {
    if (baseYearTotal <= 0) return 0;
    return ((totalFootprint - baseYearTotal) / baseYearTotal) * 100;
  }, [totalFootprint, baseYearTotal]);

  // Multi-Period Historical Trend Dataset for Recharts
  const multiPeriodTrendData = useMemo(() => {
    if (!periods || periods.length === 0) return [];
    return periods.map(p => {
      const pBom = p.bom || [];
      const s1 = pBom.filter(i => i.scope === 'Scope 1').reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);
      const s2 = pBom.filter(i => i.scope === 'Scope 2').reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);
      const s3 = pBom.filter(i => (i.scope || 'Scope 3') === 'Scope 3').reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);
      return {
        year: `FY${p.year}`,
        yearNum: p.year,
        isBase: p.isBaseYear,
        'Scope 1': parseFloat(s1.toFixed(3)),
        'Scope 2': parseFloat(s2.toFixed(3)),
        'Scope 3': parseFloat(s3.toFixed(3)),
        'Total Footprint': parseFloat((s1 + s2 + s3).toFixed(3))
      };
    }).sort((a, b) => a.yearNum - b.yearNum);
  }, [periods]);

  // Scope 3 Category Aggregation Data for CSRD / CBAM / ISO 14064 Compliance
  const scope3CategoryData = useMemo(() => {
    const map = {};
    currentBOM.filter(i => (i.scope || 'Scope 3') === 'Scope 3').forEach(item => {
      const cat = item.scope3Category || 'Cat 1: Purchased Goods & Services';
      const val = item.result_tco2e !== undefined && item.result_tco2e !== null 
        ? Number(item.result_tco2e) 
        : ((Number(item.qty) || 0) * (Number(item.ef) || 0)) / 1000;
      map[cat] = (map[cat] || 0) + val;
    });
    const colors = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#065f46'];
    return Object.entries(map).map(([name, value], idx) => ({
      name,
      shortName: name.length > 28 ? name.slice(0, 26) + '...' : name,
      value: parseFloat(value.toFixed(3)),
      color: colors[idx % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [currentBOM]);

  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      if (showToast) showToast("Generating high-resolution audit PDF document...");

      const doc = (
        <GhgDeclarationDocument
          currentBOM={currentBOM}
          userProfile={userProfile}
          activeProject={activeProject}
          activePeriod={activePeriod}
          periods={periods}
          baseYearPeriod={baseYearPeriod}
          accountingStandard={accountingStandard}
          appliedScenario={appliedScenario}
          declarationSerial={declarationSerial}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const projectNameSanitized = (activeProject?.projectName || activeProject?.name || 'NetZeroCalc').replace(/\s+/g, '_');
      const dateStamp = new Date().toISOString().slice(0, 10);
      const fileName = `${projectNameSanitized}_GHG_Declaration_${dateStamp}.pdf`;

      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      if (showToast) showToast(`Downloaded ${fileName}`);
    } catch (err) {
      console.error("PDF export failed:", err);
      if (showToast) showToast("Failed to generate PDF document. Please check console.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Audit Readiness & Inventory Disclosure Structure</span>
          </div>
          <h2 className="text-xl font-black text-white">Pre-Audit Internal GHG Inventory Declaration</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Downloadable audit-ready PDF declaration and assurance summary formatted for ISO 14064, BRSR Core, and EU CBAM pre-verification.
          </p>
        </div>

        {/* Unified Export Dropdown */}
        <div className="relative" ref={exportDropdownRef}>
          <button 
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            disabled={isGeneratingPDF}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] active:scale-[0.96] flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Reports & Bridges</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 mb-1">
                Download Formats & Bridges
              </div>

              {/* 1. Audit PDF */}
              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  handleExportPDF();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors mt-0.5">
                  <Download className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Audit Declaration PDF (A4)</div>
                  <div className="text-[10px] text-slate-500">5-page vector assurance summary</div>
                </div>
              </button>

              {/* 2. BRSR Core PCF JSON */}
              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  downloadBrsrCorePcfJson(activeProject);
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">BRSR Core PCF (JSON)</div>
                  <div className="text-[10px] text-slate-500">SEBI Principle 6 disclosure schema</div>
                </div>
              </button>

              {/* 3. BRSR Core PCF CSV */}
              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  downloadBrsrCorePcfCsv(activeProject);
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 transition-colors mt-0.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">BRSR Core PCF (CSV)</div>
                  <div className="text-[10px] text-slate-500">Spreadsheet table for statutory filing</div>
                </div>
              </button>

              {/* 4. openLCA JSON-LD */}
              <button
                onClick={() => {
                  setIsExportDropdownOpen(false);
                  downloadOpenLcaJsonLd(activeProject);
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50 text-slate-800 transition-colors flex items-start gap-2.5 cursor-pointer group"
              >
                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700 group-hover:bg-teal-200 transition-colors mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">openLCA JSON-LD (.jsonld)</div>
                  <div className="text-[10px] text-slate-500">ILCD process flow for openLCA import</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audit Integrity Compliance Banner */}
      <div className="p-4 bg-amber-50 rounded-xl text-amber-900 text-xs flex items-start gap-3 print:hidden">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold text-slate-900">Audit & Disclosure Integrity Disclosure Notice:</div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            This document is a self-calculated internal inventory disclosure prepared for pre-audit review. It <strong>does NOT</strong> constitute an official independent third-party ISAE 3410 assurance report or ISO 14064-3 certificate. Third-party assurance requires independent practitioner engagement, verification of primary source evidence, and practitioner sign-off.
          </p>
        </div>
      </div>

      {/* Main Report Document Surface */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
        
        {/* Document Title Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SELF-REPORTED GREENHOUSE GAS DISCLOSURE</div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">PRE-AUDIT INTERNAL GHG INVENTORY DECLARATION</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Calculated in accordance with {accountingStandard} & IPCC AR6 GWP Standards</p>
          </div>

          <div className="text-right">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black inline-block mb-1 border ${
              isReady 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {isReady ? 'INTERNAL DRAFT — REVIEW READY' : 'UNAPPROVED ITEMS PENDING'}
            </span>
            <div className="text-[10px] font-bold text-slate-500">
              {userProfile?.name 
                ? `Prepared by: ${userProfile.name} (${userProfile.role || 'Preparer'})` 
                : 'Self-Reported Internal Calculation (Unverified)'
              }
            </div>
          </div>
        </div>

        {/* Section 1: Self-Declaration Statement */}
        <div className="text-xs space-y-3 text-slate-600 leading-relaxed">
          <p>
            This internal disclosure statement presents the quantified Greenhouse Gas Inventory for{' '}
            <strong className="text-slate-900 font-bold">{activeProject?.projectName || 'Scope 1-3 Carbon Inventory'}</strong> (
            <strong className="text-slate-900 font-bold">{activeProject?.companyName || 'Corporate Entity'}</strong>) evaluated under{' '}
            <strong className="text-slate-900 font-bold">{accountingStandard}</strong> using <strong className="text-slate-900 font-bold">India GHG Factors v6</strong> database.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium space-y-1.5 text-slate-800">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <strong>QUANTIFIED INVENTORY BOUNDARY:</strong> Calculated Total Footprint (Location-Based): <strong className="font-mono">{totalFootprint.toFixed(3)} tCO₂e</strong>
              </div>
              {!activePeriod?.isBaseYear && (
                baseYearTotal > 0 ? (
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-600">vs. Base Year (FY{baseYearPeriod?.year || 2023}):</span>
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-black ${
                      vsBaseYearDeltaPct <= 0 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {vsBaseYearDeltaPct <= 0 ? '↓' : '↑'} {Math.abs(vsBaseYearDeltaPct).toFixed(1)}% {vsBaseYearDeltaPct <= 0 ? 'Emissions Reduction' : 'Emissions Increase'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-slate-600">vs. Base Year (FY{baseYearPeriod?.year || 2023}):</span>
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-black bg-slate-100 text-slate-500 border border-slate-300">Base Year Not Set</span>
                  </div>
                )
              )}
            </div>

            {activeProject?.coverBoundary && (
              <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                <div><strong>Consolidation Approach:</strong> {activeProject.coverBoundary.consolidationApproach || 'Operational Control'}</div>
                <div><strong>Reporting Period:</strong> FY{activePeriod?.year || activeProject.coverBoundary.reportingPeriod || '2024'}</div>
                <div><strong>Official Base Year:</strong> FY{baseYearPeriod?.year || activeProject.coverBoundary.baseYear || '2023'}</div>
                <div><strong>Materiality Threshold:</strong> {activeProject.coverBoundary.materialityThreshold || '5%'}</div>
              </div>
            )}
            <div className="text-[11px] text-slate-500 mt-2">
              GWP Basis: {activeProject?.coverBoundary?.gwpVintage || 'IPCC AR6 (100-year GWP horizon)'}. Primary operational boundary defined by reporting entity.
            </div>
          </div>
        </div>

        {/* Multi-Period Historical Carbon Trend Chart */}
        {multiPeriodTrendData.length > 1 && (
          <div className="pdf-chart-container p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Multi-Period Corporate Carbon Trend (Base Year vs. Historical Progress)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">
                {multiPeriodTrendData.length} Reporting Periods Tracked
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiPeriodTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }} />
                  <YAxis unit=" t" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(val, name) => [`${val} tCO₂e`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="Total Footprint" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} />
                  <Line type="monotone" dataKey="Scope 1" stroke="#9333ea" strokeWidth={1.5} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="Scope 2" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="Scope 3" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Scope 3 Category Breakdown Chart (CSRD & CBAM Alignment) */}
        {scope3CategoryData.length > 0 && (
          <div className="pdf-chart-container p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  Scope 3 Value Chain Category Distribution (GHG Protocol Standard)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                {scope3CategoryData.length} Categories Active
              </span>
            </div>
            
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scope3CategoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" unit=" t" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="shortName" tick={{ fontSize: 10, fill: '#1e293b', fontWeight: 600 }} width={160} />
                  <Tooltip 
                    formatter={(val, name, item) => [`${val} tCO₂e`, item.payload.name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#ffffff', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {scope3CategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Section 2: Quantified Inventory Table */}
        <div className="space-y-2">
          <h3 className="font-black text-xs text-slate-900 uppercase tracking-wider">Quantified GHG Inventory Scope Breakdown</h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Scope</th>
                  <th className="p-2.5">GHG Protocol Category</th>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5 text-right">Activity Data</th>
                  <th className="p-2.5">LCI Factor Source</th>
                  <th className="p-2.5 text-right">EF (kgCO₂e/unit)</th>
                  <th className="p-2.5 text-right">Footprint (tCO₂e)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {currentBOM.map(item => {
                  const co2e = (item.result_tco2e !== undefined && item.result_tco2e !== null) ? item.result_tco2e.toFixed(3) : ((item.qty * item.ef) / 1000).toFixed(3);
                  return (
                    <tr key={item.id}>
                      <td className="p-2.5 font-bold"><span className="px-1.5 py-0.5 rounded text-[9px] border bg-slate-100 text-slate-800 border-slate-300">{item.scope || 'Scope 3'}</span></td>
                      <td className="p-2.5 text-slate-700 font-semibold">{item.scope3Category || 'Cat 1: Goods & Services'}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-2.5 text-right font-mono">{item.qty.toLocaleString()} {item.unit}</td>
                      <td className="p-2.5 text-slate-600 max-w-[180px] truncate">{item.process}</td>
                      <td className="p-2.5 text-right font-mono">{item.ef}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-800">{co2e} t</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Scenario & Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">ISO 14064-2 Decarbonization Scenario</h4>
            {appliedScenario ? (
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <div>Baseline Footprint: <strong>{appliedScenario.baselineTotal?.toFixed(3)} tCO₂e</strong></div>
                <div>Avoided Emissions: <strong className="text-emerald-700">+{appliedScenario.avoidedTotal?.toFixed(3)} tCO₂e</strong></div>
                <div>Net Footprint: <strong>{appliedScenario.netFootprint?.toFixed(3)} tCO₂e</strong></div>
              </div>
            ) : (
              <div className="text-slate-500">No scenario applied yet. Use What-If Simulator to apply decarbonization levers.</div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-right">
            <h4 className="font-bold text-slate-900 uppercase text-[11px]">Declaration Serial & Verification Posture</h4>
            <div className="font-mono font-bold text-slate-800 text-xs">{declarationSerial}</div>
            <div className="text-[10px] text-slate-500">
              {userProfile?.name ? `Report Preparer: ${userProfile.name} • Internal Self-Declaration` : 'Self-Reported Internal Calculation (Unverified)'}
            </div>
          </div>

        </div>
        
        {/* Bottom Centered Export Button */}
        <div className="flex justify-center pt-6 pb-2">
          <button 
            onClick={() => {
              handleExportPDF();
            }}
            disabled={isGeneratingPDF}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] active:scale-[0.96] flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Audit Report</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
