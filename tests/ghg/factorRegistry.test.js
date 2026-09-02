import { describe, it, expect } from 'bun:test';
import { 
  DEFAULT_EMISSION_FACTORS,
  getAllEmissionFactors,
  getFactorById,
  createCustomEmissionFactor,
  createFactorVersion,
  createFactorOverride,
  resolveEmissionFactor,
  validateEmissionFactor,
  isFactorReferencedInLockedPeriod
} from '../../src/services/ghg/factorRegistry.js';
import { areUnitsCompatible, convertQuantity, getUnitDimension } from '../../src/services/ghg/unitService.js';

describe('Emission Factor Registry & Governance Engine (Phase 2)', () => {

  // 1. Factor Retrieval & Defaults
  it('loads authoritative default emission factors with verified provenance', () => {
    const factors = getAllEmissionFactors();
    expect(factors.length).toBeGreaterThanOrEqual(15);

    // Verify CEA National Grid factor
    const ceaGrid = getFactorById('ef_cea_grid_national_2024');
    expect(ceaGrid).toBeDefined();
    expect(ceaGrid.factorValue).toBe(0.716);
    expect(ceaGrid.denominatorUnit).toBe('kWh');
    expect(ceaGrid.source).toContain('Central Electricity Authority');
    expect(ceaGrid.gwpBasis).toBe('IPCC AR6');
    expect(ceaGrid.status).toBe('verified');

    // Verify Diesel Fuel factor
    const diesel = getFactorById('ef_ind_diesel_stationary_2024');
    expect(diesel).toBeDefined();
    expect(diesel.factorValue).toBe(2.6558);
    expect(diesel.denominatorUnit).toBe('L');
    expect(diesel.sourceReference).toContain('India GHG Program');
  });

  // 2. Factor Creation & Validation
  it('creates custom emission factors with strict validation', () => {
    // Missing source reference should fail
    const invalid = {
      name: 'Custom Biomass Pellet',
      factorValue: 0.15,
      denominatorUnit: 'kg',
      scope: 'Scope 1',
      activityType: 'Fuel Combustion',
      source: 'Internal Lab Test'
      // missing sourceReference and gwpBasis
    };
    expect(validateEmissionFactor(invalid).length).toBeGreaterThan(0);

    // Valid custom factor
    const valid = {
      name: 'Custom Biomass Pellet (Cashew Shells)',
      factorValue: 0.145,
      denominatorUnit: 'kg',
      scope: 'Scope 1',
      activityType: 'Fuel Combustion',
      source: 'Certified Boiler Lab Report',
      sourceReference: 'LAB-TEST-2024-008912',
      gwpBasis: 'IPCC AR6',
      geography: 'IN',
      country: 'India'
    };

    const customs = createCustomEmissionFactor(valid, []);
    expect(customs.length).toBe(1);
    expect(customs[0].id).toContain('ef_custom_');
    expect(customs[0].isCustom).toBe(true);
    expect(customs[0].factorValue).toBe(0.145);
  });

  // 3. Immutability & Versioning
  it('enforces factor immutability by spawning versioned factors rather than mutating', () => {
    const original = getFactorById('ef_cea_grid_national_2024');
    expect(original.version).toBe(1);

    // Spawn a version update (e.g. CEA v20 released)
    const { newFactor, updatedOriginal, customFactors } = createFactorVersion(
      'ef_cea_grid_national_2024',
      {
        factorValue: 0.705,
        sourceVersion: 'v20.0',
        sourceReference: 'CO2 Baseline Database v20.0 (Dec 2024)',
        publicationYear: 2024
      },
      'Updated to CEA v20 annual release',
      'Lead Auditor'
    );

    expect(newFactor.version).toBe(2);
    expect(newFactor.factorValue).toBe(0.705);
    expect(newFactor.supersedes).toBe('ef_cea_grid_national_2024');
    expect(updatedOriginal.supersededBy).toBe(newFactor.id);

    // Historical calculations querying original ID still get the original record
    expect(original.factorValue).toBe(0.716);
  });

  // 4. Factor Overrides (Preserving Original Lineage)
  it('creates factor overrides while preserving original factor values and lineage', () => {
    const override = createFactorOverride({
      organizationId: 'org_test',
      facilityId: 'fac_chennai_01',
      originalFactorId: 'ef_cea_grid_southern_2024',
      replacementFactorValue: 0.610,
      replacementUnit: 'kWh',
      reason: 'Site-specific wheeling contract from dedicated 5MW captive solar farm',
      source: 'TANGEDCO Green Energy Wheeling Bilateral Open Access Agreement',
      sourceReference: 'PPA-SOLAR-2024-TN-498',
      createdBy: 'Arunachalam V'
    });

    expect(override.id).toContain('ovr_');
    expect(override.originalFactorId).toBe('ef_cea_grid_southern_2024');
    expect(override.replacementFactorValue).toBe(0.610);
    expect(override.reason).toContain('dedicated 5MW captive solar farm');
  });

  // 5. Deterministic Resolver: Geographic Precedence Hierarchy
  it('resolves factors following the strict geographic hierarchy: Grid > Country > Global', () => {
    // 1. When gridRegion is specified, resolver must return the regional grid factor
    const resolvedGrid = resolveEmissionFactor({
      activityType: 'Grid Electricity',
      scope: 'Scope 2',
      geography: 'IN',
      gridRegion: 'IN_SOUTHERN'
    });
    expect(resolvedGrid.factorId).toBe('ef_cea_grid_southern_2024');
    expect(resolvedGrid.factorValue).toBe(0.698);
    expect(resolvedGrid.applicabilityLevel).toBe('grid');

    // 2. When no specific grid is given, resolver picks National average
    const resolvedNational = resolveEmissionFactor({
      activityType: 'Grid Electricity',
      scope: 'Scope 2',
      geography: 'IN'
    });
    expect(resolvedNational.factorId).toBe('ef_cea_grid_national_2024');
    expect(resolvedNational.factorValue).toBe(0.716);
    expect(resolvedNational.applicabilityLevel).toBe('country');

    // 3. When an unknown country is requested, falls back to Global factor
    const resolvedGlobal = resolveEmissionFactor({
      activityType: 'Grid Electricity',
      scope: 'Scope 2',
      geography: 'BR' // Brazil without local factor in seed
    });
    expect(resolvedGlobal.factorId).toBe('ef_global_grid_avg_2024');
    expect(resolvedGlobal.applicabilityLevel).toBe('global');
  });

  // 6. Deterministic Resolver: Site-Specific Overrides Precedence
  it('applies site-specific overrides when resolving for a facility', () => {
    const overrides = [
      createFactorOverride({
        organizationId: 'org_test',
        facilityId: 'fac_chennai_01',
        originalFactorId: 'ef_cea_grid_southern_2024',
        replacementFactorValue: 0.585,
        replacementUnit: 'kWh',
        reason: 'Direct captive wind wheeling contract',
        source: 'Third-party PPA audit',
        sourceReference: 'REF-PPA-991'
      })
    ];

    // Query for fac_chennai_01: override should be applied
    const resSite = resolveEmissionFactor({
      activityType: 'Grid Electricity',
      scope: 'Scope 2',
      geography: 'IN',
      gridRegion: 'IN_SOUTHERN',
      facilityId: 'fac_chennai_01',
      overrides
    });

    expect(resSite.isOverridden).toBe(true);
    expect(resSite.factorValue).toBe(0.585);
    expect(resSite.originalFactorValue).toBe(0.698);
    expect(resSite.selectionReason).toContain('Direct captive wind wheeling contract');

    // Query for another facility (fac_pune_02): override should NOT apply
    const resOther = resolveEmissionFactor({
      activityType: 'Grid Electricity',
      scope: 'Scope 2',
      geography: 'IN',
      gridRegion: 'IN_SOUTHERN',
      facilityId: 'fac_pune_02',
      overrides
    });

    expect(resOther.isOverridden).toBe(false);
    expect(resOther.factorValue).toBe(0.698);
  });

  // 7. Unit Dimensional Compatibility Checks
  it('verifies unit compatibility and blocks cross-dimensional conversion without physical parameters', () => {
    // Compatible: kg to tonne
    expect(areUnitsCompatible('kg', 'tonne')).toBe(true);
    expect(areUnitsCompatible('L', 'm3')).toBe(true);
    expect(areUnitsCompatible('kWh', 'MWh')).toBe(true);

    // Incompatible: volume to mass
    expect(areUnitsCompatible('L', 'kg')).toBe(false);
    expect(areUnitsCompatible('kWh', 'km')).toBe(false);

    // Unit conversion within same dimension
    const converted = convertQuantity(5000, 'kWh', 'MWh');
    expect(converted.convertedQuantity).toBe(5.0);

    // Volume conversion with explicit density (e.g. Diesel 0.832 kg/L)
    const massFromVol = convertQuantity(1000, 'L', 'kg', { densityKgPerLiter: 0.832 });
    expect(massFromVol.convertedQuantity).toBe(832.0);

    // Resolver should throw error when activity unit is incompatible with factor denominator
    expect(() => {
      resolveEmissionFactor({
        activityType: 'Fuel Combustion',
        scope: 'Scope 1',
        geography: 'IN',
        activityUnit: 'kWh' // Diesel denominator is Liters
      });
    }).toThrow('Unit dimension incompatibility');
  });

  // 8. Missing Factor Failure (No Silent Fallback to Unrelated Factors)
  it('fails clearly when no factor matches the activity, refusing to pick an unrelated factor', () => {
    expect(() => {
      resolveEmissionFactor({
        activityType: 'Nuclear Fusion Plasma Fuel',
        scope: 'Scope 1',
        geography: 'IN'
      });
    }).toThrow('No emission factor found matching activity');
  });

  // 9. Temporal Validity Matching
  it('detects when an emission factor is outside the reporting period window', () => {
    const historicalPeriod = {
      startDate: '2019-01-01',
      endDate: '2019-12-31'
    };

    // CEA 2024 factor has validFrom: '2024-01-01'
    const res = resolveEmissionFactor({
      activityType: 'Grid Electricity',
      scope: 'Scope 2',
      geography: 'IN',
      reportingPeriod: historicalPeriod
    });

    expect(res.temporalStatus).toBe('future_factor_mismatch');
  });

  // 10. Locked Period Protection
  it('detects when a factor is referenced by a locked reporting period', () => {
    const periods = [
      { id: 'p_2023', status: 'locked' },
      { id: 'p_2024', status: 'draft' }
    ];

    const ledgers = {
      scope1: [
        { periodId: 'p_2023', factorId: 'ef_ind_diesel_stationary_2024' }
      ]
    };

    const isLocked = isFactorReferencedInLockedPeriod('ef_ind_diesel_stationary_2024', periods, ledgers);
    expect(isLocked).toBe(true);

    const isUnlocked = isFactorReferencedInLockedPeriod('ef_cea_grid_southern_2024', periods, ledgers);
    expect(isUnlocked).toBe(false);
  });
});
