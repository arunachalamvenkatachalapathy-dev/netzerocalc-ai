import { describe, test, expect } from 'bun:test';
import {
  evaluateDoubleMateriality,
  calculateCsrdProgress,
  evaluateCsrdPeerBenchmark,
  STANDARDS_ORDER,
  STANDARD_NAMES,
  DANISH_BENCHMARK_PILLARS
} from '../../src/services/csrd/csrdService.js';
import { CSRD_DATAPOINTS } from '../../src/data/csrdDatapoints.js';

describe('CSRD Double Materiality & ESRS Benchmark Engine (Part 6)', () => {

  test('verifies complete 325 post-Omnibus datapoint clusters across all 11 standards', () => {
    expect(CSRD_DATAPOINTS.length).toBe(325);
    expect(STANDARDS_ORDER.length).toBe(11);

    // Verify every standard in STANDARDS_ORDER has clusters in the dataset
    STANDARDS_ORDER.forEach(std => {
      const count = CSRD_DATAPOINTS.filter(d => d.std === std).length;
      expect(count).toBeGreaterThan(0);
      expect(STANDARD_NAMES[std]).toBeDefined();
    });

    // ESRS 2 should have 61 clusters, E1 has 49 clusters
    const esrs2Count = CSRD_DATAPOINTS.filter(d => d.std === 'ESRS 2').length;
    const e1Count = CSRD_DATAPOINTS.filter(d => d.std === 'E1').length;
    expect(esrs2Count).toBe(61);
    expect(e1Count).toBe(49);
  });

  test('evaluates double materiality decision logic (Impact >= 3 OR Financial >= 3)', () => {
    // Both low: Not Material
    const low = evaluateDoubleMateriality(2, 2);
    expect(low.isMaterial).toBe(false);
    expect(low.materialityStatus).toBe('notmaterial');

    // Impact high, Financial low: Material (Impact Material)
    const impactOnly = evaluateDoubleMateriality(4, 2);
    expect(impactOnly.isMaterial).toBe(true);
    expect(impactOnly.materialityStatus).toBe('material');
    expect(impactOnly.rationale).toContain('Impact Material');

    // Financial high, Impact low: Material (Financial Material)
    const financialOnly = evaluateDoubleMateriality(1, 4);
    expect(financialOnly.isMaterial).toBe(true);
    expect(financialOnly.materialityStatus).toBe('material');
    expect(financialOnly.rationale).toContain('Financial Material');

    // Both high: Double Material
    const doubleMat = evaluateDoubleMateriality(5, 5);
    expect(doubleMat.isMaterial).toBe(true);
    expect(doubleMat.rationale).toContain('Double Material');

    // Phase-in relief
    const phaseIn = evaluateDoubleMateriality(4, 4, true);
    expect(phaseIn.isMaterial).toBe(true);
    expect(phaseIn.materialityStatus).toBe('phasein');
  });

  test('computes CSRD progress, non-phaseable mandatory counts, and CSDDD duplicates', () => {
    const materialityMap = {
      'E1': 'material',
      'S1': 'material'
    };

    const mockResponses = {
      0: { status: 'complete', narrative: 'Compliant' },
      1: { status: 'complete', quantValue: '100' },
      2: { status: 'inprogress', narrative: 'Drafting' }
    };

    const progress = calculateCsrdProgress(materialityMap, mockResponses);

    // ESRS 2 (always) + E1 + S1 = 3 material standards
    expect(progress.totalMaterialStandards).toBe(3);
    expect(progress.totalMaterialDatapoints).toBeGreaterThan(100);
    expect(progress.completedDatapoints).toBe(2);
    expect(progress.inProgressDatapoints).toBe(1);
    expect(progress.nonPhaseableTotal).toBeGreaterThan(0);
    expect(progress.csdddDirectDuplicates).toBeGreaterThan(0);
    expect(progress.standardsBreakdown.length).toBe(11);
  });

  test('benchmarks company readiness against Danish Global Brands peer average (4.0/5.0)', () => {
    // Benchmark user scores matching the peer average exactly
    const userScores = {
      gov: 4.2,
      strategy: 3.8,
      decarb: 4.5,
      nature: 3.4,
      value_chain: 3.9
    };

    const bench = evaluateCsrdPeerBenchmark(userScores);
    expect(bench.avgCompanyScore).toBe(4.0);
    expect(bench.avgPeerScore).toBe(4.0);
    expect(bench.overallGap).toBe(0.0);
    expect(bench.statusBadge).toBe('Competitive');
    expect(bench.pillars.length).toBe(5);

    // Top leader scoring (>= 4.4)
    const leaderScores = {
      gov: 4.8,
      strategy: 4.6,
      decarb: 5.0,
      nature: 4.2,
      value_chain: 4.6
    };
    const topBench = evaluateCsrdPeerBenchmark(leaderScores);
    expect(topBench.avgCompanyScore).toBeGreaterThanOrEqual(4.4);
    expect(topBench.statusBadge).toBe('Top Quartile Leader');
  });

});
