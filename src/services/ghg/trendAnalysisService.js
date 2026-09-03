import { calculateCorporateGhg } from './calculationEngine.js';

/**
 * Extract sorted periods with non-zero calculated emissions
 */
export function extractCalculatedPeriods(periodsMap = {}, facilities = []) {
  const periodEntries = Object.entries(periodsMap);
  const calculatedList = [];

  periodEntries.forEach(([yearKey, pData]) => {
    const calc = calculateCorporateGhg(pData, facilities);
    const totalLb = calc.results_tonnes.totalLb;
    const totalMb = calc.results_tonnes.totalMb;

    if (totalLb > 0 || totalMb > 0) {
      calculatedList.push({
        year: parseInt(yearKey) || parseInt(pData.year) || 2024,
        label: `FY${yearKey}`,
        data: pData,
        results_tonnes: calc.results_tonnes,
        results_kg: calc.results_kg
      });
    }
  });

  // Sort chronologically ascending
  return calculatedList.sort((a, b) => a.year - b.year);
}

/**
 * Compute Year-on-Year (YoY) metrics between consecutive periods
 */
export function computeYoYMetrics(periods = []) {
  if (periods.length < 2) return [];

  const yoyList = [];
  for (let i = 1; i < periods.length; i++) {
    const prev = periods[i - 1];
    const curr = periods[i];

    const prevLb = prev.results_tonnes.totalLb;
    const currLb = curr.results_tonnes.totalLb;
    const diffLb = currLb - prevLb;
    const pctChangeLb = prevLb > 0 ? (diffLb / prevLb) * 100 : 0;

    const prevS1 = prev.results_tonnes.scope1;
    const currS1 = curr.results_tonnes.scope1;
    const diffS1 = currS1 - prevS1;
    const pctChangeS1 = prevS1 > 0 ? (diffS1 / prevS1) * 100 : 0;

    const prevS2lb = prev.results_tonnes.scope2lb;
    const currS2lb = curr.results_tonnes.scope2lb;
    const diffS2lb = currS2lb - prevS2lb;
    const pctChangeS2lb = prevS2lb > 0 ? (diffS2lb / prevS2lb) * 100 : 0;

    const prevS3 = prev.results_tonnes.scope3;
    const currS3 = curr.results_tonnes.scope3;
    const diffS3 = currS3 - prevS3;
    const pctChangeS3 = prevS3 > 0 ? (diffS3 / prevS3) * 100 : 0;

    // Scope 1 + 2 combined for SBTi target evaluation
    const prevS12 = prevS1 + prevS2lb;
    const currS12 = currS1 + currS2lb;
    const diffS12 = currS12 - prevS12;
    const pctChangeS12 = prevS12 > 0 ? (diffS12 / prevS12) * 100 : 0;

    // SBTi 1.5°C Cross-Sector Requirement: -4.2% annual linear reduction
    const isSbti15Aligned = pctChangeS12 <= -4.2;

    yoyList.push({
      fromYear: prev.year,
      toYear: curr.year,
      label: `${prev.year} → ${curr.year}`,
      totalLb: {
        prev: prevLb,
        curr: currLb,
        diff: Number(diffLb.toFixed(3)),
        pctChange: Number(pctChangeLb.toFixed(2)),
        isReduction: diffLb <= 0
      },
      scope1: {
        prev: prevS1,
        curr: currS1,
        diff: Number(diffS1.toFixed(3)),
        pctChange: Number(pctChangeS1.toFixed(2)),
        isReduction: diffS1 <= 0
      },
      scope2lb: {
        prev: prevS2lb,
        curr: currS2lb,
        diff: Number(diffS2lb.toFixed(3)),
        pctChange: Number(pctChangeS2lb.toFixed(2)),
        isReduction: diffS2lb <= 0
      },
      scope3: {
        prev: prevS3,
        curr: currS3,
        diff: Number(diffS3.toFixed(3)),
        pctChange: Number(pctChangeS3.toFixed(2)),
        isReduction: diffS3 <= 0
      },
      sbtiScope12: {
        prev: prevS12,
        curr: currS12,
        diff: Number(diffS12.toFixed(3)),
        pctChange: Number(pctChangeS12.toFixed(2)),
        targetPace: -4.2,
        isAligned: isSbti15Aligned,
        gap: Number((pctChangeS12 - (-4.2)).toFixed(2)) // positive = gap to close, negative = ahead of target
      }
    });
  }

  return yoyList;
}

/**
 * Generate SVG Coordinate Geometry for Multi-Series Line Chart
 */
export function buildSvgLineChartGeometry({
  labels = [],
  series = [],
  width = 620,
  height = 240,
  padding = { top: 20, right: 25, bottom: 35, left: 55 }
}) {
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allVals = series.flatMap(s => s.data);
  const maxV = (Math.max(...allVals, 1)) * 1.15;
  const minV = 0;

  const xStep = labels.length > 1 ? innerW / (labels.length - 1) : 0;
  const getX = (idx) => padding.left + idx * xStep;
  const getY = (val) => padding.top + innerH - ((val - minV) / (maxV - minV || 1)) * innerH;

  // Grid tick levels
  const ticks = [0, 0.25, 0.5, 0.75, 1.0].map(fraction => {
    const val = minV + (maxV - minV) * fraction;
    const y = getY(val);
    return {
      value: Number(val.toFixed(1)),
      y: Number(y.toFixed(1))
    };
  });

  // Series points and paths
  const seriesGeometries = series.map(s => {
    const points = s.data.map((v, i) => ({
      x: Number(getX(i).toFixed(1)),
      y: Number(getY(v).toFixed(1)),
      value: Number(v.toFixed(2)),
      label: labels[i]
    }));

    const polylineStr = points.map(pt => `${pt.x},${pt.y}`).join(' ');

    return {
      name: s.name,
      color: s.color,
      points,
      polylineStr
    };
  });

  const xLabels = labels.map((label, idx) => ({
    label,
    x: Number(getX(idx).toFixed(1)),
    y: height - 10
  }));

  return {
    width,
    height,
    padding,
    innerW,
    innerH,
    ticks,
    xLabels,
    seriesGeometries,
    maxVal: Number(maxV.toFixed(1))
  };
}

/**
 * Generate SVG Arc Data for Scope Donut Chart
 */
export function buildSvgDonutGeometry({
  s1 = 0,
  s2 = 0,
  s3 = 0,
  radius = 65,
  strokeWidth = 24,
  cx = 100,
  cy = 100
}) {
  const total = s1 + s2 + s3;
  if (total <= 0) {
    return { total: 0, segments: [] };
  }

  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const rawSegments = [
    { name: 'Scope 1', value: s1, color: '#f59e0b' },
    { name: 'Scope 2', value: s2, color: '#3b82f6' },
    { name: 'Scope 3', value: s3, color: '#a855f7' }
  ];

  const segments = rawSegments.map(seg => {
    const fraction = seg.value / total;
    const strokeDash = fraction * circumference;
    const strokeGap = circumference - strokeDash;
    const dashOffset = -accumulatedOffset;
    accumulatedOffset += strokeDash;

    return {
      name: seg.name,
      value: Number(seg.value.toFixed(2)),
      percentage: Number((fraction * 100).toFixed(1)),
      color: seg.color,
      strokeDasharray: `${strokeDash.toFixed(2)} ${strokeGap.toFixed(2)}`,
      strokeDashoffset: dashOffset.toFixed(2)
    };
  });

  return {
    total: Number(total.toFixed(2)),
    radius,
    strokeWidth,
    cx,
    cy,
    circumference,
    segments
  };
}
