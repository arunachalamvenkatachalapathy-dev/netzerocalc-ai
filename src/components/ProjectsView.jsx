import React, { useState } from 'react';
import { 
  FolderPlus, CheckCircle, Trash2, Layers, Building, Calendar, 
  History, Clock, ShieldCheck, FileText, ArrowRight, User
} from 'lucide-react';

export default function ProjectsView({ 
  projects, 
  activeProjectId, 
  onSwitchProject, 
  onCreateProject, 
  onDeleteProject,
  showToast 
}) {
  const [newProjectName, setNewProjectName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStandard, setNewStandard] = useState('ISO 14064-1 & Scope 1-3');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const changeLogs = (activeProject && Array.isArray(activeProject.changeLog)) ? activeProject.changeLog : [];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject({
      projectName: newProjectName.trim(),
      companyName: newCompany.trim() || 'Corporate Entity',
      standard: newStandard
    });
    setNewProjectName('');
    setNewCompany('');
    setShowCreateModal(false);
    showToast("Created new audit project workspace.");
  };

  const getActionBadgeStyle = (action) => {
    switch (action) {
      case 'MASTER_SHEET_SYNC':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PERIOD_CREATED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'BASE_YEAR_SET':
      case 'BASE_YEAR_UPDATED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SCENARIO_APPLIED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'INVENTORY_SYNC':
      case 'INVENTORY_UPDATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Multi-Entity Corporate Registry</span>
          </div>
          <h2 className="text-xl font-black text-white">Project Workspaces & Audit Registry</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-entity corporate carbon audit projects, Scope 1-3 accounting boundaries, and ISO 14064 verification tracks.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Audit Workspace</span>
        </button>
      </div>

      {/* Projects Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const periodsList = proj.periods || [{ year: 2024, isBaseYear: true, bom: proj.bom || [] }];
          const basePeriod = periodsList.find(p => p.isBaseYear) || periodsList[0];
          const latestPeriod = periodsList[periodsList.length - 1];
          const latestBom = latestPeriod.bom || [];
          const bomCount = latestBom.length;
          const totalFt = latestBom.reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);

          return (
            <div 
              key={proj.id} 
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all flex flex-col justify-between ${
                isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{proj.projectName}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{proj.companyName}</span>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Reporting Periods:</span>
                    <span className="font-bold text-slate-900 font-mono">{periodsList.length} Years (Base: FY{basePeriod.year})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accounting Standard:</span>
                    <span className="font-bold text-slate-900">{proj.standard || 'ISO 14064-1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Inventory:</span>
                    <span className="font-bold text-slate-900">{bomCount} items (FY{latestPeriod.year})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latest Footprint:</span>
                    <span className="font-extrabold text-emerald-700 font-mono">{totalFt.toFixed(3)} tCO₂e</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button 
                  onClick={() => onSwitchProject(proj.id)}
                  disabled={isActive}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isActive ? 'Current Workspace' : 'Switch Workspace'}
                </button>

                {projects.length > 1 && (
                  <button 
                    onClick={() => onDeleteProject(proj.id)}
                    className="p-2 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Item 6: Evidentiary Audit Trail & Revision History Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Evidentiary Change Log & Audit Trail (ISO 14064-3 / CSRD Compliance)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit record for active workspace <strong className="text-slate-800">{activeProject?.projectName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{changeLogs.length} Audit Entries</span>
            </span>
          </div>
        </div>

        {changeLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No audit log entries recorded yet for this workspace.
          </div>
        ) : (
          <div className="space-y-3">
            {changeLogs.map((log, index) => {
              const formattedDate = new Date(log.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={log.id || index}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase tracking-wider border ${getActionBadgeStyle(log.action)}`}>
                      {log.action?.replace(/_/g, ' ') || 'ACTION'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{log.summary}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" /> {log.author || 'System User'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-slate-900">Create New Audit Workspace</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. FY2024-25 Corporate ESG Audit" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Entity Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Manufacturing Ltd." 
                  value={newCompany} 
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Accounting Standard</label>
                <select 
                  value={newStandard} 
                  onChange={(e) => setNewStandard(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 font-semibold bg-white"
                >
                  <option value="ISO 14064-1 & Scope 1-3">ISO 14064-1 & Scope 1-3</option>
                  <option value="ISO 14064-2 Decarbonization">ISO 14064-2 Decarbonization</option>
                  <option value="EU CBAM & DPP Disclosure">EU CBAM & DPP Disclosure</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
