import React, { useState } from 'react';
import { 
  X, Building2, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, 
  MapPin, Zap, Calendar, ShieldCheck, Clock
} from 'lucide-react';
import { GRID_REGIONS } from '../../services/ghg/types.js';
import { 
  createFacility, 
  updateFacility, 
  deleteFacility, 
  validateFacility,
  isFacilityActiveInPeriod 
} from '../../services/ghg/facilityService.js';

export default function FacilityManagementModal({ 
  isOpen, 
  onClose, 
  facilities = [], 
  onUpdateFacilities, 
  activePeriod, 
  organizationId = 'org_default',
  showToast 
}) {
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: 'IN',
    region: '',
    gridRegion: 'IN_CEA_NATIONAL',
    activeFrom: '2024-01-01',
    activeTo: '',
    notes: '',
    floorAreaM2: '',
    employeeCount: ''
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      country: 'IN',
      region: '',
      gridRegion: 'IN_CEA_NATIONAL',
      activeFrom: activePeriod?.startDate || '2024-01-01',
      activeTo: '',
      notes: '',
      floorAreaM2: '',
      employeeCount: ''
    });
    setEditingId(null);
    setFormErrors([]);
    setIsFormOpen(false);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleStartEdit = (facility) => {
    setFormData({
      name: facility.name || '',
      code: facility.code || '',
      country: facility.country || 'IN',
      region: facility.region || '',
      gridRegion: facility.gridRegion || 'IN_CEA_NATIONAL',
      activeFrom: facility.activeFrom || '2024-01-01',
      activeTo: facility.activeTo || '',
      notes: facility.metadata?.notes || '',
      floorAreaM2: facility.metadata?.floorAreaM2 || '',
      employeeCount: facility.metadata?.employeeCount || ''
    });
    setEditingId(facility.id);
    setFormErrors([]);
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errors = validateFacility(formData, facilities, editingId);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingId) {
        const updated = updateFacility(editingId, {
          name: formData.name,
          code: formData.code,
          country: formData.country,
          region: formData.region,
          gridRegion: formData.gridRegion,
          activeFrom: formData.activeFrom,
          activeTo: formData.activeTo,
          metadata: {
            notes: formData.notes,
            floorAreaM2: formData.floorAreaM2 ? Number(formData.floorAreaM2) : null,
            employeeCount: formData.employeeCount ? Number(formData.employeeCount) : null
          }
        }, facilities);
        onUpdateFacilities(updated);
        showToast('Facility updated successfully.');
      } else {
        const newFac = createFacility(organizationId, formData, facilities);
        onUpdateFacilities([...facilities, newFac]);
        showToast('New facility registered successfully.');
      }
      resetForm();
    } catch (err) {
      setFormErrors([err.message]);
    }
  };

  const handleDelete = (facilityId, facilityName) => {
    if (window.confirm(`Are you sure you want to remove "${facilityName}" from the registry?`)) {
      const updated = deleteFacility(facilityId, facilities);
      onUpdateFacilities(updated);
      showToast('Facility removed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Facility Registry</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {facilities.length} {facilities.length === 1 ? 'Site' : 'Sites'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage manufacturing plants, offices, and operational sites. Active-date overlap filters data per reporting period.
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

        {/* Active Period Context Pill */}
        {activePeriod && (
          <div className="px-6 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Active Period Scope: <strong>{activePeriod.label}</strong> ({activePeriod.startDate} to {activePeriod.endDate})</span>
            </div>
            <span className="font-bold">
              {facilities.filter(f => isFacilityActiveInPeriod(f, activePeriod)).length} of {facilities.length} Active
            </span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Add / Edit Form Drawer */}
          {isFormOpen ? (
            <form onSubmit={handleSave} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>{editingId ? 'Edit Facility' : 'Register New Facility'}</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Chennai Plant A"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. FAC-001"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Code *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                    placeholder="e.g. IN, US, DE"
                    maxLength={5}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Region / State</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grid Region (Scope 2 LB) *</label>
                  <select
                    value={formData.gridRegion}
                    onChange={(e) => setFormData({ ...formData, gridRegion: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-medium cursor-pointer"
                    required
                  >
                    {GRID_REGIONS.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.factor} {g.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational From *</label>
                  <input
                    type="date"
                    value={formData.activeFrom}
                    onChange={(e) => setFormData({ ...formData, activeFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational To (Optional)</label>
                  <input
                    type="date"
                    value={formData.activeTo}
                    onChange={(e) => setFormData({ ...formData, activeTo: e.target.value })}
                    placeholder="Ongoing if blank"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank if continuously active.</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor Area (m²)</label>
                  <input
                    type="number"
                    value={formData.floorAreaM2}
                    onChange={(e) => setFormData({ ...formData, floorAreaM2: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Count</label>
                  <input
                    type="number"
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">Operational Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details or boundary considerations..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xs"
                />
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
                  {editingId ? 'Save Changes' : 'Register Facility'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-600">
                Registered Facilities ({facilities.length})
              </span>
              <button
                onClick={handleStartAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Facility</span>
              </button>
            </div>
          )}

          {/* Facilities List Table */}
          {facilities.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="font-bold">No facilities registered yet.</p>
              <p className="text-slate-400 mt-1">Click "Add Facility" to configure your first operational site.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Facility</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Grid Region</th>
                    <th className="py-3 px-4">Active Window</th>
                    <th className="py-3 px-4 text-center">Status ({activePeriod?.label || 'Current'})</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilities.map((fac) => {
                    const isActive = isFacilityActiveInPeriod(fac, activePeriod);
                    const gridObj = GRID_REGIONS.find(g => g.id === fac.gridRegion);

                    return (
                      <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{fac.name}</span>
                            {fac.code && (
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-mono text-[10px] rounded">
                                {fac.code}
                              </span>
                            )}
                          </div>
                          {fac.metadata?.notes && (
                            <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {fac.metadata.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{fac.region ? fac.region + ', ' : ''}{fac.country}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          <div className="flex items-center gap-1" title={gridObj?.name || fac.gridRegion}>
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="truncate max-w-[150px]">{gridObj ? gridObj.name.split(' - ')[1] || gridObj.name : fac.gridRegion}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          <div>From: {fac.activeFrom}</div>
                          <div className="text-slate-400">To: {fac.activeTo || 'Ongoing'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(fac)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Facility"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(fac.id, fac.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove Facility"
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
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>Facilities are bound to organization: <strong>{organizationId}</strong></span>
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
