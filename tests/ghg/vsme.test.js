import { describe, it, expect } from 'bun:test';
import {
  VSME_DATAPOINTS,
  VSME_CAP_ITEMS,
  VSME_MODULES,
  ORGANISATION_SIZES,
  NACE_HIGH_CLIMATE_SECTORS,
  getScopedDatapoints,
  isDatapointEssential,
  isWithinValueChainCap,
  calculateVsmeReadiness,
  syncFromGhgInventory,
  exportVsmeAuditCsv,
  exportVsmeReportText
} from '../../src/services/vsme/vsmeService.js';

describe('VSME Voluntary SME Sustainability Reporting Service (Part 9)', () => {

  describe('1. Dataset Integrity & Commission Delegated Regulation C(2026) 5011', () => {
    it('contains exactly 55 authoritative VSME datapoints across Annex I', () => {
      expect(VSME_DATAPOINTS.length).toBe(55);
    });

    it('contains exactly 23 statutory Value Chain Cap items under Annex II', () => {
      expect(VSME_CAP_ITEMS.length).toBe(23);
    });

    it('verifies exact module distribution (28 Basic vs 27 Comprehensive)', () => {
      const basicCount = VSME_DATAPOINTS.filter(d => d.module === 'Basic').length;
      const compCount = VSME_DATAPOINTS.filter(d => d.module === 'Comprehensive').length;

      expect(basicCount).toBe(28);
      expect(compCount).toBe(27);
      expect(basicCount + compCount).toBe(55);
    });

    it('verifies all 15 disclosure sections are populated', () => {
      const sections = [...new Set(VSME_DATAPOINTS.map(d => d.section))];
      expect(sections.length).toBe(15);
      expect(sections).toContain('General Information');
      expect(sections).toContain('Energy & GHG');
      expect(sections).toContain('Pollution');
      expect(sections).toContain('Biodiversity');
      expect(sections).toContain('Water');
      expect(sections).toContain('Waste & Circular Economy');
      expect(sections).toContain('Workforce');
      expect(sections).toContain('Health & Safety');
      expect(sections).toContain('Pay & Benefits');
      expect(sections).toContain('Governance');
      expect(sections).toContain('Business Model');
      expect(sections).toContain('Climate & Transition');
      expect(sections).toContain('Extended Workforce');
      expect(sections).toContain('Human Rights');
      expect(sections).toContain('Sector Revenues');
    });

    it('verifies NACE high climate impact sectors definition', () => {
      expect(NACE_HIGH_CLIMATE_SECTORS.length).toBe(9);
      const codes = NACE_HIGH_CLIMATE_SECTORS.map(s => s.code);
      expect(codes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M']);
    });

    it('verifies organisation size bracket definitions', () => {
      expect(ORGANISATION_SIZES.length).toBe(2);
      expect(ORGANISATION_SIZES[0].id).toBe('le10');
      expect(ORGANISATION_SIZES[1].id).toBe('gt10');
    });

    it('enforces complete schema attributes for all 55 datapoints', () => {
      VSME_DATAPOINTS.forEach(dp => {
        expect(dp.id).toBeDefined();
        expect(dp.dr).toBeDefined();
        expect(dp.title).toBeDefined();
        expect(dp.module).toMatch(/Basic|Comprehensive/);
        expect(dp.section).toBeDefined();
        expect(dp.type).toBeDefined();
        expect(dp.unit).toBeDefined();
        expect(typeof dp.le10).toBe('boolean');
        expect(typeof dp.gt10).toBe('boolean');
        expect(typeof dp.vcLe10).toBe('boolean');
        expect(typeof dp.vcGt10).toBe('boolean');
      });
    });
  });

  describe('2. Module & Size Scoping Logic', () => {
    it('scopes exactly 28 datapoints for Basic module', () => {
      const basic = getScopedDatapoints('basic');
      expect(basic.length).toBe(28);
      basic.forEach(dp => expect(dp.module).toBe('Basic'));
    });

    it('scopes all 55 datapoints for Comprehensive (both) module', () => {
      const both = getScopedDatapoints('both');
      expect(both.length).toBe(55);
    });

    it('correctly applies micro-enterprise statutory relief (≤10 headcount)', () => {
      const reliefDps = VSME_DATAPOINTS.filter(dp => dp.gt10 && !dp.le10);
      expect(reliefDps.length).toBeGreaterThan(0);

      reliefDps.forEach(dp => {
        expect(isDatapointEssential(dp, 'le10')).toBe(false);
        if (dp.type !== 'Voluntary') {
          expect(isDatapointEssential(dp, 'gt10')).toBe(true);
        }
      });
    });

    it('returns false for Voluntary datapoints regardless of size', () => {
      const voluntaryDps = VSME_DATAPOINTS.filter(dp => dp.type === 'Voluntary');
      expect(voluntaryDps.length).toBeGreaterThan(0);

      voluntaryDps.forEach(dp => {
        expect(isDatapointEssential(dp, 'le10')).toBe(false);
        expect(isDatapointEssential(dp, 'gt10')).toBe(false);
      });
    });
  });

  describe('3. Value Chain Cap Shield Evaluator (Annex II)', () => {
    it('evaluates cap membership correctly for protected DRs', () => {
      expect(isWithinValueChainCap('B1', 'le10')).toBe(true);
      expect(isWithinValueChainCap('B1', 'gt10')).toBe(true);
      expect(isWithinValueChainCap('NON-EXISTENT', 'gt10')).toBe(false);
    });

    it('verifies all 23 cap items have valid DR references and statutory descriptions', () => {
      VSME_CAP_ITEMS.forEach(item => {
        expect(item.dr).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.implication).toBeDefined();
        expect(typeof item.le10).toBe('boolean');
        expect(typeof item.gt10).toBe('boolean');
      });
    });
  });

  describe('4. Readiness Metrics & Regulatory Alert Engine', () => {
    it('calculates 0% readiness when no disclosures entered', () => {
      const scoped = getScopedDatapoints('basic');
      const metrics = calculateVsmeReadiness({
        datapoints: scoped,
        responses: {},
        size: 'gt10',
        module: 'basic'
      });

      expect(metrics.total).toBe(28);
      expect(metrics.completed).toBe(0);
      expect(metrics.pending).toBe(28);
      expect(metrics.completionPct).toBe(0);
      expect(metrics.essentialPending).toBe(metrics.essentialTotal);
      expect(metrics.sections.length).toBe(10); // 10 sections in basic module
    });

    it('calculates accurate completion percentage with partial responses', () => {
      const scoped = getScopedDatapoints('basic');
      const responses = {
        'B1-1': { status: 'Complete', quant: 'Acme Clean Tech' },
        'B1-2': { status: 'Complete', quant: '1000000 EUR' },
        'B1-3': { status: 'In progress' },
        'B4-1': { status: 'N/A', narrative: 'No hazardous air pollution' }
      };

      const metrics = calculateVsmeReadiness({
        datapoints: scoped,
        responses,
        size: 'gt10',
        module: 'basic'
      });

      expect(metrics.completed).toBe(2);
      expect(metrics.inProgress).toBe(1);
      expect(metrics.na).toBe(1);
      expect(metrics.completionPct).toBe(Math.round((3 / 28) * 100));
    });

    it('raises high-climate impact alert when NACE sector triggers C3-3', () => {
      const scoped = getScopedDatapoints('both');
      const metrics = calculateVsmeReadiness({
        datapoints: scoped,
        responses: {},
        size: 'gt10',
        module: 'both',
        nace: 'C'
      });

      const highClimateAlert = metrics.alerts.find(a => a.type === 'high-climate');
      expect(highClimateAlert).toBeDefined();
      expect(highClimateAlert.text).toContain('NACE Sector C');
      expect(highClimateAlert.text).toContain('C3-3');
    });

    it('clears high-climate impact alert once C3-3 is completed', () => {
      const scoped = getScopedDatapoints('both');
      const metrics = calculateVsmeReadiness({
        datapoints: scoped,
        responses: {
          'C3-3': { status: 'Complete', narrative: 'Transition roadmap in place targeting net zero by 2040.' }
        },
        size: 'gt10',
        module: 'both',
        nace: 'C'
      });

      const highClimateAlert = metrics.alerts.find(a => a.type === 'high-climate');
      expect(highClimateAlert).toBeUndefined();
    });

    it('triggers 100% audit-ready success alert when all datapoints are resolved', () => {
      const scoped = getScopedDatapoints('basic');
      const responses = {};
      scoped.forEach(dp => {
        responses[dp.id] = { status: 'Complete', quant: 'Verified' };
      });

      const metrics = calculateVsmeReadiness({
        datapoints: scoped,
        responses,
        size: 'gt10',
        module: 'basic'
      });

      expect(metrics.completionPct).toBe(100);
      expect(metrics.pending).toBe(0);
      expect(metrics.essentialPending).toBe(0);

      const successAlert = metrics.alerts.find(a => a.type === 'success');
      expect(successAlert).toBeDefined();
      expect(successAlert.text).toContain('audit-ready');
    });
  });

  describe('5. NetZeroCalc Single-Umbrella Corporate GHG Inventory Bridge', () => {
    it('auto-bridges Scope 1, Scope 2, Scope 3 and Energy from BOM to VSME disclosures', () => {
      const mockProject = {
        projectName: 'Enterprise Clean Fleet',
        periods: [
          {
            year: 2026,
            bom: [
              { scope: 'Scope 1', qty: 5000, ef: 2.68, unit: 'Liters' },
              { scope: 'Scope 2', qty: 250000, ef: 0.42, unit: 'kWh' },
              { scope: 'Scope 3', qty: 10000, ef: 1.5, unit: 'kg' }
            ]
          }
        ]
      };

      const synced = syncFromGhgInventory(mockProject, 2026);

      expect(synced['B3-1']).toBeDefined();
      expect(synced['B3-1'].status).toBe('Complete');
      expect(synced['B3-1'].quant).toBe('300 MWh');
      expect(synced['B3-1'].source).toContain('Enterprise Clean Fleet');

      expect(synced['B3-2']).toBeDefined();
      expect(synced['B3-2'].status).toBe('Complete');
      expect(synced['B3-2'].quant).toBe('13.4 tCO2e');

      expect(synced['B3-3']).toBeDefined();
      expect(synced['B3-3'].status).toBe('Complete');
      expect(synced['B3-3'].quant).toContain('105 tCO2e');

      expect(synced['C3-2']).toBeDefined();
      expect(synced['C3-2'].status).toBe('Complete');
      expect(synced['C3-2'].quant).toBe('15 tCO2e');
    });

    it('handles empty or missing corporate inventory gracefully', () => {
      const syncedEmpty = syncFromGhgInventory(null, 2026);
      expect(Object.keys(syncedEmpty).length).toBe(0);

      const syncedNoBom = syncFromGhgInventory({ periods: [{ year: 2026, bom: [] }] }, 2026);
      expect(Object.keys(syncedNoBom).length).toBe(0);
    });
  });

  describe('6. RFC 4180 CSV & Statement Text Exporters', () => {
    it('generates compliant RFC 4180 CSV with all 16 columns and escaped fields', () => {
      const scoped = getScopedDatapoints('basic');
      const responses = {
        'B1-1': { status: 'Complete', quant: 'Acme "Clean" Tech', narrative: 'Leader in eco-innovation, EU.', source: 'Audited Financials' }
      };

      const csv = exportVsmeAuditCsv(scoped, responses, 'Acme "Clean" Tech', 2026);
      expect(csv).toBeDefined();

      const lines = csv.split('\r\n');
      expect(lines.length).toBe(29); // 1 header + 28 basic datapoints

      const header = lines[0];
      expect(header).toContain('"ID"');
      expect(header).toContain('"Disclosure Requirement"');
      expect(header).toContain('"VC Cap LE10"');
      expect(header).toContain('"VC Cap GT10"');

      const b11Row = lines.find(l => l.includes('"B1-1"'));
      expect(b11Row).toBeDefined();
      expect(b11Row).toContain('""Clean""');
    });

    it('formats a complete publication-ready Voluntary Sustainability Statement text', () => {
      const scoped = getScopedDatapoints('basic');
      const responses = {
        'B1-1': { status: 'Complete', quant: 'GreenFlow Solutions ApS' },
        'B3-1': { status: 'Complete', quant: '450 MWh' },
        'B3-2': { status: 'Complete', quant: '85.2 tCO2e', narrative: 'Direct gas boilers and fleet.' }
      };

      const text = exportVsmeReportText({
        company: 'GreenFlow Solutions ApS',
        year: 2026,
        preparer: 'Nalini Arun, ESG Director',
        country: 'Denmark',
        nace: 'C',
        size: 'gt10',
        module: 'basic',
        datapoints: scoped,
        responses
      });

      expect(text).toContain('VOLUNTARY SUSTAINABILITY STATEMENT (VSME)');
      expect(text).toContain('GreenFlow Solutions ApS');
      expect(text).toContain('Financial Reporting Period: FY2026');
      expect(text).toContain('Commission Delegated Regulation C(2026) 5011');
      expect(text).toContain('Value Chain Cap (Annex II)');
      expect(text).toContain('NACE Sector: C');
      expect(text).toContain('[B1-1]');
      expect(text).toContain('[B3-1]');
      expect(text).toContain('450 MWh');
      expect(text).toContain('85.2 tCO2e');
      expect(text).toContain('END OF SUSTAINABILITY STATEMENT');
    });
  });

});
