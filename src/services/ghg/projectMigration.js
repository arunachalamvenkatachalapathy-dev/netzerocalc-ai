/**
 * Project Normalization & Non-Destructive Migration Service
 * Safely upgrades legacy v2/v3 NetZeroCalc projects into Corporate GHG-ready v4 projects
 * while strictly preserving all existing PCF/BOM arrays, change logs, and declaration data.
 */

import { createDefaultOrganization } from './types.js';

export const CURRENT_SCHEMA_VERSION = 'v4.0.0';

/**
 * Normalizes a single project to ensure it meets both PCF and Corporate GHG schema requirements.
 */
export function normalizeProjectWithCorporate(p = {}) {
  const projectId = p.id || ('proj_' + Date.now());
  const companyName = p.companyName || 'My Enterprise Organization';

  // 1. Organization container
  const organization = p.organization ? {
    id: p.organization.id || ('org_' + projectId),
    name: p.organization.name || companyName,
    country: p.organization.country || p.geography || 'IN',
    consolidationApproach: p.organization.consolidationApproach || 'Operational Control',
    gwpBasis: p.organization.gwpBasis || 'IPCC AR6',
    createdAt: p.organization.createdAt || p.createdAt || new Date().toISOString(),
    updatedAt: p.organization.updatedAt || new Date().toISOString()
  } : createDefaultOrganization(companyName, p.geography || 'IN');

  // 2. Facilities registry
  let facilities = Array.isArray(p.facilities) ? p.facilities : [];
  if (facilities.length === 0) {
    facilities = [
      {
        id: 'fac_' + projectId + '_default',
        organizationId: organization.id,
        name: 'Main Facility (HQ / Manufacturing)',
        code: 'FAC-001',
        country: organization.country || 'IN',
        region: 'Primary Site',
        gridRegion: organization.country === 'IN' ? 'IN_CEA_NATIONAL' : 'GLOBAL_AVG',
        activeFrom: '2020-01-01',
        activeTo: null,
        metadata: {
          notes: 'Default operational facility created during migration.',
          floorAreaM2: 5000,
          employeeCount: 150
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // 3. Reporting Periods (Preserving existing BOM arrays)
  let rawPeriods = p.periods;
  if (!rawPeriods || !Array.isArray(rawPeriods) || rawPeriods.length === 0) {
    const baseYear = parseInt(p.coverBoundary?.baseYear) || 2023;
    const repYear = parseInt(p.coverBoundary?.reportingPeriod) || 2024;
    rawPeriods = [
      {
        year: baseYear,
        reportingYear: baseYear,
        isBaseYear: true,
        label: 'FY' + baseYear + ' (Base Year)',
        startDate: baseYear + '-01-01',
        endDate: baseYear + '-12-31',
        status: 'locked',
        bom: []
      },
      {
        year: repYear,
        reportingYear: repYear,
        isBaseYear: repYear === baseYear,
        label: 'FY' + repYear + (repYear === baseYear ? ' (Base Year)' : ''),
        startDate: repYear + '-01-01',
        endDate: repYear + '-12-31',
        status: 'draft',
        bom: p.bom || []
      }
    ];
  }

  const normalizedPeriods = rawPeriods.map((per, idx) => {
    const yr = parseInt(per.reportingYear || per.year) || (2024 + idx);
    const pStart = per.startDate || (yr + '-01-01');
    const pEnd = per.endDate || (yr + '-12-31');
    const pId = per.id || ('per_' + projectId + '_' + yr);
    const isBase = Boolean(per.isBaseYear);

    return {
      ...per,
      id: pId,
      organizationId: organization.id,
      reportingYear: yr,
      year: yr, // backward compatibility
      label: per.label || ('FY' + yr + (isBase ? ' (Base Year)' : '')),
      startDate: pStart,
      endDate: pEnd,
      isBaseYear: isBase,
      status: per.status || (isBase ? 'locked' : 'draft'),
      bom: Array.isArray(per.bom) ? per.bom : []
    };
  });

  // 4. Change logs
  const changeLog = Array.isArray(p.changeLog) ? p.changeLog : [
    {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'WORKSPACE_INITIALIZED',
      summary: 'Initialized workspace for ' + (p.projectName || 'Corporate Carbon Audit') + '.',
      author: 'System'
    }
  ];

  // 5. Corporate Inventory Ledger
  const corporateInventory = p.corporateInventory || {
    scope1: [],
    scope2: [],
    scope3: [],
    snapshots: {}
  };

  // 6. Factor Overrides & Custom Factors
  const factorOverrides = Array.isArray(p.factorOverrides) ? p.factorOverrides : [];
  const customFactors = Array.isArray(p.customFactors) ? p.customFactors : [];

  return {
    ...p,
    id: projectId,
    projectName: p.projectName || 'Corporate Carbon Audit & Decarbonization Plan',
    companyName: companyName,
    standard: p.standard || 'ISO 14064-1 & Scope 1-3',
    declarationSerial: p.declarationSerial || ('DECL-GHG-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000)),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    organization,
    facilities,
    periods: normalizedPeriods,
    changeLog,
    corporateInventory,
    factorOverrides,
    customFactors
  };
}

/**
 * Loads projects from localStorage, applying safe migration
 */
export function loadAndMigrateProjects(initialProjects = []) {
  try {
    const v4 = localStorage.getItem('netzerocalc_v4_projects');
    if (v4) {
      const parsed = JSON.parse(v4);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProjectWithCorporate);
      }
    }

    const v3 = localStorage.getItem('netzerocalc_v3_projects');
    if (v3) {
      const parsed = JSON.parse(v3);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map(normalizeProjectWithCorporate);
        localStorage.setItem('netzerocalc_v4_projects', JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved projects during migration:', err);
  }

  return initialProjects.map(normalizeProjectWithCorporate);
}
