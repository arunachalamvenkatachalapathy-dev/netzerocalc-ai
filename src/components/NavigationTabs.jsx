import React, { useState, useRef, useEffect } from 'react';
import { 
  Table, Sliders, FolderKanban, FileCheck, Search, Globe, FileSpreadsheet, 
  ChevronDown, MoreHorizontal, Award, Building2, Calendar, Database, Scale,
  DollarSign, FileCheck2, ShieldCheck
} from 'lucide-react';

export default function NavigationTabs({ activeTab, setActiveTab, onOpenFacilityModal, onOpenPeriodModal, onOpenFactorRegistryModal }) {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primaryTabs = [
    { id: 'workbench', label: 'BOM Workbench', icon: Table },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'compliance', label: 'PCF Declaration', icon: FileCheck },
    { id: 'ghg-calculator', label: 'GHG Master Sheet', icon: FileSpreadsheet },
    { id: 'regulations', label: 'Regulations 2026', icon: Scale },
  ];

  // Secondary Tools & Registry (Dropdown)
  const toolTabs = [
    { id: 'csrd-materiality', label: 'CSRD Double Materiality', icon: FileCheck2, desc: '325 ESRS Post-Omnibus Datapoints & Matrix' },
    { id: 'omnibus-csddd', label: 'Omnibus & CSDDD Readiness', icon: ShieldCheck, desc: '61% Datapoint Cut & CSDDD 6-Step Due Diligence' },
    { id: 'carbon-cost', label: 'Carbon Cost & Shadow Pricing', icon: DollarSign, desc: 'EUA Trajectories to 2035 & Balance Sheet Liability' },
    { id: 'dqr', label: 'DQR & Pedigree', icon: Award, desc: 'ISO 14044 Pedigree Matrix & Quality Scores' },
    { id: 'cbam', label: 'EU CBAM Benchmark', icon: Globe, desc: 'EU Implementing Regs 2021/447 & 2024/873' },
    { id: 'lci-search', label: 'LCI Factor Search', icon: Search, desc: 'India GHG & Global Emission Database' },
    { id: 'projects', label: 'Audit Workspaces', icon: FolderKanban, desc: 'Multi-Entity Projects Registry' },
  ];

  const activeTool = toolTabs.find(t => t.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-3 relative z-20">
      <div className="p-1.5 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-1.5">
        
        {/* Primary Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsToolsOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold transition-all duration-300 active:scale-[0.96] rounded-xl whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] font-extrabold'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Tools & Utilities Dropdown (UI Fix C) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-300 active:scale-[0.96] border cursor-pointer ${
              activeTool
                ? 'bg-slate-900 text-white border-slate-800 shadow-md'
                : isToolsOpen
                  ? 'bg-white/80 text-slate-900 border-emerald-200 shadow-sm'
                  : 'bg-white/50 text-slate-700 hover:bg-white border-transparent hover:border-slate-200'
            }`}
          >
            {activeTool ? (
              <>
                <activeTool.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeTool.label}</span>
              </>
            ) : (
              <>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Tools & Registry</span>
              </>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isToolsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 mb-1">
                Corporate GHG Boundary
              </div>
              <button
                onClick={() => {
                  if (onOpenFacilityModal) onOpenFacilityModal();
                  setIsToolsOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 text-slate-700"
              >
                <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Facility Registry</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Operational Sites & Grid Region Mapping</div>
                </div>
              </button>
              <button
                onClick={() => {
                  if (onOpenPeriodModal) onOpenPeriodModal();
                  setIsToolsOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 text-slate-700"
              >
                <Calendar className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Reporting Periods</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Arbitrary Timelines, Base Year & Locks</div>
                </div>
              </button>
              <button
                onClick={() => {
                  if (onOpenFactorRegistryModal) onOpenFactorRegistryModal();
                  setIsToolsOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 text-slate-700 mb-1 pb-2 border-b border-slate-100"
              >
                <Database className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Emission Factor Registry</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Authoritative Factors, Overrides & Provenance</div>
                </div>
              </button>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100 mb-1">
                Calculators & Database Tools
              </div>
              {toolTabs.map(tool => {
                const ToolIcon = tool.icon;
                const isSelected = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTab(tool.id);
                      setIsToolsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isSelected ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <ToolIcon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">{tool.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tool.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
