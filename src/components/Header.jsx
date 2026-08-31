import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, User, UserCheck, ChevronDown, Database, Activity, 
  Edit3, Check, X, Server, Cloud, UserCog, Settings, Sparkles
} from 'lucide-react';
import { checkBackendHealth } from '../services/api.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export default function Header({ 
  userProfile = { name: '', role: 'Internal Analyst', organization: 'ACME Corp' },
  onUpdateUserProfile,
  activeProject, 
  accountingStandard, 
  setAccountingStandard,
  geography,
  setGeography,
  onGoHome,
  onUpdateProject,
  onStartTutorial,
  onSignOut
}) {
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [companyName, setCompanyName] = useState(activeProject?.companyName || 'ACME Corp');
  const [projectName, setProjectName] = useState(activeProject?.projectName || 'Scope 1-3 Carbon Inventory');
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false });

  // User Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userNameInput, setUserNameInput] = useState(userProfile.name || '');
  const [userRoleInput, setUserRoleInput] = useState(userProfile.role || 'Internal Analyst');
  const [userOrgInput, setUserOrgInput] = useState(userProfile.organization || 'ACME Corp');

  useEffect(() => {
    checkBackendHealth().then(status => setBackendStatus({ checked: true, online: status.online }));
  }, []);

  useEffect(() => {
    if (activeProject) {
      setCompanyName(activeProject.companyName || 'ACME Corp');
      setProjectName(activeProject.projectName || 'Scope 1-3 Carbon Inventory');
    }
  }, [activeProject]);

  useEffect(() => {
    setUserNameInput(userProfile.name || '');
    setUserRoleInput(userProfile.role || 'Internal Analyst');
    setUserOrgInput(userProfile.organization || 'ACME Corp');
  }, [userProfile]);

  const handleSaveProjectEdit = () => {
    if (onUpdateProject) {
      onUpdateProject({
        companyName: companyName.trim() || 'ACME Corp',
        projectName: projectName.trim() || 'Scope 1-3 Carbon Inventory'
      });
    }
    setIsEditingProject(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateUserProfile) {
      onUpdateUserProfile({
        name: userNameInput.trim(),
        role: userRoleInput.trim() || 'Internal Analyst',
        organization: userOrgInput.trim() || 'Corporate Entity'
      });
    }
    setShowProfileModal(false);
  };

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 pb-1">
      <div className="max-w-7xl mx-auto rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-3 flex flex-wrap justify-between items-center gap-4 relative">
        
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2.5 hover:opacity-90 transition-all cursor-pointer group"
            title="Return to Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-emerald-600/20">
              <Activity className="text-white w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="font-black text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">NetZeroCalc</h1>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-inner">
                BOM-to-LCI v0.1.0-alpha
              </span>
            </div>
            
            {isEditingProject ? (
              <div className="flex items-center gap-1.5 mt-1 bg-white p-1 rounded-xl border border-emerald-500/60 shadow-lg">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                  className="bg-slate-50 text-xs font-bold text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 outline-none w-44 focus:border-emerald-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveProjectEdit()}
                />
                <button
                  onClick={handleSaveProjectEdit}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all duration-300 active:scale-[0.92] shadow-[0_0_10px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_15px_rgba(5,150,105,0.4)] cursor-pointer"
                  title="Save Company Name"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <button
                  onClick={() => setIsEditingProject(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 active:scale-95 cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingProject(true)}
                className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 cursor-pointer hover:text-slate-800 transition-colors group/edit"
                title="Click to edit Company Name"
              >
                <span className="font-bold text-slate-700">{companyName}</span>
                <span>•</span>
                <span className="truncate max-w-[200px]">{projectName}</span>
                <Edit3 className="w-3 h-3 opacity-0 group-hover/edit:opacity-100 transition-opacity text-emerald-600" />
              </div>
            )}
          </div>
        </div>

        {/* Global Metadata & Operator Profile */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onSignOut && <button onClick={onSignOut} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100" title="Sign out">Sign out</button>}
          
          {/* Cloud Sync Status */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-xs ${
            isSupabaseConfigured() 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <Cloud className={`w-3.5 h-3.5 ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{isSupabaseConfigured() ? 'Supabase: Connected' : 'Local Storage Engine'}</span>
          </div>

          {/* Database Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>India GHG Factors v6</span>
          </div>

          {/* Standard Select */}
          <select 
            value={accountingStandard} 
            onChange={(e) => setAccountingStandard(e.target.value)}
            className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="ISO 14064-1 & Scope 1-3">ISO 14064-1 & GHG Protocol</option>
            <option value="ISO 14064-2 Project Scenario">ISO 14064-2 Decarbonization</option>
            <option value="EU CBAM & DPP Disclosure">EU CBAM & DPP Disclosure</option>
          </select>

          {/* Geography Select */}
          <select 
            value={geography} 
            onChange={(e) => setGeography(e.target.value)}
            className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="IN">IN — India (CEA Grid)</option>
            <option value="GLO">GLO — Global</option>
            <option value="EU">EU — European Union</option>
            <option value="US">US — United States</option>
          </select>
          {/* Interactive Tutorial Button */}
          {onStartTutorial && (
            <button
              onClick={onStartTutorial}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 hover:scale-105"
              title="Launch interactive feature guide and demo dataset"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white/30" />
              <span>Tutorial & Demo Guide</span>
            </button>
          )}
        </div>

      </div>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Settings & Profile</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide your real name and role to accurately attribute audit trail changes and calculation entries in the ISO 14064-3 evidentiary log.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Full Name" 
                  value={userNameInput} 
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sustainability Lead / ESG Analyst" 
                  value={userRoleInput} 
                  onChange={(e) => setUserRoleInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Organization / Entity</label>
                <input 
                  type="text" 
                  placeholder="e.g. ACME Manufacturing Ltd." 
                  value={userOrgInput} 
                  onChange={(e) => setUserOrgInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
