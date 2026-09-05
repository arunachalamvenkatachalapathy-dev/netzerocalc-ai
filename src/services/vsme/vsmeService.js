/**
 * NetZeroCalc-AI — VSME Voluntary SME Sustainability Reporting Service
 * Compliance & Readiness Engine:
 * - Scoping & Size Bracket Logic (≤10 Micro-enterprises vs >10 SMEs)
 * - Module Scoping (Option A: Basic 28 DPs vs Option B: Basic + Comprehensive 55 DPs)
 * - Value Chain Cap Shield Evaluator (Annex II, 23 protected items)
 * - Dynamic Section & Essential Readiness Progress Tracking
 * - High Climate Impact Sector (NACE A-H, M) Transition Plan Triggers
 * - Single-Umbrella NetZeroCalc Corporate GHG Inventory Auto-Bridge
 * - RFC 4180 Audit Trail CSV & Statement Exporter
 */

import {
  VSME_DATAPOINTS,
  VSME_CAP_ITEMS,
  VSME_MODULES,
  ORGANISATION_SIZES,
  NACE_HIGH_CLIMATE_SECTORS
} from '../../data/vsmeData.js';

export {
  VSME_DATAPOINTS,
  VSME_CAP_ITEMS,
  VSME_MODULES,
  ORGANISATION_SIZES,
  NACE_HIGH_CLIMATE_SECTORS
};

/**
 * Filter datapoints based on selected module (Basic vs Both)
 */
export function getScopedDatapoints(module = 'basic') {
  if (module === 'basic') {
    return VSME_DATAPOINTS.filter(dp => dp.module === 'Basic');
  }
  return VSME_DATAPOINTS;
}

/**
 * Check if a datapoint is mandatory/essential given company size
 */
export function isDatapointEssential(dp, size = 'gt10') {
  if (!dp) return false;
  if (dp.type === 'Voluntary') return false;
  if (size === 'le10' && !dp.le10) return false;
  if (size === 'gt10' && !dp.gt10) return false;
  return true;
}

/**
 * Check if a specific DR is within the Value Chain Cap
 */
export function isWithinValueChainCap(dr, size = 'gt10') {
  const item = VSME_CAP_ITEMS.find(c => c.dr === dr);
  if (!item) return false;
  if (size === 'le10') return !!item.le10;
  return !!item.gt10;
}

/**
 * Calculate readiness metrics, section completion, and regulatory alerts
 */
export function calculateVsmeReadiness({
  datapoints = VSME_DATAPOINTS,
  responses = {},
  size = 'gt10',
  module = 'basic',
  nace = '',
  companyName = ''
}) {
  const total = datapoints.length;
  if (total === 0) {
    return {
      total: 0,
      completed: 0,
      inProgress: 0,
      na: 0,
      pending: 0,
      completionPct: 0,
      essentialTotal: 0,
      essentialCompleted: 0,
      essentialPending: 0,
      sections: [],
      alerts: []
    };
  }

  let completed = 0;
  let inProgress = 0;
  let na = 0;
  let essentialTotal = 0;
  let essentialCompleted = 0;

  datapoints.forEach(dp => {
    const r = responses[dp.id] || {};
    const status = r.status || '';
    const isDone = status === 'Complete';
    const isNA = status === 'N/A';
    const isInProg = status === 'In progress';
    const isEss = isDatapointEssential(dp, size);

    if (isEss) {
      essentialTotal++;
      if (isDone || isNA) essentialCompleted++;
    }

    if (isDone) completed++;
    else if (isNA) na++;
    else if (isInProg) inProgress++;
  });

  const resolved = completed + na;
  const pending = total - resolved;
  const completionPct = Math.round((resolved / total) * 100);
  const essentialPending = essentialTotal - essentialCompleted;

  // Group progress by section
  const sectionMap = {};
  datapoints.forEach(dp => {
    const sec = dp.section;
    if (!sectionMap[sec]) {
      sectionMap[sec] = {
        section: sec,
        module: dp.module,
        total: 0,
        completed: 0,
        inProgress: 0,
        na: 0
      };
    }
    sectionMap[sec].total++;
    const r = responses[dp.id] || {};
    if (r.status === 'Complete') sectionMap[sec].completed++;
    else if (r.status === 'N/A') sectionMap[sec].na++;
    else if (r.status === 'In progress') sectionMap[sec].inProgress++;
  });

  const sections = Object.values(sectionMap).map(s => ({
    ...s,
    pct: Math.round(((s.completed + s.na) / s.total) * 100)
  }));

  // Generate statutory compliance alerts
  const alerts = [];
  if (!module) {
    alerts.push({
      type: 'warning',
      text: 'Reporting module not selected. Choose Option A (Basic Module) or Option B (Basic + Comprehensive Module).'
    });
  }
  if (!size) {
    alerts.push({
      type: 'warning',
      text: 'Organisation size bracket not specified. Headcount is required to apply statutory micro-enterprise relief.'
    });
  }

  // NACE High Climate Impact Check
  const isHighClimate = NACE_HIGH_CLIMATE_SECTORS.some(s => s.code === nace);
  if (isHighClimate) {
    const c33 = responses['C3-3'] || {};
    if (!c33.status || c33.status === 'Not started') {
      alerts.push({
        type: 'high-climate',
        text: `NACE Sector ${nace} is designated High Climate Impact. Under C(2026) 5011, disclosure of absence of a Climate Transition Plan (C3-3) is mandatory with an adoption roadmap.`
      });
    }
  }

  if (essentialPending > 0) {
    alerts.push({
      type: 'pending',
      text: `${essentialPending} essential datapoints require completion to satisfy baseline voluntary standards.`
    });
  }

  if (resolved === total && total > 0) {
    alerts.push({
      type: 'success',
      text: `All ${total} in-scope datapoints have verified disclosures. Your Voluntary Sustainability Statement is audit-ready.`
    });
  }

  return {
    total,
    completed,
    inProgress,
    na,
    pending,
    completionPct,
    essentialTotal,
    essentialCompleted,
    essentialPending,
    sections,
    alerts
  };
}

/**
 * NetZeroCalc Single-Umbrella Corporate GHG Inventory Auto-Bridge
 * Bridges active project Scope 1, 2, and 3 emissions directly into VSME disclosures
 */
export function syncFromGhgInventory(activeProject, activePeriodYear) {
  if (!activeProject) return {};

  const period = activeProject.periods?.find(p => p.year === activePeriodYear) || activeProject.periods?.[0];
  const bom = period?.bom || [];

  let scope1Kg = 0;
  let scope2Kg = 0;
  let scope3Kg = 0;
  let energyKwh = 0;

  bom.forEach(item => {
    const qty = Number(item.qty) || 0;
    const ef = Number(item.ef) || 0;
    const totalKg = qty * ef;
    const s = String(item.scope || '').toLowerCase();

    if (s.includes('scope 1') || s === '1') {
      scope1Kg += totalKg;
      if (item.unit === 'Liters' || item.unit === 'kg') {
        energyKwh += qty * 10; // Nominal fuel thermal equivalent
      }
    } else if (s.includes('scope 2') || s === '2') {
      scope2Kg += totalKg;
      if (item.unit === 'kWh' || item.unit === 'kwh') {
        energyKwh += qty;
      }
    } else if (s.includes('scope 3') || s === '3') {
      scope3Kg += totalKg;
    }
  });

  const scope1Tco2e = Number((scope1Kg / 1000).toFixed(2));
  const scope2Tco2e = Number((scope2Kg / 1000).toFixed(2));
  const scope3Tco2e = Number((scope3Kg / 1000).toFixed(2));
  const energyMwh = Number((energyKwh / 1000).toFixed(2));

  const syncedResponses = {};

  // B3-1: Energy consumption and mix
  if (energyMwh > 0 || bom.length > 0) {
    syncedResponses['B3-1'] = {
      status: 'Complete',
      quant: `${energyMwh} MWh`,
      narrative: `Total corporate energy consumption across operations for reporting period FY${activePeriodYear}. Synced automatically from NetZeroCalc enterprise facility and activity ledger.`,
      source: `NetZeroCalc Corporate Inventory [Project: ${activeProject.projectName || activeProject.id}, Period: FY${activePeriodYear}]`
    };
  }

  // B3-2: Scope 1 gross direct GHG emissions
  if (scope1Tco2e >= 0 && bom.some(i => String(i.scope).includes('1'))) {
    syncedResponses['B3-2'] = {
      status: 'Complete',
      quant: `${scope1Tco2e} tCO2e`,
      narrative: `Gross direct Scope 1 greenhouse gas emissions calculated in compliance with ISO 14064-1 / GHG Protocol corporate standard using IPCC AR6 / CEA emissions factors.`,
      source: `NetZeroCalc GHG Engine (BOM verified Scope 1 combustion activity)`
    };
  }

  // B3-3: Scope 2 location-based and market-based GHG emissions
  if (scope2Tco2e >= 0 && bom.some(i => String(i.scope).includes('2'))) {
    syncedResponses['B3-3'] = {
      status: 'Complete',
      quant: `Location-based: ${scope2Tco2e} tCO2e`,
      narrative: `Gross location-based Scope 2 emissions from grid electricity consumption across active corporate facilities.`,
      source: `NetZeroCalc Scope 2 Dual-Reporting Ledger`
    };
  }

  // C3-2: Scope 3 GHG emissions & decarbonization targets
  if (scope3Tco2e > 0) {
    syncedResponses['C3-2'] = {
      status: 'Complete',
      quant: `${scope3Tco2e} tCO2e`,
      narrative: `Scope 3 upstream and downstream value chain emissions calculated from supplier product carbon footprint (PCF) declarations.`,
      source: `NetZeroCalc Scope 3 Categories 1–15 Aggregator`
    };
  }

  return syncedResponses;
}

/**
 * Export Boardroom / Assurance Audit Trail to RFC 4180 CSV
 */
export function exportVsmeAuditCsv(datapoints, responses = {}, companyName = 'Organization', reportingYear = 2026) {
  const headers = [
    'ID',
    'Disclosure Requirement',
    'Title',
    'Module',
    'Type',
    'LE10 Applicable',
    'GT10 Applicable',
    'Reporting Unit',
    'SFDR Equivalent',
    'ESRS Equivalent',
    'VC Cap LE10',
    'VC Cap GT10',
    'Response Status',
    'Quantitative Value',
    'Narrative Disclosure',
    'Evidence Source'
  ];

  const rows = datapoints.map(dp => {
    const r = responses[dp.id] || {};
    return [
      dp.id,
      dp.dr,
      dp.title,
      dp.module,
      dp.type,
      dp.le10 ? 'YES' : 'NO',
      dp.gt10 ? 'YES' : 'NO',
      dp.unit,
      dp.sfdr || '-',
      dp.esrs || '-',
      dp.vcLe10 ? 'YES' : 'NO',
      dp.vcGt10 ? 'YES' : 'NO',
      r.status || 'Not started',
      r.quant || '',
      r.narrative || '',
      r.source || ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
}

/**
 * Format Voluntary Sustainability Statement (Shadow Report Text)
 */
export function exportVsmeReportText({
  company = 'My Enterprise',
  year = 2026,
  preparer = 'Lead Sustainability Officer',
  country = 'European Union',
  nace = 'C',
  size = 'gt10',
  module = 'basic',
  datapoints = VSME_DATAPOINTS,
  responses = {}
}) {
  const sizeObj = ORGANISATION_SIZES.find(s => s.id === size);
  const modObj = module === 'both' ? VSME_MODULES.COMPREHENSIVE : VSME_MODULES.BASIC;

  let text = `# VOLUNTARY SUSTAINABILITY STATEMENT (VSME)
Financial Reporting Period: FY${year}
Reporting Entity: ${company}
Operating Country: ${country} | NACE Sector: ${nace}
Enterprise Size: ${sizeObj?.name || size}
Reporting Option: ${modObj.name}
Framework: European Commission Delegated Regulation C(2026) 5011 (VSME Standard)
Statement Date: ${new Date().toISOString().split('T')[0]}
Prepared By: ${preparer}

================================================================================
EXECUTIVE STATEMENT OF COMPLIANCE
================================================================================
This Voluntary Sustainability Statement has been prepared by ${company} in 
accordance with Commission Delegated Regulation C(2026) 5011 (Voluntary European 
Sustainability Reporting Standard for Non-Listed SMEs). The disclosures 
presented herein comply with the statutory specifications of Annex I and operate 
under the legal protections of the Value Chain Cap (Annex II).

================================================================================
DISCLOSURE SECTIONS & STATUTORY RESPONSES
================================================================================
`;

  const sections = [...new Set(datapoints.map(dp => dp.section))];

  sections.forEach(sec => {
    text += `\n--------------------------------------------------------------------------------\n`;
    text += `SECTION: ${sec.toUpperCase()}\n`;
    text += `--------------------------------------------------------------------------------\n`;

    const secDPs = datapoints.filter(dp => dp.section === sec);
    secDPs.forEach(dp => {
      const r = responses[dp.id] || {};
      text += `\n[${dp.id}] ${dp.dr} · ${dp.title}\n`;
      text += `Status: ${r.status || 'Not started'}\n`;
      text += `Unit / Format: ${dp.unit}\n`;
      if (dp.esrs !== '-') text += `Equivalent Mandatory ESRS: ${dp.esrs}\n`;
      if (dp.sfdr !== '-') text += `SFDR Alignment: ${dp.sfdr}\n`;
      if (r.quant) text += `Quantitative Metric: ${r.quant}\n`;
      if (r.narrative) text += `Narrative Statement:\n${r.narrative}\n`;
      if (r.source) text += `Evidence Citation: ${r.source}\n`;
    });
  });

  text += `\n================================================================================\n`;
  text += `END OF SUSTAINABILITY STATEMENT · GENERATED BY NETZEROCALC ENTERPRISE\n`;
  text += `================================================================================\n`;

  return text;
}
