import { describe, test, expect } from 'bun:test';
import {
  extractCalculatedPeriods,
  computeYoYMetrics,
  buildSvgLineChartGeometry,
  buildSvgDonutGeometry
} from '../../src/services/ghg/trendAnalysisService.js';

describe('Multi-Year Emissions Trends & YoY Trajectory Engine (Part 3)', () => {

  const sampleFacilities = [
    { id: 'fac_1', name: 'Plant North', region: 'IN' }
  ];

  const samplePeriodsMap = {
    '2023': {
      year: 2023,
      stationary: [{ id: 's1', fuel: 'natural_gas', qty: 60000, unit: 'kWh_gross' }], // 10.9896 t
      mobile: [{ id: 'm1', method: 'fuel', fueltype: 'diesel', qty: 2000, unit: 'L' }], // 5.37574 t
      s2lb: [{ id: 's2', region: 'IN', kwh: 120000, year: 2023 }], // 85.92 t
      s2mb: [{ id: 's2m', instrument: 'residual', kwh: 120000 }], // 48.0 t
      s3: [{ id: 's3', cat: 'cat1', method: 'spend_based', value: 50000, unit: '$' }] // 21.0 t
    },
    '2024': {
      year: 2024,
      stationary: [{ id: 's1_24', fuel: 'natural_gas', qty: 50000, unit: 'kWh_gross' }], // 9.158 t
      mobile: [{ id: 'm1_24', method: 'fuel', fueltype: 'diesel', qty: 1500, unit: 'L' }], // 4.0318 t
      s2lb: [{ id: 's2_24', region: 'IN', kwh: 100000, year: 2024 }], // 71.60 t
      s2mb: [{ id: 's2m_24', instrument: 'eac', kwh: 100000, efOverride: 0 }], // 0 t
      s3: [{ id: 's3_24', cat: 'cat1', method: 'spend_based', value: 45000, unit: '$' }] // 18.9 t
    }
  };

  test('extracts and orders periods chronologically', () => {
    const periods = extractCalculatedPeriods(samplePeriodsMap, sampleFacilities);
    expect(periods.length).toBe(2);
    expect(periods[0].year).toBe(2023);
    expect(periods[1].year).toBe(2024);
    expect(periods[0].results_tonnes.totalLb).toBeGreaterThan(0);
    expect(periods[1].results_tonnes.totalLb).toBeGreaterThan(0);
  });

  test('computes Year-on-Year absolute and percentage delta variances', () => {
    const periods = extractCalculatedPeriods(samplePeriodsMap, sampleFacilities);
    const yoy = computeYoYMetrics(periods);

    expect(yoy.length).toBe(1);
    const metric = yoy[0];
    expect(metric.fromYear).toBe(2023);
    expect(metric.toYear).toBe(2024);

    // Total Location-Based: 2023 was higher than 2024 -> reduction
    expect(metric.totalLb.diff).toBeLessThan(0);
    expect(metric.totalLb.pctChange).toBeLessThan(0);
    expect(metric.totalLb.isReduction).toBe(true);

    // Scope 1: 2023 was ~16.36t, 2024 is ~13.19t -> reduction
    expect(metric.scope1.isReduction).toBe(true);

    // Scope 2 LB: 2023 was 85.92t, 2024 is 71.60t -> reduction
    expect(metric.scope2lb.isReduction).toBe(true);
  });

  test('evaluates SBTi 1.5°C annual reduction pace (-4.2%/yr)', () => {
    const periods = extractCalculatedPeriods(samplePeriodsMap, sampleFacilities);
    const yoy = computeYoYMetrics(periods);
    const metric = yoy[0];

    // Scope 1+2 combined in 2023: 16.365 + 85.92 = 102.285 t
    // Scope 1+2 combined in 2024: 13.190 + 71.60 = 84.790 t
    // Reduction = (84.790 - 102.285) / 102.285 = -17.1%
    // Because -17.1% is steeper than -4.2%, it is SBTi aligned!
    expect(metric.sbtiScope12.pctChange).toBeLessThan(-4.2);
    expect(metric.sbtiScope12.isAligned).toBe(true);
    expect(metric.sbtiScope12.gap).toBeLessThanOrEqual(0);
  });

  test('generates valid SVG line chart coordinate geometry', () => {
    const labels = ['FY2023', 'FY2024'];
    const series = [
      { name: 'Total', color: '#10b981', data: [120.5, 98.2] },
      { name: 'Scope 1', color: '#f59e0b', data: [25.0, 18.0] }
    ];

    const geom = buildSvgLineChartGeometry({ labels, series, width: 600, height: 250 });
    expect(geom.ticks.length).toBe(5);
    expect(geom.xLabels.length).toBe(2);
    expect(geom.seriesGeometries.length).toBe(2);
    expect(geom.seriesGeometries[0].polylineStr).toContain(',');
    expect(geom.seriesGeometries[0].points.length).toBe(2);
  });

  test('generates valid SVG donut chart arc segments summing to 100%', () => {
    const donut = buildSvgDonutGeometry({ s1: 20, s2: 30, s3: 50 });
    expect(donut.total).toBe(100);
    expect(donut.segments.length).toBe(3);

    const sumPct = donut.segments.reduce((acc, s) => acc + s.percentage, 0);
    expect(sumPct).toBeCloseTo(100, 0);
    expect(donut.segments[0].color).toBe('#f59e0b');
    expect(donut.segments[1].color).toBe('#3b82f6');
    expect(donut.segments[2].color).toBe('#a855f7');
  });

});
