import { describe, test, expect } from 'bun:test';
import {
  GHG_FACTOR_LIBRARY,
  SCOPE3_CATEGORY_NAMES
} from '../../src/data/ghgFactorLibrary.js';
import {
  calculateStationary,
  calculateMobile,
  calculateScope2LB,
  calculateScope2MB,
  calculateScope3,
  calculateCorporateGhg
} from '../../src/services/ghg/calculationEngine.js';

describe('Corporate GHG Multi-Scope Calculation Engine (Part 2)', () => {

  const sampleFacilities = [
    { id: 'fac_1', name: 'Plant North (Gujarat)', region: 'IN' },
    { id: 'fac_2', name: 'R&D Center (Munich)', region: 'EU' }
  ];

  test('calculates Scope 1 stationary combustion with DEFRA and IPCC factors', () => {
    const entries = [
      { id: '1', facility: 'fac_1', fuel: 'natural_gas', qty: 10000, unit: 'kWh_gross' },
      { id: '2', facility: 'fac_1', fuel: 'diesel', qty: 1000, unit: 'L' }
    ];

    const res = calculateStationary(entries, sampleFacilities);
    // 10000 * 0.18316 = 1831.6 kg
    // 1000 * 2.68787 = 2687.87 kg
    // Total = 4519.47 kg
    expect(res.totalKg).toBeCloseTo(4519.47, 1);
    expect(res.lineage.length).toBe(2);
    expect(res.lineage[0].formula_applied).toContain('10000 kWh_gross × 0.18316 kgCO2e/kWh_gross');
    expect(res.lineage[0].facility_name).toBe('Plant North (Gujarat)');
  });

  test('calculates Scope 1 mobile combustion across fuel and distance tiers', () => {
    const entries = [
      { id: 'm1', facility: 'fac_1', method: 'fuel', fueltype: 'diesel', qty: 500, unit: 'L' },
      { id: 'm2', facility: 'fac_2', method: 'distance', fueltype: 'car_avg', qty: 10000, unit: 'km' }
    ];

    const res = calculateMobile(entries, sampleFacilities);
    // 500 * 2.68787 = 1343.935 kg
    // 10000 * 0.168 = 1680 kg
    // Total = 3023.935 kg
    expect(res.totalKg).toBeCloseTo(3023.935, 1);
    expect(res.lineage.length).toBe(2);
    expect(res.lineage[1].ef_tier).toBe(3);
  });

  test('calculates Scope 2 location-based emissions with CEA India grid and global grids', () => {
    const entries = [
      { id: 's2_in', facility: 'fac_1', region: 'IN', kwh: 100000 },
      { id: 's2_eu', facility: 'fac_2', region: 'EU', kwh: 50000 }
    ];

    const res = calculateScope2LB(entries, sampleFacilities);
    // 100000 * 0.716 = 71600 kg
    // 50000 * 0.230 = 11500 kg
    // Total = 83100 kg = 83.1 tCO2e
    expect(res.totalKg).toBeCloseTo(83100, 0);
    expect(res.lineage.length).toBe(2);
    expect(res.lineage[0].ef_source).toContain('CEA India');
  });

  test('calculates Scope 2 market-based dual-reporting with contractual EACs and residual mix', () => {
    const entries = [
      { id: 'mb_eac', facility: 'fac_1', instrument: 'eac', kwh: 50000, efOverride: 0 },
      { id: 'mb_res', facility: 'fac_1', instrument: 'residual', kwh: 50000 },
      { id: 'mb_sup', facility: 'fac_2', instrument: 'supplier', kwh: 50000, efOverride: 0.10 }
    ];

    const res = calculateScope2MB(entries, sampleFacilities);
    // EAC: 50000 * 0 = 0 kg
    // Residual: 50000 * 0.40 = 20000 kg
    // Supplier: 50000 * 0.10 = 5000 kg
    // Total = 25000 kg = 25 tCO2e
    expect(res.totalKg).toBeCloseTo(25000, 0);
    expect(res.lineage.length).toBe(3);
    expect(res.lineage[0].co2e_kg).toBe(0);
  });

  test('calculates Scope 3 value chain across activity-based and spend-based methods', () => {
    const entries = [
      { id: 's3_1', cat: 'cat1', method: 'spend_based', value: 10000, unit: '$' },
      { id: 's3_4', cat: 'cat4', method: 'activity_based', value: 100000, unit: 'tonne-km' }
    ];

    const res = calculateScope3(entries);
    // Cat 1 spend: 10000 * 0.42 = 4200 kg
    // Cat 4 activity: 100000 * 0.000113 = 11.3 kg
    expect(res.totalKg).toBeCloseTo(4211.3, 1);
    expect(res.lineage.length).toBe(2);
  });

  test('executes complete multi-scope corporate inventory with spatial facility breakdown', () => {
    const period = {
      year: 2024,
      stationary: [
        { id: '1', facility: 'fac_1', fuel: 'natural_gas', qty: 10000, unit: 'kWh_gross' } // 1.8316 t
      ],
      mobile: [
        { id: '2', facility: 'fac_2', method: 'distance', fueltype: 'car_avg', qty: 10000, unit: 'km' } // 1.68 t
      ],
      s2lb: [
        { id: '3', facility: 'fac_1', region: 'IN', kwh: 100000 } // 71.6 t
      ],
      s2mb: [
        { id: '4', facility: 'fac_1', instrument: 'eac', kwh: 100000, efOverride: 0 } // 0 t
      ],
      s3: [
        { id: '5', cat: 'cat1', method: 'spend_based', value: 10000, unit: '$' } // 4.2 t
      ]
    };

    const res = calculateCorporateGhg(period, sampleFacilities);

    // Scope 1 = 1.8316 + 1.68 = 3.5116 tCO2e
    expect(res.results_tonnes.scope1).toBeCloseTo(3.5116, 2);
    // Scope 2 LB = 71.6 tCO2e
    expect(res.results_tonnes.scope2lb).toBeCloseTo(71.6, 1);
    // Scope 2 MB = 0 tCO2e
    expect(res.results_tonnes.scope2mb).toBeCloseTo(0, 1);
    // Scope 3 = 4.2 tCO2e
    expect(res.results_tonnes.scope3).toBeCloseTo(4.2, 1);

    // Total LB = 3.5116 + 71.6 + 4.2 = 79.3116 tCO2e
    expect(res.results_tonnes.totalLb).toBeCloseTo(79.3116, 1);
    // Total MB = 3.5116 + 0 + 4.2 = 7.7116 tCO2e
    expect(res.results_tonnes.totalMb).toBeCloseTo(7.7116, 1);

    // Facility spatial breakdown verification
    expect(res.facilityBreakdown['Plant North (Gujarat)']).toBeDefined();
    expect(res.facilityBreakdown['R&D Center (Munich)']).toBeDefined();
    expect(res.facilityBreakdown['Plant North (Gujarat)'].s1).toBeCloseTo(1.8316, 2);
    expect(res.facilityBreakdown['Plant North (Gujarat)'].s2lb).toBeCloseTo(71.6, 1);
    expect(res.facilityBreakdown['R&D Center (Munich)'].s1).toBeCloseTo(1.68, 2);

    // Full lineage count
    expect(res.lineage.length).toBe(5);
  });
});
