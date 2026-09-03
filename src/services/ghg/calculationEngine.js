import { GHG_FACTOR_LIBRARY, SCOPE3_CATEGORY_NAMES } from '../../data/ghgFactorLibrary.js';

/**
 * Format a lineage audit trail entry
 */
export function createLineageEntry({
  scope,
  category,
  method,
  facilityId = null,
  facilityName = 'Company-wide',
  activityValue = 0,
  activityUnit = '',
  ef,
  co2eKg = 0
}) {
  const co2eTonnes = co2eKg / 1000;
  return {
    scope: String(scope),
    category,
    method,
    facility_id: facilityId || null,
    facility_name: facilityName || 'Company-wide',
    activity_value: Number(activityValue),
    activity_unit: activityUnit,
    ef_value: ef.value,
    ef_unit: ef.unit,
    ef_source: ef.source || 'Authoritative Registry',
    ef_version: ef.version || '1.0',
    ef_tier: ef.tier || 2,
    co2e_kg: Number(co2eKg.toFixed(4)),
    co2e_tonnes: Number(co2eTonnes.toFixed(4)),
    formula_applied: `${activityValue} ${activityUnit} × ${ef.value} ${ef.unit} = ${co2eKg.toFixed(3)} kgCO2e (${co2eTonnes.toFixed(3)} tCO2e)`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Scope 1: Stationary Combustion Calculation
 */
export function calculateStationary(entries = [], facilities = []) {
  let totalKg = 0;
  const lineage = [];

  entries.forEach(row => {
    const qty = parseFloat(row.qty) || 0;
    const ef = GHG_FACTOR_LIBRARY.stationary[row.fuel] || GHG_FACTOR_LIBRARY.stationary.natural_gas;
    const co2e = qty * ef.value;
    totalKg += co2e;

    const fac = facilities.find(f => f.id === row.facility);
    lineage.push(createLineageEntry({
      scope: '1',
      category: 'stationary_combustion',
      method: 'activity_based',
      facilityId: row.facility,
      facilityName: fac ? fac.name : (row.facility || 'Company-wide'),
      activityValue: qty,
      activityUnit: row.unit || ef.supportedUnits?.[0] || 'kWh_gross',
      ef,
      co2eKg: co2e
    }));
  });

  return { totalKg, lineage };
}

/**
 * Scope 1: Mobile Combustion Calculation
 */
export function calculateMobile(entries = [], facilities = []) {
  let totalKg = 0;
  const lineage = [];

  entries.forEach(row => {
    const qty = parseFloat(row.qty) || 0;
    const isFuel = row.method === 'fuel';
    const ef = isFuel
      ? (GHG_FACTOR_LIBRARY.mobile_fuel[row.fueltype] || GHG_FACTOR_LIBRARY.mobile_fuel.diesel)
      : (GHG_FACTOR_LIBRARY.mobile_distance[row.fueltype] || GHG_FACTOR_LIBRARY.mobile_distance.car_avg);

    const co2e = qty * ef.value;
    totalKg += co2e;

    const fac = facilities.find(f => f.id === row.facility);
    lineage.push(createLineageEntry({
      scope: '1',
      category: 'mobile_combustion',
      method: isFuel ? 'activity_based (fuel volume)' : 'activity_based (distance Tier 3)',
      facilityId: row.facility,
      facilityName: fac ? fac.name : (row.facility || 'Company-wide'),
      activityValue: qty,
      activityUnit: row.unit || (isFuel ? 'L' : 'km'),
      ef,
      co2eKg: co2e
    }));
  });

  return { totalKg, lineage };
}

/**
 * Scope 2: Location-Based Calculation
 */
export function calculateScope2LB(entries = [], facilities = []) {
  let totalKg = 0;
  const lineage = [];

  entries.forEach(row => {
    const kwh = parseFloat(row.kwh) || 0;
    const ef = GHG_FACTOR_LIBRARY.grid_location[row.region] || GHG_FACTOR_LIBRARY.grid_location.global;
    const co2e = kwh * ef.value;
    totalKg += co2e;

    const fac = facilities.find(f => f.id === row.facility);
    lineage.push(createLineageEntry({
      scope: '2',
      category: 'location_based',
      method: 'grid_average',
      facilityId: row.facility,
      facilityName: fac ? fac.name : (row.facility || 'Company-wide'),
      activityValue: kwh,
      activityUnit: 'kWh',
      ef,
      co2eKg: co2e
    }));
  });

  return { totalKg, lineage };
}

/**
 * Scope 2: Market-Based Calculation
 */
export function calculateScope2MB(entries = [], facilities = []) {
  let totalKg = 0;
  const lineage = [];

  entries.forEach(row => {
    const kwh = parseFloat(row.kwh) || 0;
    let efObj;
    const instrument = row.instrument || 'residual';

    if (instrument === 'eac' || instrument === 'rec') {
      const efVal = parseFloat(row.efOverride) || 0;
      efObj = {
        value: efVal,
        unit: 'kgCO2e/kWh',
        source: 'Energy Attribute Certificate (EAC / REC attested)',
        version: '2024',
        tier: 1
      };
    } else if (instrument === 'ppa') {
      const efVal = parseFloat(row.efOverride) || 0;
      efObj = {
        value: efVal,
        unit: 'kgCO2e/kWh',
        source: 'Power Purchase Agreement (PPA contractual factor)',
        version: '2024',
        tier: 1
      };
    } else if (instrument === 'supplier') {
      const efVal = parseFloat(row.efOverride) || 0;
      efObj = {
        value: efVal,
        unit: 'kgCO2e/kWh',
        source: 'Supplier-Specific Tariff Disclosure',
        version: '2024',
        tier: 1
      };
    } else {
      // Residual Mix fallback
      efObj = GHG_FACTOR_LIBRARY.residual_mix.EU;
    }

    const co2e = kwh * efObj.value;
    totalKg += co2e;

    const fac = facilities.find(f => f.id === row.facility);
    lineage.push(createLineageEntry({
      scope: '2',
      category: 'market_based',
      method: `contractual_${instrument}`,
      facilityId: row.facility,
      facilityName: fac ? fac.name : (row.facility || 'Company-wide'),
      activityValue: kwh,
      activityUnit: 'kWh',
      ef: efObj,
      co2eKg: co2e
    }));
  });

  return { totalKg, lineage };
}

/**
 * Scope 3: Value Chain Calculation (Categories 1–15)
 */
export function calculateScope3(entries = []) {
  let totalKg = 0;
  const lineage = [];

  entries.forEach(row => {
    const val = parseFloat(row.value) || 0;
    const isSpend = row.method === 'spend_based';
    const cat = row.cat || 'cat1';
    const ef = isSpend
      ? (GHG_FACTOR_LIBRARY.scope3_spend[cat] || GHG_FACTOR_LIBRARY.scope3_spend.cat1)
      : (GHG_FACTOR_LIBRARY.scope3_activity[cat] || GHG_FACTOR_LIBRARY.scope3_activity.cat1);

    const co2e = val * ef.value;
    totalKg += co2e;

    lineage.push(createLineageEntry({
      scope: '3',
      category: cat,
      method: isSpend ? 'spend_based (USEEIO)' : 'activity_based (DEFRA)',
      facilityId: null,
      facilityName: 'Value Chain',
      activityValue: val,
      activityUnit: row.unit || (isSpend ? '$' : 'units'),
      ef,
      co2eKg: co2e
    }));
  });

  return { totalKg, lineage };
}

/**
 * Multi-Scope Full Corporate Calculation
 */
export function calculateCorporateGhg(period = {}, facilities = []) {
  const stationary = calculateStationary(period.stationary || [], facilities);
  const mobile = calculateMobile(period.mobile || [], facilities);
  const s2lb = calculateScope2LB(period.s2lb || [], facilities);
  const s2mb = calculateScope2MB(period.s2mb || [], facilities);
  const s3 = calculateScope3(period.s3 || []);

  const scope1Kg = stationary.totalKg + mobile.totalKg;
  const scope2lbKg = s2lb.totalKg;
  const scope2mbKg = s2mb.totalKg;
  const scope3Kg = s3.totalKg;

  const totalLbKg = scope1Kg + scope2lbKg + scope3Kg;
  const totalMbKg = scope1Kg + scope2mbKg + scope3Kg;

  const lineage = [
    ...stationary.lineage,
    ...mobile.lineage,
    ...s2lb.lineage,
    ...s2mb.lineage,
    ...s3.lineage
  ];

  // Facility Spatial Breakdown (Scope 1 & Scope 2)
  const facilityBreakdown = {};
  lineage.forEach(item => {
    if (item.scope === '3') return;
    const name = item.facility_name || 'Company-wide';
    if (!facilityBreakdown[name]) {
      facilityBreakdown[name] = { s1: 0, s2lb: 0, s2mb: 0, totalLb: 0, totalMb: 0 };
    }
    if (item.scope === '1') {
      facilityBreakdown[name].s1 += item.co2e_tonnes;
    } else if (item.scope === '2' && item.category === 'location_based') {
      facilityBreakdown[name].s2lb += item.co2e_tonnes;
    } else if (item.scope === '2' && item.category === 'market_based') {
      facilityBreakdown[name].s2mb += item.co2e_tonnes;
    }
    facilityBreakdown[name].totalLb = facilityBreakdown[name].s1 + facilityBreakdown[name].s2lb;
    facilityBreakdown[name].totalMb = facilityBreakdown[name].s1 + facilityBreakdown[name].s2mb;
  });

  return {
    results_kg: {
      scope1: Number(scope1Kg.toFixed(3)),
      scope2lb: Number(scope2lbKg.toFixed(3)),
      scope2mb: Number(scope2mbKg.toFixed(3)),
      scope3: Number(scope3Kg.toFixed(3)),
      totalLb: Number(totalLbKg.toFixed(3)),
      totalMb: Number(totalMbKg.toFixed(3))
    },
    results_tonnes: {
      scope1: Number((scope1Kg / 1000).toFixed(4)),
      scope2lb: Number((scope2lbKg / 1000).toFixed(4)),
      scope2mb: Number((scope2mbKg / 1000).toFixed(4)),
      scope3: Number((scope3Kg / 1000).toFixed(4)),
      totalLb: Number((totalLbKg / 1000).toFixed(4)),
      totalMb: Number((totalMbKg / 1000).toFixed(4))
    },
    lineage,
    facilityBreakdown
  };
}

/**
 * Export Lineage Audit to CSV
 */
export function exportLineageToCSV(lineage = [], periodLabel = 'FY2024') {
  const headers = [
    'Scope',
    'Category',
    'Method',
    'Facility Site',
    'Activity Quantity',
    'Activity Unit',
    'Emission Factor',
    'EF Unit',
    'EF Source',
    'EF Version',
    'EF Tier',
    'Emissions (kgCO2e)',
    'Emissions (tCO2e)',
    'Formula Applied',
    'Calculation Timestamp'
  ];

  const escapeCSV = (val) => {
    if (val == null) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const rows = lineage.map(l => [
    escapeCSV(l.scope),
    escapeCSV(l.category),
    escapeCSV(l.method),
    escapeCSV(l.facility_name),
    escapeCSV(l.activity_value),
    escapeCSV(l.activity_unit),
    escapeCSV(l.ef_value),
    escapeCSV(l.ef_unit),
    escapeCSV(l.ef_source),
    escapeCSV(l.ef_version),
    escapeCSV(l.ef_tier),
    escapeCSV(l.co2e_kg),
    escapeCSV(l.co2e_tonnes),
    escapeCSV(l.formula_applied),
    escapeCSV(l.timestamp)
  ].join(','));

  const csv = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NetZeroCalc_GHG_Audit_Lineage_${periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Export Workspace to Full JSON Schema v2.0.0
 */
export function exportWorkspaceToJson(workspace, activePeriodYear = '2024') {
  const payload = {
    schema_version: "2.0.0",
    engine: "NetZeroCalc-AI Enterprise Corporate GHG Engine",
    exported_at: new Date().toISOString(),
    gwp_standard: "IPCC AR6 (100-year)",
    facilities: workspace.facilities || [],
    reporting_periods: workspace.periods || [],
    active_period: activePeriodYear,
    disclosed_assumptions: [
      "Scope 1 stationary and mobile factors sourced from DEFRA 2024 and EPA.",
      "Scope 2 location-based factors sourced from CEA India Baseline v19 and national registries.",
      "Scope 2 market-based contractual instruments are user-attested.",
      "Scope 3 spend factors use US EPA USEEIO v2.1 economic input-output modeling."
    ]
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NetZeroCalc_Corporate_GHG_Workspace_${activePeriodYear}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
