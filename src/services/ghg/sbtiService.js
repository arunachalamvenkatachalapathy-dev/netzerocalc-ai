/**
 * NetZeroCalc-AI — SBTi Target Setting & Net-Zero 2050 Trajectory Service
 * Standards:
 * - SBTi Corporate Net-Zero Standard v1.2
 * - Absolute Contraction Approach (ACA) (1.5°C minimum: 4.2% linear/annual, WB2°C: 2.5%)
 * - Sectoral Decarbonization Approach (SDA) physical intensity convergence
 */

export const SECTOR_SDA_BENCHMARKS_2050 = {
  power: { name: 'Power Generation', unit: 'kgCO2e/MWh', benchmark2050: 0.015, defaultBase: 0.716 },
  cement: { name: 'Cement & Clinker', unit: 'tCO2e/t cement', benchmark2050: 0.120, defaultBase: 0.650 },
  steel: { name: 'Iron & Steel (Crude)', unit: 'tCO2e/t steel', benchmark2050: 0.200, defaultBase: 1.850 },
  real_estate: { name: 'Commercial Real Estate', unit: 'kgCO2e/m2/yr', benchmark2050: 5.0, defaultBase: 45.0 },
  aluminum: { name: 'Primary Aluminum', unit: 'tCO2e/t Al', benchmark2050: 1.500, defaultBase: 8.500 },
  transport: { name: 'Road Freight Logistics', unit: 'gCO2e/t-km', benchmark2050: 12.0, defaultBase: 113.0 }
};

/**
 * 1. Absolute Contraction Approach (ACA)
 * Formula: E(y) = E_base * (1 - r)^(y - y_base)
 */
export function calculateACA({
  baseYear = 2024,
  targetYear = 2030,
  annualRatePct = 4.2, // 4.2% for 1.5°C alignment
  baseEmissionsTonnes = 100.0
}) {
  const r = annualRatePct / 100;
  const years = Math.max(1, targetYear - baseYear);
  const trajectory = [];

  for (let y = baseYear; y <= targetYear; y++) {
    const elapsed = y - baseYear;
    const targetTonnes = baseEmissionsTonnes * Math.pow(1 - r, elapsed);
    const reductionFromBasePct = (1 - (targetTonnes / baseEmissionsTonnes)) * 100;

    trajectory.push({
      year: y,
      targetTonnes: Number(targetTonnes.toFixed(2)),
      reductionFromBasePct: Number(reductionFromBasePct.toFixed(1)),
      annualReductionRatePct: annualRatePct
    });
  }

  const finalTarget = trajectory[trajectory.length - 1];
  const cumulativeReductionPct = (1 - Math.pow(1 - r, years)) * 100;

  return {
    method: 'ACA',
    baseYear,
    targetYear,
    annualRatePct,
    baseEmissionsTonnes: Number(baseEmissionsTonnes.toFixed(2)),
    targetEmissionsTonnes: finalTarget.targetTonnes,
    cumulativeReductionPct: Number(cumulativeReductionPct.toFixed(1)),
    is15Aligned: annualRatePct >= 4.2,
    trajectory
  };
}

/**
 * 2. Sectoral Decarbonization Approach (SDA)
 * Formula: Intensity(y) = I_base - (I_base - I_2050) * min((y - y_base) / (y_conv - y_base), 1)
 */
export function calculateSDA({
  sector = 'power',
  baseYear = 2024,
  targetYear = 2030,
  convergenceYear = 2050,
  baseIntensity = null,
  benchmarkIntensity = null,
  projectedOutput = 100000 // e.g. 100,000 MWh or tonnes
}) {
  const sectorMeta = SECTOR_SDA_BENCHMARKS_2050[sector] || SECTOR_SDA_BENCHMARKS_2050.power;
  const bIntensity = baseIntensity != null ? Number(baseIntensity) : sectorMeta.defaultBase;
  const targetBenchmark = benchmarkIntensity != null ? Number(benchmarkIntensity) : sectorMeta.benchmark2050;

  const totalConvYears = Math.max(1, convergenceYear - baseYear);
  const trajectory = [];

  for (let y = baseYear; y <= Math.max(targetYear, convergenceYear); y += Math.max(1, Math.round((convergenceYear - baseYear) / 10))) {
    const elapsed = y - baseYear;
    const fraction = Math.min(elapsed / totalConvYears, 1.0);
    const intensity = bIntensity - (bIntensity - targetBenchmark) * fraction;
    const absoluteTonnes = (intensity * projectedOutput) / 1000;

    trajectory.push({
      year: y,
      intensity: Number(intensity.toFixed(4)),
      absoluteTonnes: Number(absoluteTonnes.toFixed(2)),
      reductionPct: Number(((1 - intensity / bIntensity) * 100).toFixed(1))
    });

    if (y >= targetYear && y >= convergenceYear) break;
  }

  // Exact target year calculation
  const targetFraction = Math.min((targetYear - baseYear) / totalConvYears, 1.0);
  const targetYearIntensity = bIntensity - (bIntensity - targetBenchmark) * targetFraction;
  const targetAbsoluteTonnes = (targetYearIntensity * projectedOutput) / 1000;

  return {
    method: 'SDA',
    sector: sectorMeta.name,
    unit: sectorMeta.unit,
    baseYear,
    targetYear,
    convergenceYear,
    baseIntensity: Number(bIntensity.toFixed(4)),
    targetYearIntensity: Number(targetYearIntensity.toFixed(4)),
    benchmarkIntensity: Number(targetBenchmark.toFixed(4)),
    projectedOutput: Number(projectedOutput),
    targetAbsoluteTonnes: Number(targetAbsoluteTonnes.toFixed(2)),
    intensityReductionPct: Number(((1 - targetYearIntensity / bIntensity) * 100).toFixed(1)),
    trajectory
  };
}

/**
 * 3. Net-Zero Trajectory & Residual Neutralization (SBTi Standard v1.2)
 * Formula: LongTermTarget = BaseEmissions * (1 - floorPct)
 * Rate r = 1 - (LongTermTarget / BaseEmissions)^(1 / (y_netzero - y_base))
 */
export function calculateNetZeroTrajectory({
  baseYear = 2024,
  netZeroYear = 2050,
  abatementFloorPct = 90.0, // Minimum 90% direct abatement required by SBTi
  baseEmissionsTonnes = 100.0
}) {
  const floor = abatementFloorPct / 100;
  const residualTonnes = baseEmissionsTonnes * (1 - floor);
  const years = Math.max(1, netZeroYear - baseYear);
  const r = 1 - Math.pow(residualTonnes / baseEmissionsTonnes, 1 / years);
  const annualRatePct = Number((r * 100).toFixed(2));

  const trajectory = [];
  const step = Math.max(1, Math.round(years / 10));

  for (let y = baseYear; y <= netZeroYear; y += step) {
    const elapsed = y - baseYear;
    const targetTonnes = baseEmissionsTonnes * Math.pow(1 - r, elapsed);
    trajectory.push({
      year: y,
      targetTonnes: Number(targetTonnes.toFixed(2)),
      abatementPct: Number(((1 - (targetTonnes / baseEmissionsTonnes)) * 100).toFixed(1))
    });
  }

  // Ensure exact net zero year is present in trajectory
  if (trajectory[trajectory.length - 1].year !== netZeroYear) {
    trajectory.push({
      year: netZeroYear,
      targetTonnes: Number(residualTonnes.toFixed(2)),
      abatementPct: abatementFloorPct
    });
  }

  return {
    method: 'NetZero2050',
    baseYear,
    netZeroYear,
    abatementFloorPct,
    baseEmissionsTonnes: Number(baseEmissionsTonnes.toFixed(2)),
    residualEmissionsTonnes: Number(residualTonnes.toFixed(2)),
    impliedAnnualRatePct: annualRatePct,
    neutralizationRequirement: "Must be neutralized 1:1 with permanent carbon removals (durable geological or mineralization storage > 100 yrs), not interim avoidance offsets.",
    trajectory
  };
}

/**
 * Generate SVG Coordinate Geometry for SBTi Trajectory Chart
 */
export function buildSbtiChartGeometry({
  historicalPoints = [], // [{ year, tonnes }]
  targetTrajectory = [],  // [{ year, targetTonnes }]
  width = 620,
  height = 240,
  padding = { top: 25, right: 30, bottom: 35, left: 55 }
}) {
  const allYears = [
    ...historicalPoints.map(p => p.year),
    ...targetTrajectory.map(p => p.year)
  ];
  const minYear = Math.min(...allYears, 2023);
  const maxYear = Math.max(...allYears, 2050);

  const allTonnes = [
    ...historicalPoints.map(p => p.tonnes),
    ...targetTrajectory.map(p => p.targetTonnes)
  ];
  const maxT = Math.max(...allTonnes, 1) * 1.15;
  const minT = 0;

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const getX = (year) => padding.left + ((year - minYear) / (maxYear - minYear || 1)) * innerW;
  const getY = (t) => padding.top + innerH - ((t - minT) / (maxT - minT || 1)) * innerH;

  // Grid Ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1.0].map(f => {
    const val = minT + (maxT - minT) * f;
    return {
      value: Number(val.toFixed(1)),
      y: Number(getY(val).toFixed(1))
    };
  });

  // Year Labels (sample 5 milestones)
  const milestoneYears = [];
  const yearStep = Math.max(1, Math.round((maxYear - minYear) / 5));
  for (let y = minYear; y <= maxYear; y += yearStep) {
    milestoneYears.push(y);
  }
  if (!milestoneYears.includes(maxYear)) milestoneYears.push(maxYear);

  const xLabels = milestoneYears.map(y => ({
    year: y,
    x: Number(getX(y).toFixed(1)),
    y: height - 10
  }));

  // Historical Polyline
  const histPoints = historicalPoints.map(p => ({
    year: p.year,
    x: Number(getX(p.year).toFixed(1)),
    y: Number(getY(p.tonnes).toFixed(1)),
    tonnes: p.tonnes
  }));
  const histPolyline = histPoints.map(pt => `${pt.x},${pt.y}`).join(' ');

  // Target Trajectory Polyline
  const targetPoints = targetTrajectory.map(p => ({
    year: p.year,
    x: Number(getX(p.year).toFixed(1)),
    y: Number(getY(p.targetTonnes).toFixed(1)),
    targetTonnes: p.targetTonnes
  }));
  const targetPolyline = targetPoints.map(pt => `${pt.x},${pt.y}`).join(' ');

  return {
    width,
    height,
    padding,
    ticks,
    xLabels,
    histPoints,
    histPolyline,
    targetPoints,
    targetPolyline,
    maxT: Number(maxT.toFixed(1)),
    minYear,
    maxYear
  };
}
