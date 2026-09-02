import { describe, it, expect } from 'bun:test';
import { normalizeProjectWithCorporate, CURRENT_SCHEMA_VERSION } from '../../src/services/ghg/projectMigration.js';

describe('Project Normalization & Corporate Migration', () => {
  it('upgrades a legacy v2/v3 project cleanly without touching BOM items', () => {
    const legacyProject = {
      id: 'proj_legacy_1',
      projectName: 'Industrial Valve PCF Prototype',
      companyName: 'ACME Valves Ltd',
      standard: 'ISO 14067 / GHG Protocol',
      declarationSerial: 'DECL-GHG-2024-123456',
      periods: [
        {
          year: 2023,
          isBaseYear: true,
          label: 'FY2023 (Base Year)',
          bom: [
            { id: 'b1', name: 'Cast Iron Body', qty: 250, ef: 1.8 }
          ]
        },
        {
          year: 2024,
          isBaseYear: false,
          label: 'FY2024',
          bom: [
            { id: 'b2', name: 'Forged Steel Stem', qty: 50, ef: 2.3 }
          ]
        }
      ]
    };

    const migrated = normalizeProjectWithCorporate(legacyProject);

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.organization).toBeDefined();
    expect(migrated.organization.name).toBe('ACME Valves Ltd');
    expect(migrated.organization.consolidationApproach).toBe('Operational Control');
    expect(migrated.organization.gwpBasis).toBe('IPCC AR6');

    // Facilities created
    expect(Array.isArray(migrated.facilities)).toBe(true);
    expect(migrated.facilities.length).toBeGreaterThanOrEqual(1);
    expect(migrated.facilities[0].name).toBe('Main Facility (HQ / Manufacturing)');

    // Periods preserved and upgraded
    expect(migrated.periods.length).toBe(2);
    expect(migrated.periods[0].reportingYear).toBe(2023);
    expect(migrated.periods[0].startDate).toBe('2023-01-01');
    expect(migrated.periods[0].endDate).toBe('2023-12-31');
    expect(migrated.periods[0].bom.length).toBe(1);
    expect(migrated.periods[0].bom[0].name).toBe('Cast Iron Body');

    expect(migrated.periods[1].reportingYear).toBe(2024);
    expect(migrated.periods[1].bom.length).toBe(1);
    expect(migrated.periods[1].bom[0].name).toBe('Forged Steel Stem');

    // Corporate inventory structures added
    expect(migrated.corporateInventory).toBeDefined();
    expect(Array.isArray(migrated.corporateInventory.scope1)).toBe(true);
    expect(Array.isArray(migrated.corporateInventory.scope2)).toBe(true);
    expect(Array.isArray(migrated.corporateInventory.scope3)).toBe(true);
  });
});
