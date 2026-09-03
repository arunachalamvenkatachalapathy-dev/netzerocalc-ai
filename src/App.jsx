import React, { useState, useEffect, Suspense, lazy } from 'react';
import Header from './components/Header.jsx';
import NavigationTabs from './components/NavigationTabs.jsx';
import WorkbenchView from './components/WorkbenchView.jsx';
import LciSearchTab from './components/LciSearchTab.jsx';
import SimulatorView from './components/SimulatorView.jsx';
import ProjectsView from './components/ProjectsView.jsx';
import ComplianceView from './components/ComplianceView.jsx';
import ImportModal from './components/ImportModal.jsx';
import GoogleSheetsModal from './components/GoogleSheetsModal.jsx';
import TutorialGuideDock from './components/TutorialGuideDock.jsx';
import CbamView from './components/CbamView.jsx';
import DqrDashboard from './components/DqrDashboard.jsx';
import LandingPage from './components/LandingPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import AiChatSidebar from './components/AiChatSidebar.jsx';
import { Bot, Building2, Calendar, Database } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './lib/firebase.js';
import { loadUserProjects, saveUserProject, deleteUserProject } from './lib/firestore.js';
import AuthScreen from './components/AuthScreen.jsx';
import FacilityManagementModal from './components/ghg/FacilityManagementModal.jsx';
import PeriodManagementModal from './components/ghg/PeriodManagementModal.jsx';
import FactorRegistryModal from './components/ghg/FactorRegistryModal.jsx';
import { normalizeProjectWithCorporate, loadAndMigrateProjects } from './services/ghg/projectMigration.js';
import { getActiveFacilitiesForPeriod } from './services/ghg/facilityService.js';
import RegulationsTrackerView from './components/regulations/RegulationsTrackerView.jsx';

const GhgCalculatorView = lazy(() => import('./components/GhgCalculatorView.jsx'));
import { INDIA_GHG_FACTORS } from './data/indiaGhgFactors.js';

// Interactive Tutorial Demo Items (Loaded on-demand when Tutorial is launched)
export const DEMO_BOM_2024 = [
  { id: 1, name: "Aluminum Sheet, Primary Ingot 5052-H32", qty: 1450, unit: "kg", process: "Aluminum Sheet Primary Ingot", ef: 14.2, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: false },
  { id: 2, name: "Custom Polyurethane Foam Insert", qty: 320, unit: "pcs", process: "Polyurethane Flexible Foam Fabrication", ef: 4.8, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: false },
  { id: 3, name: "Copper Wire Drawing 12 AWG", qty: 50, unit: "kg", process: "Copper Wire Drawing 12 AWG", ef: 6.5, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: false },
  { id: 4, name: "Grid Electricity (CEA India Grid Mix 2024)", qty: 12000, unit: "kWh", process: "Grid Electricity (CEA India Grid Mix 2024)", ef: 0.716, scope: "Scope 2", scope3Category: "N/A (Scope 2 Location-Based)", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] CEA Verified", approved: false },
  { id: 5, name: "Diesel Fuel (DG Sets & Power Generators)", qty: 500, unit: "Liters", process: "Diesel Fuel Thermal Combustion", ef: 2.6558, scope: "Scope 1", scope3Category: "N/A (Scope 1 Direct)", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] India GHG Factor", approved: false }
];

export const DEMO_BOM_2023 = [
  { id: 101, name: "Aluminum Sheet, Primary Ingot 5052-H32", qty: 1850, unit: "kg", process: "Aluminum Sheet Primary Ingot", ef: 14.2, scope: "Scope 3", scope3Category: "Cat 1: Purchased Goods & Services", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] Auto-Matched", approved: false },
  { id: 102, name: "Grid Electricity (CEA India Grid Mix 2024)", qty: 15500, unit: "kWh", process: "Grid Electricity (CEA India Grid Mix 2024)", ef: 0.716, scope: "Scope 2", scope3Category: "N/A (Scope 2 Location-Based)", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] CEA Verified", approved: false },
  { id: 103, name: "Diesel Fuel (DG Sets & Power Generators)", qty: 850, unit: "Liters", process: "Diesel Fuel Thermal Combustion", ef: 2.6558, scope: "Scope 1", scope3Category: "N/A (Scope 1 Direct)", gwpBasis: "IPCC AR6", ter: 1, ger: 1, tir: 1, risk: "LOW", status: "[DEMO DATA] India GHG Factor", approved: false }
];

// Clean Initial Projects (Clean Blank Slate by Default)
const INITIAL_PROJECTS = [
  {
    id: 'proj_default',
    projectName: 'Corporate Carbon Audit & Decarbonization Plan',
    companyName: 'My Enterprise Organization',
    standard: 'ISO 14064-1 & Scope 1-3',
    declarationSerial: 'DECL-GHG-2024-000001',
    periods: [
      {
        year: 2023,
        isBaseYear: true,
        label: 'FY2023 (Base Year)',
        bom: []
      },
      {
        year: 2024,
        isBaseYear: false,
        label: 'FY2024 (Current Period)',
        bom: []
      }
    ]
  }
];

const INITIAL_LOGS = [
  {
    id: 'log_init_1',
    timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
    action: 'WORKSPACE_INITIALIZED',
    summary: 'Initialized ISO 14064-1 corporate carbon accounting boundary for ACME Manufacturing.',
    author: 'System'
  },
  {
    id: 'log_init_2',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    action: 'BASE_YEAR_SET',
    summary: 'Designated FY2023 as official corporate GHG baseline reporting period.',
    author: 'Internal Analyst'
  },
  {
    id: 'log_init_3',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    action: 'INVENTORY_SYNC',
    summary: 'Imported verified Scope 1, 2, and 3 emission factors for FY2024 active inventory.',
    author: 'Internal Analyst'
  }
];

// Helper to calculate tCO2e of a BOM array
const computeBomTotal = (bom = []) => {
  return bom.reduce((acc, i) => {
    if (i.result_tco2e !== undefined && i.result_tco2e !== null) return acc + Number(i.result_tco2e);
    return acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000);
  }, 0);
};

// Project normalizer for multi-period, change log, and corporate GHG compatibility
const normalizeProject = (p) => {
  return normalizeProjectWithCorporate(p);
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) { setAuthLoading(false); return undefined; }
    return onAuthStateChanged(auth, (user) => { setFirebaseUser(user); setAuthLoading(false); });
  }, []);

  const [showLanding, setShowLanding] = useState(() => {
    return localStorage.getItem('netzerocalc_has_visited') !== 'true';
  });
  const [activeTab, setActiveTab] = useState('workbench');
  const [projects, setProjects] = useState(() => {
    return loadAndMigrateProjects(INITIAL_PROJECTS);
  });
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem('netzerocalc_active_proj_id') || 'proj_default';
  });
  const [activePeriodYear, setActivePeriodYear] = useState(() => {
    return parseInt(localStorage.getItem('netzerocalc_active_period')) || 2024;
  });

  const [accountingStandard, setAccountingStandard] = useState('ISO 14064-1 & Scope 1-3');
  const [geography, setGeography] = useState('IN');
  const [appliedScenario, setAppliedScenario] = useState(null);

  // Genuine User Profile (Removes fake credentials/auditor persona)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('netzerocalc_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Arunachalam Venkatachalapathy',
      role: 'Internal Analyst',
      organization: 'ACME Corp'
    };
  });

  useEffect(() => {
    if (!firebaseUser) return;
    loadUserProjects(firebaseUser.uid).then((remoteProjects) => {
      if (remoteProjects?.length) setProjects(remoteProjects.map(normalizeProject));
    }).catch((error) => console.warn('Firestore project load failed:', error.message));
  }, [firebaseUser]);

  // Modals & Sidebars
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isFactorRegistryModalOpen, setIsFactorRegistryModalOpen] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleStartTutorial = () => {
    setCurrentBOM(DEMO_BOM_2024);
    setIsTutorialOpen(true);
    showToast('Loaded demonstration dataset for interactive walkthrough.');
  };

  const handleClearAllData = () => {
    setCurrentBOM([]);
    showToast('Cleared inventory. Starting with a clean blank canvas.');
  };

  // Active Project & Multi-Period Calculations
  const rawActiveProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeProject = normalizeProject(rawActiveProject);
  
  const periods = activeProject.periods || [];
  const baseYearPeriod = periods.find(p => p.isBaseYear) || periods[0] || { year: 2023, bom: [] };
  const activePeriod = periods.find(p => p.year === activePeriodYear) || periods[periods.length - 1] || baseYearPeriod;
  const currentBOM = activePeriod ? activePeriod.bom : [];

  // Multi-Period YoY Emission Comparison Metrics
  const currentPeriodTotal = computeBomTotal(currentBOM);
  const baseYearTotal = computeBomTotal(baseYearPeriod.bom);
  const yoyDeltaPct = baseYearTotal > 0 ? (((currentPeriodTotal - baseYearTotal) / baseYearTotal) * 100) : 0;

  const appendChangeLog = (action, summary, targetProjId = activeProjectId) => {
    setProjects(prevProjects => prevProjects.map(proj => {
      if (proj.id === targetProjId) {
        const norm = normalizeProject(proj);
        const existingLogs = norm.changeLog || [];
        const authorName = userProfile.name?.trim() 
          ? `${userProfile.name.trim()} (${userProfile.role || 'Preparer'})`
          : 'Internal Analyst';

        const newEntry = {
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          timestamp: new Date().toISOString(),
          action,
          summary,
          author: authorName
        };
        return {
          ...norm,
          changeLog: [newEntry, ...existingLogs] // Appends newest first
        };
      }
      return proj;
    }));
  };

  const setCurrentBOM = (newBOM) => {
    setProjects(prevProjects => prevProjects.map(proj => {
      if (proj.id === activeProjectId) {
        const norm = normalizeProject(proj);
        const updatedPeriods = norm.periods.map(per => {
          if (per.year === activePeriod.year) {
            return { ...per, bom: newBOM };
          }
          return per;
        });
        return { ...norm, periods: updatedPeriods, bom: newBOM };
      }
      return proj;
    }));
  };

  const handleUpdateBomItem = (itemId, updates) => {
    const updatedBOM = currentBOM.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });
    setCurrentBOM(updatedBOM);
    const targetItem = currentBOM.find(i => i.id === itemId);
    appendChangeLog(
      'DQR_PEDIGREE_UPDATE',
      `Updated DQR score to ${updates.dqrScore || 'custom'} for "${targetItem?.name || targetItem?.item || 'Inventory Item'}" (FY${activePeriod.year})`
    );
    showToast('Data Quality Pedigree score updated.');
  };

  const updateActiveProject = (updates) => {
    setProjects(prevProjects => prevProjects.map(proj => {
      if (proj.id === activeProjectId) {
        return { ...proj, ...updates };
      }
      return proj;
    }));
  };

  const handleUpdateFacilities = (updatedFacilities) => {
    updateActiveProject({ facilities: updatedFacilities });
    appendChangeLog('FACILITY_REGISTRY_UPDATE', `Updated facilities registry (${updatedFacilities.length} total sites).`);
  };

  const handleUpdatePeriods = (updatedPeriods) => {
    updateActiveProject({ periods: updatedPeriods });
    appendChangeLog('REPORTING_PERIODS_UPDATE', `Updated reporting periods configuration (${updatedPeriods.length} total periods).`);
  };

  const handleSwitchPeriod = (year) => {
    const numYear = parseInt(year);
    setActivePeriodYear(numYear);
    localStorage.setItem('netzerocalc_active_period', numYear.toString());
    showToast(`Switched to FY${numYear} reporting period.`);
  };

  const handleAddPeriod = (newYear, setAsBase = false, copyCurrent = true) => {
    const yearNum = parseInt(newYear);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > 2050) {
      showToast("Please provide a valid 4-digit calendar year (e.g. 2025).");
      return;
    }

    if (periods.some(p => p.year === yearNum)) {
      showToast(`Period for FY${yearNum} already exists.`);
      setActivePeriodYear(yearNum);
      return;
    }

    const newPeriod = {
      year: yearNum,
      isBaseYear: setAsBase,
      label: `FY${yearNum}${setAsBase ? ' (Base Year)' : ''}`,
      bom: copyCurrent ? JSON.parse(JSON.stringify(currentBOM)) : []
    };

    const updatedPeriods = [...periods, newPeriod].sort((a, b) => a.year - b.year);
    if (setAsBase) {
      updatedPeriods.forEach(p => {
        if (p.year !== yearNum) p.isBaseYear = false;
      });
    }

    updateActiveProject({ periods: updatedPeriods });
    setActivePeriodYear(yearNum);
    localStorage.setItem('netzerocalc_active_period', yearNum.toString());
    appendChangeLog('PERIOD_CREATED', `Added reporting period FY${yearNum}${setAsBase ? ' (Designated Base Year)' : ''}`);
    showToast(`Added FY${yearNum} reporting period.`);
  };

  const handleSetBaseYear = (yearNum) => {
    const updatedPeriods = periods.map(p => ({
      ...p,
      isBaseYear: p.year === yearNum,
      label: `FY${p.year}${p.year === yearNum ? ' (Base Year)' : ''}`
    }));
    updateActiveProject({ periods: updatedPeriods });
    appendChangeLog('BASE_YEAR_UPDATED', `Designated FY${yearNum} as official corporate GHG baseline year`);
    showToast(`Set FY${yearNum} as official GHG base year.`);
  };

  const handleSaveCalculator = (importedBOM, coverBoundary) => {
    if (!importedBOM || importedBOM.length === 0) {
      showToast("⚠️ No active data rows found in the GHG Master Sheet.");
      return;
    }

    // Format and clean all rows from the Excel calculator
    const formattedBOM = importedBOM.map((item, idx) => {
      const qty = Number(item.qty) || 0;
      const ef = Number(item.ef) || 0;
      const tco2e = item.result_tco2e !== undefined && !isNaN(Number(item.result_tco2e))
        ? Number(item.result_tco2e)
        : (qty * ef) / 1000;

      return {
        id: item.id || `excel_row_${idx + 1}`,
        name: item.name || item.item || `Activity Item ${idx + 1}`,
        item: item.name || item.item || `Activity Item ${idx + 1}`,
        qty: qty,
        unit: item.unit || 'units',
        process: item.process || item.name || 'Industrial Activity Flow',
        ef: ef,
        efUnit: item.efUnit || 'kg CO2e/unit',
        result_tco2e: Number(tco2e.toFixed(4)),
        scope: item.scope || 'Scope 3',
        scope3Category: item.scope3Category || (item.scope === 'Scope 1' ? 'N/A (Scope 1 Direct)' : item.scope === 'Scope 2' ? 'N/A (Scope 2 Location-Based)' : 'Cat 1: Purchased Goods & Services'),
        gwpBasis: 'IPCC AR6',
        risk: 'LOW',
        status: 'Excel Synced',
        approved: true,
        dqrScore: item.dqrScore || 2.0,
        source: 'GHG Master Sheet'
      };
    });

    // Set active period BOM directly to prevent duplicate rows and double calculation
    setCurrentBOM(formattedBOM);
    
    if (coverBoundary) {
      updateActiveProject({ coverBoundary });
    }
    
    appendChangeLog('MASTER_SHEET_SYNC', `Synchronized ${formattedBOM.length} line items from GHG Master Calculator into FY${activePeriod.year}`);
    setActiveTab('workbench');
    showToast(`✅ Synced ${formattedBOM.length} items from GHG Master Sheet to FY${activePeriod.year} BOM.`);
  };

  // LocalStorage Persist (v4 Schema + Legacy v3 fallback)
  useEffect(() => {
    localStorage.setItem('netzerocalc_v4_projects', JSON.stringify(projects));
    localStorage.setItem('netzerocalc_v3_projects', JSON.stringify(projects));
    if (firebaseUser) projects.forEach((project) => saveUserProject(firebaseUser.uid, project).catch((error) => console.warn('Firestore save failed:', error.message)));
  }, [projects, firebaseUser]);

  useEffect(() => {
    localStorage.setItem('netzerocalc_active_proj_id', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('netzerocalc_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  if (authLoading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Loading secure workspace...</div>;
  if (isFirebaseConfigured() && !firebaseUser) return <AuthScreen />;

  // Handlers
  const handleUpdateUserProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem('netzerocalc_user_profile', JSON.stringify(updatedProfile));
    showToast("Operator user profile updated.");
  };

  const handleSwitchProject = (projId) => {
    setActiveProjectId(projId);
    showToast("Switched audit workspace.");
  };

  const handleCreateProject = ({ projectName, companyName, standard }) => {
    const newId = `proj_${Date.now()}`;
    const authorName = userProfile.name?.trim() ? userProfile.name.trim() : 'System';
    const serial = `DECL-GHG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProj = {
      id: newId,
      projectName,
      companyName,
      standard,
      declarationSerial: serial,
      periods: [
        {
          year: 2024,
          isBaseYear: true,
          label: 'FY2024 (Base Year)',
          bom: []
        }
      ],
      changeLog: [
        {
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'WORKSPACE_INITIALIZED',
          summary: `Created workspace for ${projectName} (${companyName}).`,
          author: authorName
        }
      ]
    };
    setProjects([...projects, newProj]);
    setActiveProjectId(newId);
    setActivePeriodYear(2024);
  };

  const handleDeleteProject = (projId) => {
    if (projects.length <= 1) return;
    const filtered = projects.filter(p => p.id !== projId);
    setProjects(filtered);
    if (firebaseUser) deleteUserProject(firebaseUser.uid, projId).catch((error) => console.warn('Firestore delete failed:', error.message));
    if (activeProjectId === projId) {
      setActiveProjectId(filtered[0].id);
    }
    showToast("Deleted project workspace.");
  };

  const handleImportItems = (newItems) => {
    const items = Array.isArray(newItems) ? newItems : [newItems];
    setCurrentBOM([...items, ...currentBOM]);
    appendChangeLog('INVENTORY_UPDATE', `Added ${items.length} line item(s) to FY${activePeriod.year} BOM`);
  };

  const handleApplyScenario = (scenarioData) => {
    setAppliedScenario(scenarioData);
    appendChangeLog('SCENARIO_APPLIED', `Applied decarbonization scenario: ${scenarioData.name || 'Custom Reduction'}`);
    showToast("Scenario applied! Baseline vs Project scenario synchronized for ISO 14064-2 report.");
    setActiveTab('compliance');
  };

  const handleLaunchDemo = () => {
    setShowLanding(false);
    localStorage.setItem('netzerocalc_has_visited', 'true');
  };

  if (showLanding) {
    return <LandingPage onLaunchDemo={handleLaunchDemo} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans antialiased pb-16 selection:bg-emerald-500 selection:text-white relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(255,255,255,0))] pointer-events-none z-0"></div>
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header 
        userProfile={userProfile}
        onUpdateUserProfile={handleUpdateUserProfile}
        activeProject={activeProject}
        projects={projects}
        onSwitchProject={handleSwitchProject}
        accountingStandard={accountingStandard}
        setAccountingStandard={setAccountingStandard}
        geography={geography}
        setGeography={setGeography}
        onGoHome={() => setShowLanding(true)}
        onUpdateProject={updateActiveProject}
        onStartTutorial={handleStartTutorial}
        onSignOut={() => signOut(auth)}
      />

      {/* Navigation Bar */}
      <NavigationTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenFacilityModal={() => setIsFacilityModalOpen(true)}
        onOpenPeriodModal={() => setIsPeriodModalOpen(true)}
        onOpenFactorRegistryModal={() => setIsFactorRegistryModalOpen(true)}
      />

      {/* UI Fix B: Fixed Sticky Workspace & Period Context Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 shadow-xs px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Project & Entity Badge */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="truncate max-w-[200px] sm:max-w-xs">{activeProject.projectName}</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-medium">
              {activeProject.organization?.name || activeProject.companyName}
            </span>
          </div>

          {/* Period Selector & Quick Period Cloning */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Period:</span>
              <select
                value={activePeriodYear}
                onChange={(e) => handleSwitchPeriod(e.target.value)}
                className="font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer text-xs"
              >
                {periods.map(p => (
                  <option key={p.year} value={p.year}>
                    FY{p.year} {p.isBaseYear ? '(Base Year)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporting Periods Registry Button */}
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Manage all reporting periods, dates, and locking status"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Periods</span>
            </button>

            {/* Facilities Registry Button */}
            <button
              onClick={() => setIsFacilityModalOpen(true)}
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Manage operational facilities and active boundary dates"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sites ({getActiveFacilitiesForPeriod(activeProject.facilities || [], activePeriod).length} Active)</span>
            </button>

            {/* Emission Factor Registry Button (Phase 2) */}
            <button
              onClick={() => setIsFactorRegistryModalOpen(true)}
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Open central Emission Factor Registry, immutable versions, and overrides"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>EF Registry</span>
            </button>

            {/* Quick Add Year Button */}
            <button
              onClick={() => {
                const nextYear = Math.max(...periods.map(p => p.year), 2024) + 1;
                handleAddPeriod(nextYear, false, true);
              }}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Clone inventory to a new reporting period"
            >
              <span>+ FY{Math.max(...periods.map(p => p.year), 2024) + 1}</span>
            </button>

            {/* Target Tracking vs Base Year Delta Pill */}
            {!activePeriod.isBaseYear && baseYearTotal > 0 && (
              <span className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold border ${
                yoyDeltaPct <= 0 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {yoyDeltaPct <= 0 ? '↓' : '↑'} {Math.abs(yoyDeltaPct).toFixed(1)}% vs. Base Year ({baseYearPeriod.year})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'workbench' && (
          <WorkbenchView 
            currentBOM={currentBOM}
            setCurrentBOM={setCurrentBOM}
            activePeriod={activePeriod}
            periods={periods}
            baseYearPeriod={baseYearPeriod}
            onSwitchPeriod={handleSwitchPeriod}
            onAddPeriod={handleAddPeriod}
            onSetBaseYear={handleSetBaseYear}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
            onNavigateToCompliance={() => setActiveTab('compliance')}
            showToast={showToast}
          />
        )}

        {activeTab === 'dqr' && (
          <DqrDashboard 
            project={activeProject}
            activePeriodYear={activePeriodYear}
            onUpdateBomItem={handleUpdateBomItem}
            showToast={showToast}
          />
        )}

        {activeTab === 'lci-search' && (
          <LciSearchTab 
            onAddFactorToBOM={handleImportItems}
            showToast={showToast}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorView 
            currentBOM={currentBOM}
            showToast={showToast}
            onApplyScenario={handleApplyScenario}
          />
        )}

        {activeTab === 'cbam' && (
          <CbamView 
            currentBOM={currentBOM}
            activeProject={activeProject}
            userProfile={userProfile}
            showToast={showToast}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView 
            projects={projects}
            activeProjectId={activeProjectId}
            onSwitchProject={handleSwitchProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onAddPeriod={handleAddPeriod}
            showToast={showToast}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceView 
            currentBOM={currentBOM}
            userProfile={userProfile}
            activeProject={activeProject}
            activePeriod={activePeriod}
            periods={periods}
            baseYearPeriod={baseYearPeriod}
            accountingStandard={accountingStandard}
            appliedScenario={appliedScenario}
            showToast={showToast}
          />
        )}

        {activeTab === 'ghg-calculator' && (
          <ErrorBoundary>
            <Suspense fallback={
              <div className="h-[600px] flex items-center justify-center bg-slate-900 rounded-2xl text-slate-400 font-bold text-xs border border-slate-800">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>Loading GHG Master Calculator...</span>
              </div>
            }>
              <GhgCalculatorView 
                onSave={handleSaveCalculator}
                onCancel={() => setActiveTab('workbench')}
              />
            </Suspense>
          </ErrorBoundary>
        )}

        {activeTab === 'regulations' && (
          <ErrorBoundary>
            <RegulationsTrackerView />
          </ErrorBoundary>
        )}
      </main>

      {/* Modals */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportItems={handleImportItems}
        showToast={showToast}
        onOpenAiCopilot={() => setIsAiPanelOpen(true)}
        currentProjectId={activeProject?.id || 'proj_default'}
      />

      <GoogleSheetsModal 
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        currentBOM={currentBOM}
        activeProject={activeProject}
        showToast={showToast}
      />

      <TutorialGuideDock 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onLoadDemoData={() => setCurrentBOM(DEMO_BOM_2024)}
        onClearData={handleClearAllData}
        onOpenAiCopilot={() => setIsAiPanelOpen(true)}
      />

      {/* AI Copilot Sidebar & FAB */}
      <AiChatSidebar 
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        activeProject={activeProject}
        screenContext={{
          activeTab,
          activeProjectId: activeProject.id,
          projectName: activeProject.projectName,
          companyName: activeProject.companyName,
          activePeriodYear,
          totalFootprintTco2e: Number(currentPeriodTotal.toFixed(3)),
          scopeBreakdownTco2e: {
            scope1: Number(currentBOM.filter(i => i.scope === 'Scope 1').reduce((acc, i) => acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000), 0).toFixed(3)),
            scope2: Number(currentBOM.filter(i => i.scope === 'Scope 2').reduce((acc, i) => acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000), 0).toFixed(3)),
            scope3: Number(currentBOM.filter(i => i.scope === 'Scope 3').reduce((acc, i) => acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000), 0).toFixed(3)),
          },
          baseYearTotalTco2e: Number(baseYearTotal.toFixed(3)),
          yoyDeltaPct: Number(yoyDeltaPct.toFixed(1)),
          displayedBomItems: currentBOM.map(i => ({
            name: i.name,
            qty: i.qty,
            unit: i.unit,
            process: i.process,
            emissionFactor: i.ef,
            scope: i.scope,
            calculatedTco2e: Number((((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000).toFixed(3))
          }))
        }}
      />
      
      {!isAiPanelOpen && (
        <button
          onClick={() => setIsAiPanelOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/20 transition-all hover:scale-105 flex items-center justify-center group"
          title="Open AI Copilot"
        >
          <Bot size={24} className="group-hover:animate-pulse" />
        </button>
      )}

      {/* Corporate GHG Inventory Phase 1 Modals */}
      <FacilityManagementModal 
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        facilities={activeProject.facilities || []}
        onUpdateFacilities={handleUpdateFacilities}
        activePeriod={activePeriod}
        organizationId={activeProject.organization?.id || 'org_default'}
        showToast={showToast}
      />

      <PeriodManagementModal 
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        periods={periods}
        onUpdatePeriods={handleUpdatePeriods}
        activePeriod={activePeriod}
        onSwitchPeriod={handleSwitchPeriod}
        facilities={activeProject.facilities || []}
        currentBOM={currentBOM}
        organizationId={activeProject.organization?.id || 'org_default'}
        showToast={showToast}
      />

      <FactorRegistryModal
        isOpen={isFactorRegistryModalOpen}
        onClose={() => setIsFactorRegistryModalOpen(false)}
        customFactors={activeProject.customFactors || []}
        onUpdateCustomFactors={(nextCustoms) => {
          updateActiveProject({ customFactors: nextCustoms });
          appendChangeLog('FACTOR_REGISTRY_UPDATE', `Updated custom emission factors library (${nextCustoms.length} factors).`);
        }}
        overrides={activeProject.factorOverrides || []}
        onUpdateOverrides={(nextOverrides) => {
          updateActiveProject({ factorOverrides: nextOverrides });
          appendChangeLog('FACTOR_OVERRIDE_UPDATE', `Updated factor overrides (${nextOverrides.length} active overrides).`);
        }}
        organization={activeProject.organization}
        facilities={activeProject.facilities || []}
      />

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-xs font-medium text-slate-400">
        &copy; {new Date().getFullYear()} Arunachalam Venkatachalapathy. All rights reserved.
      </footer>

    </div>
  );
}
