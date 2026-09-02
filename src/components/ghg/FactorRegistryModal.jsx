import React, { useState, useMemo } from 'react';
import { 
  Database, Search, Filter, ShieldCheck, Plus, CheckCircle2, 
  AlertCircle, ChevronRight, X, ExternalLink, RefreshCw, Bookmark,
  Layers, Globe, Calendar, FileText, Info
} from 'lucide-react';
import { 
  getAllEmissionFactors, 
  validateEmissionFactor, 
  createCustomEmissionFactor,
  createFactorVersion,
  createFactorOverride
} from '../../services/ghg/factorRegistry.js';
import { normalizeUnit, UNIT_DIMENSIONS } from '../../services/ghg/unitService.js';

export default function FactorRegistryModal({ 
  isOpen, 
  onClose, 
  customFactors = [], 
  onUpdateCustomFactors,
  overrides = [],
  onUpdateOverrides,
  organization,
  facilities = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScope, setSelectedScope] = useState('ALL');
  const [selectedGeo, setSelectedGeo] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [inspectedFactor, setInspectedFactor] = useState(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [overrideTargetFactor, setOverrideTargetFactor] = useState(null);
  const [versionTargetFactor, setVersionTargetFactor] = useState(null);
  const [formError, setFormError] = useState('');

  // Form states for Custom Factor
  const [customForm, setCustomForm] = useState({
    name: '',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activityType: 'Fuel Combustion',
    factorValue: '',
    denominatorUnit: 'kg',
    geography: 'IN',
    country: 'India',
    source: '',
    sourceOrganization: '',
    sourceReference: '',
    gwpBasis: 'IPCC AR6',
    tier: 'Tier 3',
    uncertainty: '±5%'
  });

  // Form states for Override
  const [overrideForm, setOverrideForm] = useState({
    facilityId: '',
    replacementFactorValue: '',
    replacementUnit: 'kWh',
    reason: '',
    source: '',
    sourceReference: ''
  });

  // Form states for Versioning
  const [versionForm, setVersionForm] = useState({
    factorValue: '',
    sourceVersion: '',
    sourceReference: '',
    reason: '',
    publicationYear: new Date().getFullYear()
  });

  const allFactors = useMemo(() => {
    return getAllEmissionFactors(customFactors);
  }, [customFactors]);

  const filteredFactors = useMemo(() => {
    return allFactors.filter(f => {
      if (selectedScope !== 'ALL' && f.scope !== selectedScope) return false;
      if (selectedGeo !== 'ALL' && f.geography !== selectedGeo) return false;
      if (selectedType === 'CUSTOM' && !f.isCustom) return false;
      if (selectedType === 'DEFAULT' && f.isCustom) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = f.name?.toLowerCase().includes(q);
        const matchId = f.id?.toLowerCase().includes(q);
        const matchSource = f.source?.toLowerCase().includes(q);
        const matchAct = f.activityType?.toLowerCase().includes(q);
        const matchCat = f.category?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchSource && !matchAct && !matchCat) return false;
      }

      return true;
    });
  }, [allFactors, selectedScope, selectedGeo, selectedType, searchTerm]);

  // Handler: Add Custom Factor
  const handleSaveCustomFactor = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const nextCustoms = createCustomEmissionFactor({
        ...customForm,
        factorValue: Number(customForm.factorValue)
      }, customFactors);

      if (onUpdateCustomFactors) {
        onUpdateCustomFactors(nextCustoms);
      }
      setIsCreatingCustom(false);
      setCustomForm({
        name: '',
        scope: 'Scope 1',
        category: 'Stationary Combustion',
        activityType: 'Fuel Combustion',
        factorValue: '',
        denominatorUnit: 'kg',
        geography: 'IN',
        country: 'India',
        source: '',
        sourceOrganization: '',
        sourceReference: '',
        gwpBasis: 'IPCC AR6',
        tier: 'Tier 3',
        uncertainty: '±5%'
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Handler: Save Override
  const handleSaveOverride = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const newOverride = createFactorOverride({
        organizationId: organization?.id || 'org_default',
        facilityId: overrideForm.facilityId || null,
        originalFactorId: overrideTargetFactor.id,
        replacementFactorValue: overrideForm.replacementFactorValue,
        replacementUnit: overrideForm.replacementUnit,
        reason: overrideForm.reason,
        source: overrideForm.source,
        sourceReference: overrideForm.sourceReference,
        createdBy: 'Analyst'
      });

      const nextOverrides = [...overrides, newOverride];
      if (onUpdateOverrides) {
        onUpdateOverrides(nextOverrides);
      }
      setOverrideTargetFactor(null);
      setOverrideForm({
        facilityId: '',
        replacementFactorValue: '',
        replacementUnit: 'kWh',
        reason: '',
        source: '',
        sourceReference: ''
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Handler: Save New Version
  const handleSaveVersion = (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const { newFactor, updatedOriginal, customFactors: nextCustoms } = createFactorVersion(
        versionTargetFactor.id,
        {
          factorValue: Number(versionForm.factorValue),
          sourceVersion: versionForm.sourceVersion,
          sourceReference: versionForm.sourceReference,
          publicationYear: Number(versionForm.publicationYear)
        },
        versionForm.reason,
        'Lead Auditor',
        customFactors
      );

      if (onUpdateCustomFactors) {
        onUpdateCustomFactors(nextCustoms);
      }
      setVersionTargetFactor(null);
      setVersionForm({
        factorValue: '',
        sourceVersion: '',
        sourceReference: '',
        reason: '',
        publicationYear: new Date().getFullYear()
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Emission Factor Registry</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-full">
                  Phase 2 Verified
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                  {allFactors.length} Authoritative Factors
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central factor library with verified provenance, immutable versioning, and auditable site-specific overrides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsCreatingCustom(true); setFormError(''); }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Custom Factor
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-3 justify-between">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by fuel, grid, material, source or ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Scope Filter */}
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Scopes</option>
              <option value="Scope 1">Scope 1 (Direct)</option>
              <option value="Scope 2">Scope 2 (Electricity)</option>
              <option value="Scope 3">Scope 3 (Value Chain)</option>
            </select>

            {/* Geography Filter */}
            <select
              value={selectedGeo}
              onChange={(e) => setSelectedGeo(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Geographies</option>
              <option value="IN">India (IN)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="GLOBAL">Global Average</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Factors</option>
              <option value="DEFAULT">Default Authoritative</option>
              <option value="CUSTOM">Custom / Overrides</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Factor Name & ID</th>
                  <th className="px-4 py-3">Scope / Category</th>
                  <th className="px-4 py-3">Factor Value</th>
                  <th className="px-4 py-3">Geography / Grid</th>
                  <th className="px-4 py-3">Source Citation</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredFactors.map(factor => {
                  const factorOverrides = overrides.filter(o => o.originalFactorId === factor.id);
                  const isSuperseded = Boolean(factor.supersededBy);

                  return (
                    <tr 
                      key={factor.id} 
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition ${isSuperseded ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {factor.name}
                          {factor.isCustom ? (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-400 rounded">
                              Custom v{factor.version}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 rounded">
                              Official v{factor.version}
                            </span>
                          )}
                          {isSuperseded && (
                            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded">
                              Superseded
                            </span>
                          )}
                          {factorOverrides.length > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded">
                              {factorOverrides.length} Override{factorOverrides.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {factor.id} • {factor.activityType}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {factor.scope}
                        </span>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[180px]">
                          {factor.category}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                          {factor.factorValue.toFixed(4)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {factor.numeratorUnit} / {factor.denominatorUnit}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {factor.country}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {factor.gridRegion ? `Grid: ${factor.gridRegion}` : factor.geography}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
                          {factor.source}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {factor.sourceReference} ({factor.publicationYear})
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectedFactor(factor)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition border border-slate-200 dark:border-slate-700"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => {
                              setOverrideTargetFactor(factor);
                              setOverrideForm({
                                facilityId: '',
                                replacementFactorValue: factor.factorValue,
                                replacementUnit: factor.denominatorUnit,
                                reason: '',
                                source: '',
                                sourceReference: ''
                              });
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition border border-blue-200 dark:border-blue-800"
                          >
                            Override
                          </button>
                          <button
                            onClick={() => {
                              setVersionTargetFactor(factor);
                              setVersionForm({
                                factorValue: factor.factorValue,
                                sourceVersion: `${factor.sourceVersion || '1.0'}-rev`,
                                sourceReference: '',
                                reason: '',
                                publicationYear: new Date().getFullYear()
                              });
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition border border-purple-200 dark:border-purple-800"
                          >
                            New Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredFactors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No emission factors matched your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Strict Immutability Enforced
            </span>
            <span className="flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-500" />
              GWP Basis: IPCC AR6 Standard
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition shadow-sm"
          >
            Done
          </button>
        </div>

        {/* Drawer: Detailed Factor Inspection (Requirement 13) */}
        {inspectedFactor && (
          <div className="fixed inset-0 z-60 flex items-center justify-end bg-slate-950/50 backdrop-blur-xs">
            <div className="w-full max-w-lg h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Factor Provenance Detail</h3>
                </div>
                <button 
                  aria-label="Close factor detail"
                  onClick={() => setInspectedFactor(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{inspectedFactor.name}</div>
                  <div className="font-mono text-[11px] text-slate-400 mt-1">{inspectedFactor.id}</div>
                  <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {inspectedFactor.factorValue} <span className="text-xs font-normal text-slate-500">{inspectedFactor.numeratorUnit} / {inspectedFactor.denominatorUnit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Scope & Category:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{inspectedFactor.scope}</div>
                    <div className="text-[11px] text-slate-500">{inspectedFactor.category}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Activity Type:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{inspectedFactor.activityType}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Geography & Region:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{inspectedFactor.country} ({inspectedFactor.geography})</div>
                    <div className="text-[11px] text-slate-500">{inspectedFactor.gridRegion || 'National'}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">GWP Basis & Tier:</span>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{inspectedFactor.gwpBasis}</div>
                    <div className="text-[11px] text-slate-500">{inspectedFactor.tier} ({inspectedFactor.uncertainty})</div>
                  </div>
                </div>

                {/* Source & Provenance */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-medium">Authoritative Provenance:</span>
                  <div className="font-semibold text-slate-900 dark:text-white">{inspectedFactor.source}</div>
                  <div className="text-slate-600 dark:text-slate-300">Org: {inspectedFactor.sourceOrganization}</div>
                  <div className="text-slate-500 text-[11px]">Ref: {inspectedFactor.sourceReference}</div>
                  <div className="text-slate-500 text-[11px]">Dataset Version: {inspectedFactor.sourceVersion} ({inspectedFactor.publicationYear})</div>
                </div>

                {/* Greenhouse Gases Breakdown */}
                {inspectedFactor.gases && Object.keys(inspectedFactor.gases).length > 0 && (
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Greenhouse Gas Composition:</span>
                    <div className="grid grid-cols-3 gap-2 mt-1.5 font-mono text-[11px]">
                      {inspectedFactor.gases.co2 !== undefined && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                          CO2: <span className="font-bold">{inspectedFactor.gases.co2}</span>
                        </div>
                      )}
                      {inspectedFactor.gases.ch4 !== undefined && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                          CH4: <span className="font-bold">{inspectedFactor.gases.ch4}</span>
                        </div>
                      )}
                      {inspectedFactor.gases.n2o !== undefined && (
                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded">
                          N2O: <span className="font-bold">{inspectedFactor.gases.n2o}</span>
                        </div>
                      )}
                    </div>
                    {inspectedFactor.gases.notes && (
                      <div className="text-[10px] text-slate-400 mt-1.5 italic">
                        {inspectedFactor.gases.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Immutability Notice */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Immutable Historical Record</div>
                    <div className="text-[11px] opacity-90 mt-0.5">
                      This factor cannot be mutated in-place. If modifications or updates are required, use the "New Version" action to spawn version {(inspectedFactor.version || 1) + 1}.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Custom Factor */}
        {isCreatingCustom && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Add Custom Emission Factor</h3>
                <button onClick={() => setIsCreatingCustom(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded text-red-600 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveCustomFactor} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Factor Name *</label>
                  <input
                    type="text"
                    required
                    value={customForm.name}
                    onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                    placeholder="e.g. Biomass Briquettes (Groundnut Shells)"
                    className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Scope *</label>
                    <select
                      value={customForm.scope}
                      onChange={(e) => setCustomForm({ ...customForm, scope: e.target.value })}
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="Scope 1">Scope 1</option>
                      <option value="Scope 2">Scope 2</option>
                      <option value="Scope 3">Scope 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Activity Type *</label>
                    <input
                      type="text"
                      required
                      value={customForm.activityType}
                      onChange={(e) => setCustomForm({ ...customForm, activityType: e.target.value })}
                      placeholder="e.g. Fuel Combustion"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Factor Value (kgCO2e) *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={customForm.factorValue}
                      onChange={(e) => setCustomForm({ ...customForm, factorValue: e.target.value })}
                      placeholder="e.g. 0.1450"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Denominator Unit *</label>
                    <select
                      value={customForm.denominatorUnit}
                      onChange={(e) => setCustomForm({ ...customForm, denominatorUnit: e.target.value })}
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="kg">kg (Kilogram)</option>
                      <option value="tonne">tonne (Metric Ton)</option>
                      <option value="L">L (Liter)</option>
                      <option value="m3">m3 (Cubic Meter)</option>
                      <option value="kWh">kWh (Kilowatt-Hour)</option>
                      <option value="MWh">MWh (Megawatt-Hour)</option>
                      <option value="km">km (Kilometer)</option>
                      <option value="tkm">tkm (Tonne-Kilometer)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Source Authority *</label>
                    <input
                      type="text"
                      required
                      value={customForm.source}
                      onChange={(e) => setCustomForm({ ...customForm, source: e.target.value })}
                      placeholder="e.g. Certified Testing Laboratory"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Source Reference / Citation *</label>
                    <input
                      type="text"
                      required
                      value={customForm.sourceReference}
                      onChange={(e) => setCustomForm({ ...customForm, sourceReference: e.target.value })}
                      placeholder="e.g. Report #TEST-2024-8849"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Save Custom Factor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Factor Override */}
        {overrideTargetFactor && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Create Factor Override</h3>
                <button onClick={() => setOverrideTargetFactor(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs">
                <div className="text-slate-500">Overriding Default Factor:</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{overrideTargetFactor.name}</div>
                <div className="text-emerald-600 font-mono mt-1 font-bold">
                  Original: {overrideTargetFactor.factorValue} {overrideTargetFactor.numeratorUnit}/{overrideTargetFactor.denominatorUnit}
                </div>
              </div>

              {formError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveOverride} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Applies To Facility</label>
                  <select
                    value={overrideForm.facilityId}
                    onChange={(e) => setOverrideForm({ ...overrideForm, facilityId: e.target.value })}
                    className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="">All Facilities (Enterprise-Wide)</option>
                    {facilities.map(fac => (
                      <option key={fac.id} value={fac.id}>{fac.name} ({fac.city}, {fac.country})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Replacement Value *</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={overrideForm.replacementFactorValue}
                      onChange={(e) => setOverrideForm({ ...overrideForm, replacementFactorValue: e.target.value })}
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Unit</label>
                    <input
                      type="text"
                      disabled
                      value={overrideTargetFactor.denominatorUnit}
                      className="w-full mt-1 p-2 rounded border border-slate-200 bg-slate-100 text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Audit Justification Reason *</label>
                  <textarea
                    required
                    rows={2}
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                    placeholder="e.g. Site-specific PPA wheeling agreement with certified captive solar supplier."
                    className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Source Authority *</label>
                    <input
                      type="text"
                      required
                      value={overrideForm.source}
                      onChange={(e) => setOverrideForm({ ...overrideForm, source: e.target.value })}
                      placeholder="e.g. DISCOM / Bilateral Contract"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Evidence / Reference *</label>
                    <input
                      type="text"
                      required
                      value={overrideForm.sourceReference}
                      onChange={(e) => setOverrideForm({ ...overrideForm, sourceReference: e.target.value })}
                      placeholder="e.g. Contract ID #PPA-2024"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setOverrideTargetFactor(null)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Apply Override
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Factor Versioning */}
        {versionTargetFactor && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Spawn New Version (v{(versionTargetFactor.version || 1) + 1})
                </h3>
                <button onClick={() => setVersionTargetFactor(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-800 dark:text-amber-300">
                <strong>Immutability Notice:</strong> The original factor (v{versionTargetFactor.version || 1}) will not be mutated. Historical inventories will continue referencing the original version, while new calculations will use this v{(versionTargetFactor.version || 1) + 1}.
              </div>

              {formError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveVersion} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">New Factor Value *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={versionForm.factorValue}
                    onChange={(e) => setVersionForm({ ...versionForm, factorValue: e.target.value })}
                    className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Dataset Version *</label>
                    <input
                      type="text"
                      required
                      value={versionForm.sourceVersion}
                      onChange={(e) => setVersionForm({ ...versionForm, sourceVersion: e.target.value })}
                      placeholder="e.g. v20.0"
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Publication Year *</label>
                    <input
                      type="number"
                      required
                      value={versionForm.publicationYear}
                      onChange={(e) => setVersionForm({ ...versionForm, publicationYear: e.target.value })}
                      className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">New Source Reference Citation *</label>
                  <input
                    type="text"
                    required
                    value={versionForm.sourceReference}
                    onChange={(e) => setVersionForm({ ...versionForm, sourceReference: e.target.value })}
                    placeholder="e.g. Official Gazette / CEA User Guide v20.0"
                    className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Reason for Version Update *</label>
                  <textarea
                    required
                    rows={2}
                    value={versionForm.reason}
                    onChange={(e) => setVersionForm({ ...versionForm, reason: e.target.value })}
                    placeholder="e.g. Annual CEA grid factor update from Dec 2024 publication."
                    className="w-full mt-1 p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setVersionTargetFactor(null)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                  >
                    Spawn Version
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
