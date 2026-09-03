import { describe, test, expect } from 'bun:test';
import {
  calculateACA,
  calculateSDA,
  calculateNetZeroTrajectory,
  buildSbtiChartGeometry,
  SECTOR_SDA_BENCHMARKS_2050
} from '../../src/services/ghg/sbtiService.js';

describe('SBTi Target Setting & Net Zero Trajectory Simulator (Part 4)', () => {

  test('calculates 1.5°C Absolute Contraction (ACA) target pathway at 4.2%/yr', () => {
    const res = calculateACA({
      baseYear: 2024,
      targetYear: 2030,
      annualRatePct: 4.2,
      baseEmissionsTonnes: 1000.0
    });

    expect(res.method).toBe('ACA');
    expect(res.is15Aligned).toBe(true);
    expect(res.baseYear).toBe(2024);
    expect(res.targetYear).toBe(2030);

    // 6 years: 1000 * (1 - 0.042)^6 = 773.02 tCO2e
    // Reduction = (1000 - 773.02) / 1000 = ~22.7%
    expect(res.targetEmissionsTonnes).toBeCloseTo(773.02, 1);
    expect(res.cumulativeReductionPct).toBeCloseTo(22.7, 1);
    expect(res.trajectory.length).toBe(7); // 2024 to 2030
  });

  test('flags sub-1.5°C pathways as not aligned with SBTi mandatory minimum', () => {
    const res = calculateACA({
      baseYear: 2024,
      targetYear: 2030,
      annualRatePct: 2.5, // Well-Below 2°C legacy rate
      baseEmissionsTonnes: 1000.0
    });

    expect(res.is15Aligned).toBe(false);
    expect(res.cumulativeReductionPct).toBeLessThan(20.0);
  });

  test('calculates Sectoral Decarbonization Approach (SDA) physical intensity convergence', () => {
    const res = calculateSDA({
      sector: 'power',
      baseYear: 2024,
      targetYear: 2030,
      convergenceYear: 2050,
      baseIntensity: 0.716, // CEA India grid baseline (kgCO2e/MWh)
      benchmarkIntensity: 0.015, // 2050 IEA NZE benchmark
      projectedOutput: 50000 // 50,000 MWh
    });

    expect(res.method).toBe('SDA');
    expect(res.sector).toBe('Power Generation');
    expect(res.baseYear).toBe(2024);
    expect(res.targetYear).toBe(2030);

    // Convergence fraction over 26 years (2024 to 2050): 6 / 26 = 0.230769
    // Expected intensity in 2030: 0.716 - (0.716 - 0.015) * 0.230769 = 0.5542 kgCO2e/MWh
    expect(res.targetYearIntensity).toBeCloseTo(0.5542, 2);
    expect(res.intensityReductionPct).toBeGreaterThan(20.0);
    // Absolute target: 0.5542 * 50,000 / 1000 = ~27.71 tCO2e
    expect(res.targetAbsoluteTonnes).toBeCloseTo(27.71, 1);
  });

  test('calculates Net-Zero 2050 trajectory with 90% direct abatement floor and residual budget', () => {
    const res = calculateNetZeroTrajectory({
      baseYear: 2024,
      netZeroYear: 2050,
      abatementFloorPct: 90.0,
      baseEmissionsTonnes: 1000.0
    });

    expect(res.method).toBe('NetZero2050');
    expect(res.netZeroYear).toBe(2050);
    expect(res.abatementFloorPct).toBe(90.0);

    // Residual emissions at Net Zero year: 10% of 1000 = 100 tCO2e
    expect(res.residualEmissionsTonnes).toBeCloseTo(100.0, 1);
    // Implied annual exponential reduction rate over 26 years: 1 - (100/1000)^(1/26) = ~8.47%/yr
    expect(res.impliedAnnualRatePct).toBeCloseTo(8.47, 1);
    expect(res.neutralizationRequirement).toContain('permanent carbon removals');
    expect(res.trajectory.length).toBeGreaterThan(5);
  });

  test('builds valid SVG trajectory curve coordinate geometry', () => {
    const hist = [
      { year: 2023, tonnes: 1100 },
      { year: 2024, tonnes: 1000 }
    ];
    const traj = [
      { year: 2024, targetTonnes: 1000 },
      { year: 2030, targetTonnes: 772 }
    ];

    const geom = buildSbtiChartGeometry({
      historicalPoints: hist,
      targetTrajectory: traj,
      width: 600,
      height: 250
    });

    expect(geom.ticks.length).toBe(5);
    expect(geom.histPoints.length).toBe(2);
    expect(geom.targetPoints.length).toBe(2);
    expect(geom.histPolyline).toContain(',');
    expect(geom.targetPolyline).toContain(',');
  });

});
