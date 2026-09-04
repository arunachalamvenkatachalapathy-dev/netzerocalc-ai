/**
 * NetZeroCalc-AI — EU ESG Regulation Navigator Service
 * Logic & Matrix Calculation Engine:
 * - 2D Effort vs. Liability Scatter Mapping
 * - 5-Factor Radar Geometry (Effort, Liability, Market Impact, Data Intensity, Enforcement Risk)
 * - Multi-dimensional Filtering (Categories, 15 Industry Sectors, Timeline Horizons, Full-Text Search)
 * - Strategic Quadrant Classification (Q1 Board Critical, Q2 Quick Wins, Q3 Operational, Q4 Monitored)
 * - Boardroom Compliance Shortlist CSV Exporter
 */

import {
  EU_REGULATIONS_60,
  CATEGORIES,
  INDUSTRIES,
  STRATEGIC_QUADRANTS,
  EU_CATEGORIES,
  INDUSTRY_SECTORS
} from '../../data/euRegulations60Data.js';

export { EU_REGULATIONS_60, CATEGORIES, INDUSTRIES, STRATEGIC_QUADRANTS, EU_CATEGORIES, INDUSTRY_SECTORS };

/**
 * Deterministic hash and jitter for non-overlapping scatter plot points
 */
export function hashStr(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

export function jitter(seed = '', magnitude = 9) {
  const h = hashStr(seed);
  const a = ((Math.abs(h) % 1000) / 1000);
  return (a - 0.5) * 2 * magnitude;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Tokenize industry strings
 */
export function tokenizeIndustry(industryStr = '') {
  return String(industryStr || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Check if a regulation applies to the specified industry sector
 */
export function matchesIndustry(reg, industryValue = 'all') {
  if (!reg || industryValue === 'all') return true;
  const tokens = tokenizeIndustry(reg.industry);
  const lower = String(reg.industry || '').toLowerCase();
  if (lower.includes('all sectors') || lower.includes('all industries')) {
    return true;
  }
  const group = INDUSTRIES.find(i => i.value === industryValue);
  if (!group || !group.kw.length) return true;
  return group.kw.some(kw => tokens.some(t => kw.length <= 3 ? t === kw : t.includes(kw)));
}

/**
 * Check if a regulation is visible for the selected timeline horizon
 */
export function isYearVisible(reg, targetYear = 2031) {
  if (!reg) return false;
  if (targetYear >= 2031) return true; // All years
  // Always show special status items (withdrawn, proposed, stalled) so practitioners keep tracking them
  if (reg.yearNote === 'withdrawn' || reg.yearNote === 'proposed' || reg.yearNote === 'stalled') {
    return true;
  }
  // Ongoing obligations (GDPR, REACH, etc.) always apply
  if (reg.yearNote === 'ongoing') {
    return true;
  }
  return reg.yearNum !== null && reg.yearNum !== undefined && reg.yearNum <= targetYear;
}

/**
 * Determine the strategic quadrant for a regulation
 */
export function getRegulationQuadrant(reg) {
  if (!reg) return 'Q4';
  const highEffort = (Number(reg.effort) || 0) >= 3;
  const highLiability = (Number(reg.liability) || 0) >= 3;

  if (highEffort && highLiability) return 'Q1'; // Board Critical
  if (!highEffort && highLiability) return 'Q2'; // High-Exposure Quick Win
  if (highEffort && !highLiability) return 'Q3'; // Operational Heavyweight
  return 'Q4'; // Monitored / Targeted
}

/**
 * Master filter for regulations
 */
export function filterRegulations(arg1 = {}, arg2) {
  let regulations, activeCategories, industry, year, searchQuery, quadrantFilter;

  if (Array.isArray(arg1)) {
    regulations = arg1;
    const opts = arg2 || {};
    industry = opts.industry || 'all';
    year = opts.year ?? opts.targetYear ?? 2031;
    searchQuery = opts.searchQuery ?? opts.search ?? '';
    quadrantFilter = opts.quadrantFilter ?? opts.quadrant ?? 'all';
    if (opts.category && opts.category !== 'all') {
      activeCategories = new Set([opts.category]);
    } else if (opts.activeCategories) {
      activeCategories = opts.activeCategories;
    } else {
      activeCategories = new Set(Object.keys(CATEGORIES));
    }
  } else {
    regulations = arg1.regulations || EU_REGULATIONS_60;
    if (arg1.category && arg1.category !== 'all') {
      activeCategories = new Set([arg1.category]);
    } else if (arg1.activeCategories) {
      activeCategories = arg1.activeCategories;
    } else {
      activeCategories = new Set(Object.keys(CATEGORIES));
    }
    industry = arg1.industry || 'all';
    year = arg1.year ?? arg1.targetYear ?? 2031;
    searchQuery = arg1.searchQuery ?? arg1.search ?? '';
    quadrantFilter = arg1.quadrantFilter ?? arg1.quadrant ?? 'all';
  }

  const q = (searchQuery || '').trim().toLowerCase();

  return regulations.filter(reg => {
    // 1. Category filter
    if (activeCategories && !activeCategories.has(reg.category)) {
      return false;
    }

    // 2. Industry sector filter
    if (!matchesIndustry(reg, industry)) {
      return false;
    }

    // 3. Year timeline filter
    if (!isYearVisible(reg, year)) {
      return false;
    }

    // 4. Strategic quadrant filter
    if (quadrantFilter !== 'all' && getRegulationQuadrant(reg) !== quadrantFilter) {
      return false;
    }

    // 5. Full-text search
    if (q) {
      const matchShort = String(reg.short || '').toLowerCase().includes(q);
      const matchName = String(reg.name || '').toLowerCase().includes(q);
      const matchSummary = String(reg.summary || '').toLowerCase().includes(q);
      const matchMustDo = String(reg.mustDo || '').toLowerCase().includes(q);
      const matchPolicy = String(reg.policyArea || '').toLowerCase().includes(q);
      const matchIndustry = String(reg.industry || '').toLowerCase().includes(q);
      if (!matchShort && !matchName && !matchSummary && !matchMustDo && !matchPolicy && !matchIndustry) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate aggregated statistics for visible regulations
 */
export function calculateNavigatorStatistics(visibleRegs = []) {
  const total = visibleRegs.length;
  if (total === 0) {
    return {
      totalCount: 0,
      percentInScope: 0,
      avgEffort: 0,
      avgLiability: 0,
      avgMarket: 0,
      avgDataIntensity: 0,
      avgEnforcement: 0,
      highLiabilityCount: 0,
      highEffortCount: 0,
      quadrantCounts: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      quadrants: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      categoryCounts: {},
      categories: {}
    };
  }

  let sumEffort = 0;
  let sumLiability = 0;
  let sumMarket = 0;
  let sumData = 0;
  let sumEnforce = 0;
  let highLiability = 0;
  let highEffort = 0;

  const quadrantCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const categoryCounts = {};

  visibleRegs.forEach(reg => {
    const e = Number(reg.effort) || 0;
    const l = Number(reg.liability) || 0;
    const m = Number(reg.market) || 0;
    const d = Number(reg.dataIntensity) || 0;
    const enf = Number(reg.enforcement) || 0;

    sumEffort += e;
    sumLiability += l;
    sumMarket += m;
    sumData += d;
    sumEnforce += enf;

    if (l >= 4) highLiability++;
    if (e >= 4) highEffort++;

    const q = getRegulationQuadrant(reg);
    quadrantCounts[q] = (quadrantCounts[q] || 0) + 1;

    categoryCounts[reg.category] = (categoryCounts[reg.category] || 0) + 1;
  });

  return {
    totalCount: total,
    percentInScope: Number(((total / 60) * 100).toFixed(0)),
    avgEffort: Number((sumEffort / total).toFixed(1)),
    avgLiability: Number((sumLiability / total).toFixed(1)),
    avgMarket: Number((sumMarket / total).toFixed(1)),
    avgDataIntensity: Number((sumData / total).toFixed(1)),
    avgEnforcement: Number((sumEnforce / total).toFixed(1)),
    highLiabilityCount: highLiability,
    highEffortCount: highEffort,
    quadrantCounts,
    quadrants: quadrantCounts,
    categoryCounts,
    categories: categoryCounts
  };
}

/**
 * 2D Scatter Plot Coordinates Generator (Single or Array)
 */
export function calculateScatterCoordinates(
  regOrRegs,
  plotWidth = 500,
  plotHeight = 500,
  padding = { l: 54, r: 22, t: 22, b: 54 }
) {
  const pad = typeof padding === 'number'
    ? { l: padding, r: padding, t: padding, b: padding }
    : (padding || { l: 54, r: 22, t: 22, b: 54 });

  const calcSingle = (reg) => {
    const pw = plotWidth - pad.l - pad.r;
    const ph = plotHeight - pad.t - pad.b;

    const sx = (eff) => pad.l + ((eff - 1) / 4) * pw;
    const sy = (liab) => pad.t + (1 - (liab - 1) / 4) * ph;

    const DOT_R_MAX = 8.5;
    const DOT_STROKE = 1.4;
    const EDGE_BUFFER = DOT_R_MAX + DOT_STROKE + 1;

    let rawX = sx(reg.effort || 1) + jitter((reg.short || reg.name || '') + 'x', 9);
    let rawY = sy(reg.liability || 1) + jitter((reg.short || reg.name || '') + 'y', 9);

    const cx = clamp(rawX, pad.l + EDGE_BUFFER, plotWidth - pad.r - EDGE_BUFFER);
    const cy = clamp(rawY, pad.t + EDGE_BUFFER, plotHeight - pad.b - EDGE_BUFFER);

    return {
      cx: Number(cx.toFixed(1)),
      cy: Number(cy.toFixed(1)),
      x: Number(cx.toFixed(1)),
      y: Number(cy.toFixed(1))
    };
  };

  if (Array.isArray(regOrRegs)) {
    return regOrRegs.map(r => {
      const coords = calcSingle(r);
      return {
        ...r,
        ...coords,
        id: r.id || r.short?.toLowerCase().replace(/[^a-z0-9]/g, '_') || r.name,
        acronym: r.short
      };
    });
  }

  return calcSingle(regOrRegs);
}

/**
 * 5-Factor Radar Geometry Generator
 * Factors: [Effort, Liability, Market Impact, Data Intensity, Enforcement Risk]
 */
export function generateRadarGeometry(reg, cx = 160, cy = 142, R = 104) {
  const factors = [
    { label: 'Effort', value: reg?.effort || 1, code: 'effort' },
    { label: 'Liability', value: reg?.liability || 1, code: 'liability' },
    { label: 'Market Impact', value: reg?.market || 1, code: 'market' },
    { label: 'Data Intensity', value: reg?.dataIntensity || 1, code: 'dataIntensity' },
    { label: 'Enforcement', value: reg?.enforcement || 1, code: 'enforcement' }
  ];

  const points = factors.map((f, i) => {
    const ang = (-90 + i * 72) * (Math.PI / 180);
    const r = (Math.max(1, Math.min(5, f.value)) / 5) * R;
    const x = cx + r * Math.cos(ang);
    const y = cy + r * Math.sin(ang);
    return {
      label: f.label,
      value: f.value,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1))
    };
  });

  const polygonPointsStr = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid polygon rings for 25%, 50%, 75%, 100%
  const gridRings = [0.25, 0.5, 0.75, 1.0].map(fraction => {
    const ringPts = [0, 1, 2, 3, 4].map(i => {
      const ang = (-90 + i * 72) * (Math.PI / 180);
      const r = fraction * R;
      return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
    }).join(' ');
    return { fraction, pointsStr: ringPts };
  });

  // 5 Axis spoke lines
  const axes = [0, 1, 2, 3, 4].map(i => {
    const ang = (-90 + i * 72) * (Math.PI / 180);
    return {
      x1: cx,
      y1: cy,
      x2: Number((cx + R * Math.cos(ang)).toFixed(1)),
      y2: Number((cy + R * Math.sin(ang)).toFixed(1)),
      labelX: Number((cx + (R + 26) * Math.cos(ang)).toFixed(1)),
      labelY: Number((cy + (R + 26) * Math.sin(ang)).toFixed(1)),
      label: factors[i].label,
      value: factors[i].value
    };
  });

  return {
    cx,
    cy,
    R,
    points,
    polygonPointsStr,
    polygonPoints: polygonPointsStr,
    gridRings,
    rings: gridRings.map(g => g.pointsStr),
    axes
  };
}

/**
 * Export Boardroom Compliance Shortlist to RFC 4180 CSV
 */
export function exportShortlistToCsv(visibleRegs = []) {
  const headers = [
    'Short Code',
    'Regulation Name',
    'Category',
    'Legal Status',
    'Current Status',
    'First Compliance Horizon',
    'Implementation Effort (1-5)',
    'Legal Liability Exposure (1-5)',
    'Market Impact (1-5)',
    'Data Intensity (1-5)',
    'Enforcement Scrutiny (1-5)',
    'Strategic Quadrant',
    'Key Actions Required (Must Do)',
    'Applicable Industries'
  ];

  const rows = visibleRegs.map(r => {
    const q = getRegulationQuadrant(r);
    return [
      `"${String(r.short || '').replace(/"/g, '""')}"`,
      `"${String(r.name || '').replace(/"/g, '""')}"`,
      `"${String(r.category || '')}"`,
      `"${String(r.legalStatus || '').replace(/"/g, '""')}"`,
      `"${String(r.status || '').replace(/"/g, '""')}"`,
      `"${String(r.firstYear ?? '').replace(/"/g, '""')}"`,
      r.effort || 0,
      r.liability || 0,
      r.market || 0,
      r.dataIntensity || 0,
      r.enforcement || 0,
      `"${q}"`,
      `"${String(r.mustDo || '').replace(/"/g, '""')}"`,
      `"${String(r.industry || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Get category HEX or theme color
 */
export function getCategoryColor(category) {
  return CATEGORIES[category]?.hex || '#10b981';
}

/**
 * Get styling badge classes for Strategic Quadrant
 */
export function getQuadrantBadgeClass(quadrantKey) {
  switch (quadrantKey) {
    case 'Q1':
      return 'bg-red-500/15 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold';
    case 'Q2':
      return 'bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold';
    case 'Q3':
      return 'bg-blue-500/15 text-blue-500 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold';
    case 'Q4':
    default:
      return 'bg-slate-500/15 text-slate-400 border border-slate-500/30 px-2 py-0.5 rounded text-[10px] font-bold';
  }
}

/**
 * Get styling badge classes for Legal Status
 */
export function getLegalStatusBadgeClass(status = '') {
  const s = String(status).toLowerCase();
  if (s.includes('regulation')) {
    return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold';
  }
  if (s.includes('directive')) {
    return 'bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-semibold';
  }
  return 'bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-semibold';
}
