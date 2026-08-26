import React from 'react';
import { ArrowRight, ShieldCheck, Database, CheckCircle, Activity, Server, FileText, Check, X, AlertTriangle } from 'lucide-react';

export default function LandingPage({ onLaunchDemo }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="absolute top-0 w-full px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Activity className="text-white w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">NetZeroCalc</span>
        </div>
        <div className="hidden md:flex gap-8 text-xs font-semibold text-slate-400">
          <button 
            onClick={() => document.getElementById('methodology')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Methodology
          </button>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            Workflow & Features
          </button>
          <button 
            onClick={() => document.getElementById('disclaimer')?.scrollIntoView({ behavior: 'smooth' })} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            What This Is & Isn't
          </button>
        </div>
        <button 
          onClick={onLaunchDemo}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Launch Workspace →
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[85vh] overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-semibold tracking-wide uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            v0.1.0-alpha • Open-Source BOM-to-LCI Prototype
          </div>
          
          {/* Single Tasteful Gradient on Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400 leading-tight">
            NetZeroCalc: BOM-to-LCI Carbon Footprint Mapper
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Map manufacturing Bills of Materials to Life Cycle Inventory processes transparently and efficiently. A lightweight, open-source tool for product carbon footprint (PCF) prototyping and ESG education. Built by an ESG practitioner, for ESG practitioners.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button 
              onClick={onLaunchDemo}
              className="group flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              Launch Demo Workspace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('disclaimer')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-6 py-3.5 text-slate-300 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Review Scope & Boundaries
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards / Transparent by Design */}
      <section id="features" className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Transparent by Design</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Built from the ground up for transparent semantic matching and practitioner oversight. Every calculation is traceable, editable, and backed by verifiable open emission factors.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Approval Workflow</h3>
              <p className="text-slate-400 leading-relaxed text-xs">
                Track which BOM line items were auto-mapped, manually overridden, or flagged for review with audit-ready operator attribution and DQR justifications.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <Database className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Open Factor Citations</h3>
              <p className="text-slate-400 leading-relaxed text-xs">
                Every suggested LCI match includes the emission factor source, version date, and geographic boundary (DEFRA 2024, India GHG Factors v6, EU CBAM benchmarks).
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
              <FileText className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold mb-2">Structured PCF Exports</h3>
              <p className="text-slate-400 leading-relaxed text-xs">
                Generate CSV, JSON, BRSR Core PCF templates, and openLCA-compliant JSON-LD exchange files for internal review. Not a substitute for third-party verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology & Engine Specs Section */}
      <section id="methodology" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Rigorous Methodology</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              We align with globally recognized LCA standards. Our computation engine processes Bill of Materials line items through cradle-to-gate LCI mapping and Data Quality Rating (DQR) Pedigree scoring.
            </p>
            
            <ul className="space-y-3.5 text-sm">
              {[
                "ISO 14040 & ISO 14044 (Life Cycle Assessment Principles & Framework)",
                "GHG Protocol Product Life Cycle Accounting and Reporting Standard",
                "Pedigree Matrix DQR Scoring (Reliability, Completeness, Temporal, Geo, Tech)",
                "IPCC AR6 Global Warming Potentials (100-year GWP horizon)"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300 font-medium text-xs sm:text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Engine Specifications</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">v0.1.0-alpha</span>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Focus</span>
                  <span className="text-emerald-300 font-bold">BOM-to-LCI Mapping</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Methodology</span>
                  <span className="text-slate-300">ISO 14040/44 & GHG Product</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Factor DBs</span>
                  <span className="text-slate-300">DEFRA 2024 / CEA v6 / CBAM</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Data Quality</span>
                  <span className="text-slate-300">DQR (Pedigree Matrix)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Export Bridges</span>
                  <span className="text-slate-300">CSV, JSON, BRSR, openLCA</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/80">
                  <span className="text-slate-500">Operational Status</span>
                  <span className="text-amber-400 font-bold">Educational Prototype</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What This Tool Is & What It Isn't (Honest Disclaimers) */}
      <section id="disclaimer" className="py-20 px-6 bg-slate-900/40 border-t border-slate-800/80 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Scope, Boundary & Intended Use
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">What This Tool Is — And Isn't</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mt-2 text-xs sm:text-sm">
              Transparency and academic honesty are central to our development posture. Here is an honest breakdown of capabilities:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* What it IS */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-emerald-400">NetZeroCalc IS:</h3>
              </div>
              <ul className="space-y-3 text-slate-300 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>A learning and prototyping tool for BOM-to-LCI mapping methodology.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>A rapid prototyping workbench for product carbon footprint (PCF) calculations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>An open-source reference implementation for ESG students and practitioners.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>A transparent, formula-exposed alternative to opaque black-box carbon calculators.</span>
                </li>
              </ul>
            </div>

            {/* What it IS NOT */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-rose-400">NetZeroCalc is NOT:</h3>
              </div>
              <ul className="space-y-3 text-slate-300 text-xs sm:text-sm">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>An enterprise audit-ready corporate GHG inventory platform.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>A substitute for ISO 14064-3 / ISO 14044 third-party assurance statements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>A direct filing tool for regulatory mandates (BRSR, CSRD, CDP) without practitioner review.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>A complete replacement for full-suite enterprise LCA software (e.g. openLCA, SimaPro).</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs leading-relaxed text-center">
            <strong className="text-slate-300">Regulatory & Practitioner Notice:</strong> All computational outputs represent screening-level calculations and require review by a qualified LCA practitioner before use in regulated disclosures. Demonstration data utilizes open-access emission factors (DEFRA, CEA, EU ETS). For enterprise deployments, import your private licensed database instances (e.g., ecoinvent) via Bring-Your-Own-License (BYOL).
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-slate-600 text-xs">
        <p>© {new Date().getFullYear()} NetZeroCalc. Open-source educational prototype by Arunachalam Venkatachalapathy.</p>
      </footer>
    </div>
  );
}
