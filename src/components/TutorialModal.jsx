import React, { useState } from 'react';
import { 
  Sparkles, X, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight,
  Layers, Sliders, ShieldCheck, Award, Bot, FileText, Trash2, Play
} from 'lucide-react';

export default function TutorialModal({ 
  isOpen, 
  onClose, 
  onNavigateTab, 
  onLoadDemoData, 
  onClearData,
  onOpenAiCopilot
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const TUTORIAL_STEPS = [
    {
      title: 'Welcome to NetZeroCalc Tutorial',
      subtitle: 'Complete Guided Walkthrough & Feature Mapping',
      icon: Sparkles,
      color: 'from-amber-500 to-amber-600',
      badge: 'Step 1 of 5 • Overview',
      tabKey: 'workbench',
      description: 'NetZeroCalc is an open-source carbon accounting and product carbon footprint (PCF) platform. We have loaded standard sample demo items into your workspace so you can explore all features interactively.',
      highlights: [
        'BOM & Activity Inventory: Map physical manufacturing parts to background LCI emission factors.',
        'Zero-Blank Confusion: Sample data allows you to test formulas, charts, and simulations immediately.',
        'You can clear demo data at any time with one click when you are ready to upload your real files.'
      ],
      actionLabel: 'Explore BOM Workbench',
      actionTab: 'workbench'
    },
    {
      title: '1. BOM & Activity Data Workbench',
      subtitle: 'Import Spreadsheets, Parse EPD PDFs, & Classify Scopes',
      icon: Layers,
      color: 'from-emerald-500 to-emerald-600',
      badge: 'Step 2 of 5 • Data Intake',
      tabKey: 'workbench',
      description: 'Your central hub for assembling corporate activity data and product bills of materials.',
      highlights: [
        'Import Excel / CSV: Upload your raw BOM files with component names, quantities, and units.',
        'PDF Document Parser (>250KB): Upload supplier invoices or EPD certificates to extract materials automatically.',
        'Scope 1, 2, & 3 Classification: Direct fuel combustion, electricity grid factors, and supply chain upstream items are classified automatically.',
        'Edit & Approve: Double-click quantities or use the factor search picker to customize emission factors.'
      ],
      actionLabel: 'Go to Workbench View',
      actionTab: 'workbench'
    },
    {
      title: '2. ISO 14064-2 Decarbonization Simulator',
      subtitle: 'Model Material Substitution & Clean Energy Scenarios',
      icon: Sliders,
      color: 'from-blue-500 to-blue-600',
      badge: 'Step 3 of 5 • Decarbonization',
      tabKey: 'simulator',
      description: 'Model real-time carbon reduction pathways without modifying your verified baseline ledger.',
      highlights: [
        'Recycled Material Levers: Test shifting virgin primary aluminium (14.2 kgCO2e/kg) to secondary recycled aluminium (1.8 kgCO2e/kg).',
        'Renewable Power PPA: Simulate shifting from national grid mix to on-site solar or green electricity.',
        'Real-Time Delta Tracking: Instant net tCO2e reduction calculation, percentage savings, and cost-benefit visualization.'
      ],
      actionLabel: 'Open Scenario Simulator',
      actionTab: 'simulator'
    },
    {
      title: '3. EU CBAM & Financial Tax Liability',
      subtitle: 'Compare Benchmarks & Estimate Certificate Costs',
      icon: ShieldCheck,
      color: 'from-indigo-500 to-indigo-600',
      badge: 'Step 4 of 5 • Compliance',
      tabKey: 'cbam',
      description: 'Evaluate your imported goods against official European Union Carbon Border Adjustment Mechanism regulations.',
      highlights: [
        'Benchmark Comparison: Automatically tests your materials against EU defaults (15.2 tCO2e/t) and best-in-class targets (7.2 tCO2e/t).',
        'Financial Liability Engine: Calculates estimated EU ETS certificate costs in Euros (€85/tCO2e) factoring in 2026 phase-in free allowances.',
        'Precursor Tracking: Maps unwrought aluminium, structural steel, and complex goods with CN codes.'
      ],
      actionLabel: 'View CBAM Analysis',
      actionTab: 'cbam'
    },
    {
      title: '4. AI Copilot & Multi-Standard Export',
      subtitle: 'Screen Context AI Audits & Regulatory Reports',
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      badge: 'Step 5 of 5 • AI & Exports',
      tabKey: 'workbench',
      description: 'Ask natural-language questions about your project footprint and export verified compliance packages.',
      highlights: [
        'Screen-Aware AI Copilot: Gemma & Gemini powered agent reads your live screen figures to give instant audit advice.',
        'SEBI BRSR Core PCF: Export Principle 6 product carbon footprint templates for Indian regulatory compliance.',
        'openLCA JSON-LD Bridge: Export ILCD-compliant packages directly into openLCA software.',
        'Vector PDF Declaration: Generates 5-page formal greenhouse gas declaration reports.'
      ],
      actionLabel: 'Open AI Copilot & Exports',
      actionTab: 'workbench'
    }
  ];

  const step = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      if (onNavigateTab && TUTORIAL_STEPS[nextIdx].actionTab) {
        onNavigateTab(TUTORIAL_STEPS[nextIdx].actionTab);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      if (onNavigateTab && TUTORIAL_STEPS[prevIdx].actionTab) {
        onNavigateTab(TUTORIAL_STEPS[prevIdx].actionTab);
      }
    }
  };

  const handleJumpToTab = (tab) => {
    if (onNavigateTab) onNavigateTab(tab);
    if (tab === 'workbench' && step.title.includes('AI Copilot') && onOpenAiCopilot) {
      onOpenAiCopilot();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className={`p-6 bg-gradient-to-r ${step.color} text-white flex justify-between items-start relative`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                {step.badge}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">{step.title}</h2>
            <p className="text-xs text-white/90 font-medium">{step.subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex bg-slate-100 p-1.5 gap-1.5 border-b border-slate-200">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (onNavigateTab && s.actionTab) onNavigateTab(s.actionTab);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                idx === currentStep 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                idx === currentStep ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {idx + 1}
              </span>
              <span className="hidden sm:inline truncate">{s.title.split('.')[1] || 'Overview'}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed font-medium">
            {step.description}
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Key Features & Usage Guide:
            </div>
            <div className="space-y-2">
              {step.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Button for this Feature */}
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Jump to this view in the app:</span>
            </div>
            <button
              onClick={() => handleJumpToTab(step.actionTab)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs shadow-sm hover:scale-105 active:scale-95"
            >
              <span>{step.actionLabel}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onClearData) onClearData();
                onClose();
              }}
              className="text-rose-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
              title="Clear demo data and start with an empty table"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Demo Data (Blank Slate)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-white flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md active:scale-95"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <span>Finish & Start Mapping</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
