import React, { useState } from 'react';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight,
  Layers, Sliders, ShieldCheck, Award, Bot, FileText, Trash2, Minimize2, Maximize2, Compass
} from 'lucide-react';

export default function TutorialGuideDock({ 
  isOpen, 
  onClose, 
  activeTab,
  onNavigateTab, 
  onLoadDemoData, 
  onClearData,
  onOpenAiCopilot
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const TUTORIAL_STEPS = [
    {
      title: '1. BOM & Activity Data Workbench',
      subtitle: 'Spreadsheet Import, EPD PDF Parser (>250KB) & Scope 1-3 Classification',
      icon: Layers,
      color: 'from-emerald-500 to-emerald-600',
      badge: 'Step 1 of 5 • Data Intake',
      targetTab: 'workbench',
      description: 'Your central hub for corporate activity data and product bills of materials. Physical parts are mapped to verified LCI background emission factors.',
      highlights: [
        'Import Excel / CSV or use Quick Add Presets (Diesel, Grid Electricity, Raw Aluminium).',
        'PDF Document Parser: Upload EPD certificates or supplier invoices >250KB to extract materials.',
        'Automatic Scope 1, Scope 2 location-based, and Scope 3 supply chain classification.'
      ]
    },
    {
      title: '2. ISO 14064-2 Decarbonization Simulator',
      subtitle: 'Model What-If Material Substitution & Clean Energy Scenarios',
      icon: Sliders,
      color: 'from-blue-500 to-blue-600',
      badge: 'Step 2 of 5 • Decarbonization',
      targetTab: 'simulator',
      description: 'Model real-time carbon reduction pathways without altering your verified baseline inventory ledger.',
      highlights: [
        'Recycled Material Levers: Test shifting virgin primary aluminium (14.2 kgCO2e/kg) to secondary recycled aluminium (1.8 kgCO2e/kg).',
        'Renewable Power PPA: Simulate shifting from national grid mix to on-site solar or green electricity.',
        'Instant Net Delta Calculation: Calculates net tCO2e savings and percentage reductions in real-time.'
      ]
    },
    {
      title: '3. EU CBAM & Financial Tax Liability',
      subtitle: 'Compare Benchmarks & Estimate Certificate Costs',
      icon: ShieldCheck,
      color: 'from-indigo-500 to-indigo-600',
      badge: 'Step 3 of 5 • Compliance',
      targetTab: 'cbam',
      description: 'Evaluate your imported goods against official European Union Carbon Border Adjustment Mechanism regulations.',
      highlights: [
        'Benchmark Comparison: Automatically tests your materials against EU defaults (15.2 tCO2e/t) and best-in-class targets (7.2 tCO2e/t).',
        'Financial Liability Engine: Calculates estimated EU ETS certificate costs in Euros (€85/tCO2e) factoring in 2026 phase-in free allowances.',
        'Precursor Tracking: Maps unwrought aluminium, structural steel, and complex goods with CN codes.'
      ]
    },
    {
      title: '4. Data Quality Rating (DQR) & Pedigree',
      subtitle: 'Pedigree Matrix & Lead Auditor Quality Assurance',
      icon: Award,
      color: 'from-amber-500 to-amber-600',
      badge: 'Step 4 of 5 • Verification',
      targetTab: 'dqr',
      description: 'Assess the reliability, completeness, and geographical/temporal representativeness of your emission factors.',
      highlights: [
        'Pedigree Matrix: Scores Temporal (TER), Geographical (GER), and Technological (TIR) representativeness from 1 to 5.',
        'Primary Data Ratio: Tracks the percentage of site-specific supplier verified data.',
        'Lead Auditor Pre-Verification: Ensures audit readiness for third-party ISO 14064-1 verification.'
      ]
    },
    {
      title: '5. AI Copilot & Multi-Standard Export',
      subtitle: 'Live Screen Context AI Auditing & Official Declarations',
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      badge: 'Step 5 of 5 • AI & Exports',
      targetTab: 'workbench',
      description: 'Ask natural-language questions about your project footprint and export verified compliance packages.',
      highlights: [
        'Screen-Aware AI Copilot: Gemma & Gemini powered agent reads your live screen figures to give instant audit advice.',
        'SEBI BRSR Core PCF: Export Principle 6 product carbon footprint templates for Indian regulatory compliance.',
        'openLCA JSON-LD Bridge: Export ILCD-compliant packages directly into openLCA software.',
        'Vector PDF Declaration: Generates 5-page formal greenhouse gas declaration reports.'
      ]
    }
  ];

  const step = TUTORIAL_STEPS[currentStep];

  const goToStep = (idx) => {
    setCurrentStep(idx);
    const target = TUTORIAL_STEPS[idx];
    if (onNavigateTab && target.targetTab) {
      onNavigateTab(target.targetTab);
    }
    if (idx === 4 && onOpenAiCopilot) {
      onOpenAiCopilot();
    }
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-lg w-[92vw] sm:w-[480px] shadow-2xl rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl text-white overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5">
      
      {/* Top Header Bar */}
      <div className={`px-4 py-3 bg-gradient-to-r ${step.color} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.5 rounded text-white">
                {step.badge}
              </span>
            </div>
            <h3 className="text-xs font-black text-white truncate max-w-[260px]">{step.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            title={isMinimized ? "Expand Guide" : "Minimize Guide"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            title="Close Tutorial"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Step Progress Tracker */}
          <div className="flex bg-slate-950/80 px-3 py-1.5 gap-1 border-b border-slate-800">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => goToStep(idx)}
                className={`flex-1 py-1 px-1 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 transition-all ${
                  idx === currentStep 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{idx + 1}</span>
                <span className="hidden sm:inline truncate">{s.title.split('.')[1]?.split('&')[0] || ''}</span>
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3 text-xs">
            <p className="text-slate-300 font-medium leading-relaxed">
              {step.description}
            </p>

            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Live Features On This Screen:
              </span>
              {step.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                if (onClearData) onClearData();
                onClose();
              }}
              className="text-rose-400 hover:text-rose-300 font-bold text-[11px] flex items-center gap-1 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Clear all demo items and return to a clean blank canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear & Blank Slate</span>
            </button>

            <div className="flex items-center gap-1.5">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 flex items-center gap-0.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
              )}

              {currentStep < TUTORIAL_STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Next Screen</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>Finish Tour</span>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
