import { describe, it, expect } from 'bun:test';
import { normalizeProjectWithCorporate, CURRENT_SCHEMA_VERSION } from '../../src/services/ghg/projectMigration.js';

describe('Round-Trip & Snapshot Migration Safety', () => {
  it('performs a lossless round-trip migration preserving BOM rows, quantities, DQR and metadata', () => {
    // 1. Rich Legacy v2/v3 Project Snapshot
    const legacyProject = {
      id: 'proj_industrial_valves_v3',
      projectName: 'High-Pressure Steam Valve Cradle-to-Gate PCF',
      companyName: 'Apex Fluid Systems Pvt Ltd',
      standard: 'ISO 14067 / GHG Protocol Product Standard',
      declarationSerial: 'DECL-PCF-2024-884920',
      geography: 'IN',
      coverBoundary: {
        baseYear: 2023,
        reportingPeriod: 2024,
        allocationMethod: 'Mass Allocation',
        systemBoundary: 'Cradle-to-Gate'
      },
      changeLog: [
        {
          id: 'log_001',
          timestamp: '2024-03-01T10:00:00.000Z',
          action: 'PROJECT_CREATED',
          summary: 'Created initial PCF project for valve line.',
          author: 'Arunachalam Venkatachalapathy'
        },
        {
          id: 'log_002',
          timestamp: '2024-03-15T14:30:00.000Z',
          action: 'DQR_VERIFIED',
          summary: 'Verified pedigree matrix scores with supplier metallurgy certs.',
          author: 'Arunachalam Venkatachalapathy'
        }
      ],
      periods: [
        {
          year: 2023,
          isBaseYear: true,
          label: 'FY2023 (Base Year)',
          bom: [
            {
              id: 'item_01',
              name: 'Cast Steel Body WCB Grade',
              qty: 450.5,
              unit: 'kg',
              process: 'Cast Steel Production - Blast Furnace / BOF Route',
              ef: 2.45,
              scope: 'Scope 3',
              scope3Category: 'Cat 1: Purchased Goods & Services',
              gwpBasis: 'IPCC AR6',
              ter: 2,
              ger: 1,
              tir: 2,
              dqrScore: 1.67,
              risk: 'LOW',
              status: 'Supplier Verified',
              approved: true
            },
            {
              id: 'item_02',
              name: 'Grid Electricity for Machining (TNEB)',
              qty: 3200.0,
              unit: 'kWh',
              process: 'Grid Electricity (CEA India Grid Mix 2024)',
              ef: 0.716,
              scope: 'Scope 2',
              scope3Category: 'N/A (Scope 2 Location-Based)',
              gwpBasis: 'IPCC AR6',
              ter: 1,
              ger: 1,
              tir: 1,
              dqrScore: 1.0,
              risk: 'LOW',
              status: 'CEA Verified',
              approved: true
            }
          ]
        },
        {
          year: 2024,
          isBaseYear: false,
          label: 'FY2024',
          bom: [
            {
              id: 'item_03',
              name: 'Forged Stainless Steel Trim 316L',
              qty: 85.25,
              unit: 'kg',
              process: 'Stainless Steel Cold Rolled Coil / Forging',
              ef: 4.85,
              scope: 'Scope 3',
              scope3Category: 'Cat 1: Purchased Goods & Services',
              gwpBasis: 'IPCC AR6',
              ter: 1,
              ger: 1,
              tir: 1,
              dqrScore: 1.0,
              risk: 'LOW',
              status: 'Mill Test Cert Matched',
              approved: true
            },
            {
              id: 'item_04',
              name: 'Diesel Fuel for Factory Generator',
              qty: 450.0,
              unit: 'Liters',
              process: 'Diesel Fuel Thermal Combustion',
              ef: 2.6558,
              scope: 'Scope 1',
              scope3Category: 'N/A (Scope 1 Direct)',
              gwpBasis: 'IPCC AR6',
              ter: 1,
              ger: 1,
              tir: 1,
              dqrScore: 1.0,
              risk: 'LOW',
              status: 'India GHG Factor v6',
              approved: false
            }
          ]
        }
      ]
    };

    // 2. First-pass migration: Legacy -> v4
    const v4Project = normalizeProjectWithCorporate(legacyProject);

    // 3. Serialization simulation (Writing to localStorage / disk / network JSON)
    const jsonSerialized = JSON.stringify(v4Project);
    const jsonReloaded = JSON.parse(jsonSerialized);

    // 4. Second-pass migration: Idempotency check on reloaded structure
    const reMigrated = normalizeProjectWithCorporate(jsonReloaded);

    // --- ASSERTIONS ---

    // A. Verify Schema Version
    expect(reMigrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);

    // B. Verify Project Metadata Remains Intact
    expect(reMigrated.id).toBe(legacyProject.id);
    expect(reMigrated.projectName).toBe(legacyProject.projectName);
    expect(reMigrated.companyName).toBe(legacyProject.companyName);
    expect(reMigrated.standard).toBe(legacyProject.standard);
    expect(reMigrated.declarationSerial).toBe(legacyProject.declarationSerial);

    // C. Verify Cover Boundary & Change Logs
    expect(reMigrated.coverBoundary).toEqual(legacyProject.coverBoundary);
    expect(reMigrated.changeLog.length).toBe(legacyProject.changeLog.length);
    expect(reMigrated.changeLog[0].action).toBe('PROJECT_CREATED');
    expect(reMigrated.changeLog[1].summary).toContain('pedigree matrix');

    // D. Verify Period Integrity
    expect(reMigrated.periods.length).toBe(2);
    expect(reMigrated.periods[0].reportingYear).toBe(2023);
    expect(reMigrated.periods[0].startDate).toBe('2023-01-01');
    expect(reMigrated.periods[0].endDate).toBe('2023-12-31');
    expect(reMigrated.periods[0].isBaseYear).toBe(true);

    expect(reMigrated.periods[1].reportingYear).toBe(2024);
    expect(reMigrated.periods[1].startDate).toBe('2024-01-01');
    expect(reMigrated.periods[1].endDate).toBe('2024-12-31');
    expect(reMigrated.periods[1].isBaseYear).toBe(false);

    // E. CRITICAL: Exact Row-by-Row, Field-by-Field PCF BOM Integrity
    // Period 2023 BOM check
    expect(reMigrated.periods[0].bom.length).toBe(legacyProject.periods[0].bom.length);
    for (let i = 0; i < legacyProject.periods[0].bom.length; i++) {
      const orig = legacyProject.periods[0].bom[i];
      const reloaded = reMigrated.periods[0].bom[i];

      expect(reloaded.id).toBe(orig.id);
      expect(reloaded.name).toBe(orig.name);
      expect(reloaded.qty).toBe(orig.qty);
      expect(reloaded.unit).toBe(orig.unit);
      expect(reloaded.process).toBe(orig.process);
      expect(reloaded.ef).toBe(orig.ef);
      expect(reloaded.scope).toBe(orig.scope);
      expect(reloaded.scope3Category).toBe(orig.scope3Category);
      expect(reloaded.gwpBasis).toBe(orig.gwpBasis);
      expect(reloaded.ter).toBe(orig.ter);
      expect(reloaded.ger).toBe(orig.ger);
      expect(reloaded.tir).toBe(orig.tir);
      expect(reloaded.dqrScore).toBe(orig.dqrScore);
      expect(reloaded.risk).toBe(orig.risk);
      expect(reloaded.status).toBe(orig.status);
      expect(reloaded.approved).toBe(orig.approved);
    }

    // Period 2024 BOM check
    expect(reMigrated.periods[1].bom.length).toBe(legacyProject.periods[1].bom.length);
    for (let i = 0; i < legacyProject.periods[1].bom.length; i++) {
      const orig = legacyProject.periods[1].bom[i];
      const reloaded = reMigrated.periods[1].bom[i];

      expect(reloaded.id).toBe(orig.id);
      expect(reloaded.name).toBe(orig.name);
      expect(reloaded.qty).toBe(orig.qty);
      expect(reloaded.unit).toBe(orig.unit);
      expect(reloaded.process).toBe(orig.process);
      expect(reloaded.ef).toBe(orig.ef);
      expect(reloaded.scope).toBe(orig.scope);
      expect(reloaded.dqrScore).toBe(orig.dqrScore);
    }

    // F. Verify Corporate Domain Structure Added Cleanly Without Monolithic Coupling
    expect(reMigrated.organization).toBeDefined();
    expect(reMigrated.organization.name).toBe(legacyProject.companyName);
    expect(reMigrated.organization.consolidationApproach).toBe('Operational Control');
    expect(reMigrated.organization.gwpBasis).toBe('IPCC AR6');

    expect(Array.isArray(reMigrated.facilities)).toBe(true);
    expect(reMigrated.facilities.length).toBeGreaterThanOrEqual(1);

    expect(reMigrated.corporateInventory).toBeDefined();
    expect(Array.isArray(reMigrated.corporateInventory.scope1)).toBe(true);
    expect(Array.isArray(reMigrated.corporateInventory.scope2)).toBe(true);
    expect(Array.isArray(reMigrated.corporateInventory.scope3)).toBe(true);

    // G. Idempotency Check: Facilities and periods should not have multiplied
    expect(reMigrated.facilities.length).toBe(v4Project.facilities.length);
    expect(reMigrated.periods.length).toBe(v4Project.periods.length);
  });
});
