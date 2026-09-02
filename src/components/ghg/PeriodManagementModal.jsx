import React, { useState } from 'react';
import { 
  X, Calendar, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, 
  Lock, Unlock, Award, Clock, ArrowRight, Building2, Copy
} from 'lucide-react';
import { 
  createReportingPeriod, 
  updateReportingPeriod, 
  deleteReportingPeriod, 
  setBaseYearPeriod, 
  lockReportingPeriod, 
  unlockReportingPeriod,
  validatePeriod 
} from '../../services/ghg/periodService.js';
import { getActiveFacilitiesForPeriod } from '../../services/ghg/facilityService.js';

export default function PeriodManagementModal({ 
  isOpen, 
  onClose, 
  periods = [], 
  onUpdatePeriods, 
  activePeriod, 
  onSwitchPeriod,
  facilities = [],
  currentBOM = [],
  organizationId = 'org_default',
  showToast 
}) {
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const [formData, setFormData] = useState({
    label: '',
    reportingYear: '2025',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isBaseYear: false,
    copyBom: true
  });

  if (!isOpen) return null;

  const resetForm = () => {
    const nextYear = Math.max(...periods.map(p => p.reportingYear || p.year || 2024), 2024) + 1;
    setFormData({
      label: `FY${nextYear}`,
      reportingYear: String(nextYear),
      startDate: `${nextYear}-01-01`,
      endDate: `${nextYear}-12-31`,
      isBaseYear: false,
      copyBom: true
    });
    setEditingId(null);
    setFormErrors([]);
    setIsFormOpen(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (period) => {
    if (period.status === 'locked') {
      showToast('Unlock this period first before editing its dates.');
      return;
    }
    setFormData({
      label: period.label || '',
      reportingYear: String(period.reportingYear || period.year || 2024),
      startDate: period.startDate || '',
      endDate: period.endDate || '',
      isBaseYear: Boolean(period.isBaseYear),
      copyBom: false
    });
    setEditingId(period.id);
    setFormErrors([]);
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errors = validatePeriod(formData, periods, editingId);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingId) {
        const updated = updateReportingPeriod(editingId, {
          label: formData.label,
          reportingYear: formData.reportingYear,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isBaseYear: formData.isBaseYear
        }, periods);
        onUpdatePeriods(updated);
        showToast('Reporting period updated.');
      } else {
        const updated = createReportingPeriod(
          organizationId, 
          formData, 
          periods, 
          formData.copyBom ? currentBOM : []
        );
        onUpdatePeriods(updated);
        showToast(`Created reporting period ${formData.label}.`);
      }
      resetForm();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = (periodId, periodLabel) => {
    if (periods.length <= 1) {
      showToast('Cannot delete the only reporting period.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete reporting period "${periodLabel}"?`)) {
      try {
        const updated = deleteReportingPeriod(periodId, periods);
        onUpdatePeriods(updated);
        if (activePeriod?.id === periodId && updated.length > 0) {
          onSwitchPeriod(updated[0].year || updated[0].reportingYear);
        }
        showToast('Reporting period deleted.');
      } catch (err) {
        showToast(err.message);
      }
    }
  };

  const handleSetBaseYear = (periodId, periodLabel) => {
    const updated = setBaseYearPeriod(periodId, periods);
    onUpdatePeriods(updated);
    showToast(`Designated ${periodLabel} as corporate GHG Base Year.`);
  };

  const handleToggleLock = (period) => {
    let updated;
    if (period.status === 'locked') {
      updated = unlockReportingPeriod(period.id, periods);
      showToast(`Unlocked period ${period.label} for editing.`);
    } else {
      updated = lockReportingPeriod(period.id, periods);
      showToast(`Locked period ${period.label} (calculations protected).`);
    }
    onUpdatePeriods(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Reporting Periods Registry</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {periods.length} {periods.length === 1 ? 'Period' : 'Periods'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage multi-year accounting boundaries, fiscal vs calendar timelines, base year status, and calculation locks.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Add / Edit Form */}
          {isFormOpen ? (
            <form onSubmit={handleSave} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {editingId ? 'Edit Reporting Period' : 'Create New Reporting Period'}
                </h3>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Period Label *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g. FY 2024-25"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reporting Year *</label>
                  <input
                    type="number"
                    value={formData.reportingYear}
                    onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                    placeholder="2025"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isBaseYear}
                    onChange={(e) => setFormData({ ...formData, isBaseYear: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-slate-700">Designate as Official Corporate Base Year</span>
                </label>

                {!editingId && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.copyBom}
                      onChange={(e) => setFormData({ ...formData, copyBom: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700">Clone current period's PCF BOM items</span>
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingId ? 'Update Period' : 'Create Period'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-600">
                Reporting Periods ({periods.length})
              </span>
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Period</span>
              </button>
            </div>
          )}

          {/* Periods Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-center">Active Sites</th>
                  <th className="py-3 px-4 text-center">Base Year</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periods.map((p) => {
                  const isCurrent = (activePeriod?.year || activePeriod?.reportingYear) === (p.year || p.reportingYear);
                  const activeFacilitiesCount = getActiveFacilitiesForPeriod(facilities, p).length;
                  const isLocked = p.status === 'locked';

                  return (
                    <tr 
                      key={p.id || p.year} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{p.label || `FY${p.year}`}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          PCF BOM: {p.bom?.length || 0} items
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {p.startDate ? (
                          <div>
                            <div>{p.startDate} to {p.endDate}</div>
                            <div className="text-slate-400 text-[10px]">Reporting Year: {p.reportingYear || p.year}</div>
                          </div>
                        ) : (
                          <div>Calendar Year {p.year}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{activeFacilitiesCount} / {facilities.length}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.isBaseYear ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Base Year</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetBaseYear(p.id, p.label)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-amber-700 hover:underline cursor-pointer"
                          >
                            Set as Base
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleLock(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            isLocked 
                              ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={isLocked ? 'Click to unlock period for changes' : 'Click to lock period against accidental edits'}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span className="capitalize">{p.status || 'draft'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrent && (
                            <button
                              onClick={() => onSwitchPeriod(p.year || p.reportingYear)}
                              className="px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Switch to
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(p)}
                            disabled={isLocked}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLocked 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isLocked ? 'Cannot edit locked period' : 'Edit period dates'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.label)}
                            disabled={periods.length <= 1}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              periods.length <= 1 
                                ? 'text-slate-200 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                            title={periods.length <= 1 ? 'Cannot delete only period' : 'Delete period'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>Active Reporting Period: <strong>{activePeriod?.label || `FY${activePeriod?.year}`}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
