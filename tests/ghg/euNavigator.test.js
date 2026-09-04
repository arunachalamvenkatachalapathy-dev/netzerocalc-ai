import { describe, it, expect } from 'bun:test';
import {
  EU_REGULATIONS_60,
  CATEGORIES,
  INDUSTRIES,
  STRATEGIC_QUADRANTS,
  matchesIndustry,
  isYearVisible,
  getRegulationQuadrant,
  filterRegulations,
  calculateNavigatorStatistics,
  calculateScatterCoordinates,
  generateRadarGeometry,
  exportShortlistToCsv
} from '../../src/services/regulations/euNavigatorService.js';

describe('EU ESG Regulation Navigator Service (Part 8)', () => {

  describe('1. Dataset Integrity & Multi-Factor Taxonomy', () => {
    it('contains exactly 60 authoritative EU ESG regulations', () => {
      expect(EU_REGULATIONS_60.length).toBe(60);
    });

    it('enforces complete schema attributes for every regulation', () => {
      EU_REGULATIONS_60.forEach(reg => {
        expect(reg.name).toBeDefined();
        expect(reg.short).toBeDefined();
        expect(reg.category).toBeDefined();
        expect(reg.status).toBeDefined();
        expect(reg.effort).toBeGreaterThanOrEqual(1);
        expect(reg.effort).toBeLessThanOrEqual(5);
        expect(reg.liability).toBeGreaterThanOrEqual(1);
        expect(reg.liability).toBeLessThanOrEqual(5);
        expect(reg.market).toBeGreaterThanOrEqual(1);
        expect(reg.market).toBeLessThanOrEqual(5);
        expect(reg.dataIntensity).toBeGreaterThanOrEqual(1);
        expect(reg.dataIntensity).toBeLessThanOrEqual(5);
        expect(reg.enforcement).toBeGreaterThanOrEqual(1);
        expect(reg.enforcement).toBeLessThanOrEqual(5);
        expect(reg.mustDo).toBeDefined();
        expect(reg.mustDo.length).toBeGreaterThan(0);
        expect(reg.industry).toBeDefined();
      });
    });

    it('verifies exact category counts across the 6 major European Green Deal clusters', () => {
      const counts = {};
      EU_REGULATIONS_60.forEach(r => {
        counts[r.category] = (counts[r.category] || 0) + 1;
      });

      expect(counts['Environment']).toBe(25);
      expect(counts['Data & Reporting']).toBe(11);
      expect(counts['Product']).toBe(10);
      expect(counts['Finance']).toBe(7);
      expect(counts['Social']).toBe(5);
      expect(counts['Governance']).toBe(2);
      expect(Object.keys(counts).length).toBe(6);
    });

    it('contains all 15 industry sector categories with matching keywords', () => {
      expect(INDUSTRIES.length).toBe(15);
      expect(INDUSTRIES[0].value).toBe('all');
      const energy = INDUSTRIES.find(i => i.value === 'energy');
      expect(energy).toBeDefined();
      expect(energy.kw).toContain('power');
      expect(energy.kw).toContain('renewables');
    });
  });

  describe('2. Industry Sector Matching Logic', () => {
    it('matches "all" industries for any regulation', () => {
      const ets = EU_REGULATIONS_60.find(r => r.short === 'EU ETS');
      expect(matchesIndustry(ets, 'all')).toBe(true);
    });

    it('matches energy regulations for the energy industry sector', () => {
      const ets = EU_REGULATIONS_60.find(r => r.short === 'EU ETS');
      expect(matchesIndustry(ets, 'energy')).toBe(true);
    });

    it('matches financial services for SFDR and EU Taxonomy', () => {
      const sfdr = EU_REGULATIONS_60.find(r => r.short === 'SFDR');
      expect(matchesIndustry(sfdr, 'fin')).toBe(true);
    });

    it('matches tech/AI for AI Act and Digital Services Act', () => {
      const aiAct = EU_REGULATIONS_60.find(r => r.short === 'EU AI Act');
      if (aiAct) {
        expect(matchesIndustry(aiAct, 'tech')).toBe(true);
      }
    });

    it('handles universal "all sectors" regulations', () => {
      const gdpr = EU_REGULATIONS_60.find(r => r.short === 'GDPR');
      expect(matchesIndustry(gdpr, 'mfg')).toBe(true);
      expect(matchesIndustry(gdpr, 'retail')).toBe(true);

      const whistle = EU_REGULATIONS_60.find(r => r.short === 'Whistleblower');
      expect(matchesIndustry(whistle, 'energy')).toBe(true);
    });
  });

  describe('3. Compliance Timeline Horizon Filtering', () => {
    it('shows all regulations when target year is 2031 (All Years)', () => {
      EU_REGULATIONS_60.forEach(reg => {
        expect(isYearVisible(reg, 2031)).toBe(true);
      });
    });

    it('always shows ongoing obligations regardless of year filter', () => {
      const ongoing = EU_REGULATIONS_60.filter(r => r.yearNote === 'ongoing');
      expect(ongoing.length).toBe(19);
      ongoing.forEach(reg => {
        expect(isYearVisible(reg, 2024)).toBe(true);
      });
    });

    it('preserves special status instruments (withdrawn, proposed, stalled) across timeline views', () => {
      const special = EU_REGULATIONS_60.filter(r => ['withdrawn', 'proposed', 'stalled'].includes(r.yearNote));
      expect(special.length).toBe(3);
      special.forEach(reg => {
        expect(isYearVisible(reg, 2025)).toBe(true);
      });
    });

    it('filters dated regulations by first compliance year', () => {
      const csddd = EU_REGULATIONS_60.find(r => r.short === 'CSDDD');
      expect(csddd).toBeDefined();
      expect(csddd.yearNum).toBe(2028);
      expect(isYearVisible(csddd, 2026)).toBe(false);
      expect(isYearVisible(csddd, 2028)).toBe(true);
      expect(isYearVisible(csddd, 2030)).toBe(true);
    });
  });

  describe('4. Strategic Quadrants & Classification', () => {
    it('classifies high effort and high liability regulations as Q1 (Board Critical)', () => {
      const csrd = EU_REGULATIONS_60.find(r => r.short === 'CSRD');
      expect(getRegulationQuadrant(csrd)).toBe('Q1');

      const csddd = EU_REGULATIONS_60.find(r => r.short === 'CSDDD');
      expect(getRegulationQuadrant(csddd)).toBe('Q1');

      const ets = EU_REGULATIONS_60.find(r => r.short === 'EU ETS');
      expect(getRegulationQuadrant(ets)).toBe('Q1');
    });

    it('classifies high effort and low liability regulations as Q3 (Operational Heavyweights)', () => {
      const taxonomy = EU_REGULATIONS_60.find(r => r.short === 'EU Taxonomy');
      expect(taxonomy).toBeDefined();
      expect(getRegulationQuadrant(taxonomy)).toBe('Q3');
    });

    it('classifies low effort and low liability regulations as Q4 (Monitored / Targeted)', () => {
      const nfrd = EU_REGULATIONS_60.find(r => r.short === 'NFRD');
      expect(nfrd).toBeDefined();
      expect(getRegulationQuadrant(nfrd)).toBe('Q4');
    });

    it('filters regulations by strategic quadrant', () => {
      const q1Regs = filterRegulations({ quadrantFilter: 'Q1' });
      expect(q1Regs.length).toBe(51);
      q1Regs.forEach(r => {
        expect(getRegulationQuadrant(r)).toBe('Q1');
        expect(r.effort).toBeGreaterThanOrEqual(3);
        expect(r.liability).toBeGreaterThanOrEqual(3);
      });

      const q3Regs = filterRegulations({ quadrantFilter: 'Q3' });
      expect(q3Regs.length).toBe(3);

      const q4Regs = filterRegulations({ quadrantFilter: 'Q4' });
      expect(q4Regs.length).toBe(6);
    });
  });

  describe('5. Aggregate Statistics & Risk Profiling', () => {
    it('calculates average scores and counts accurately', () => {
      const stats = calculateNavigatorStatistics(EU_REGULATIONS_60);
      expect(stats.totalCount).toBe(60);
      expect(stats.avgEffort).toBeGreaterThan(1);
      expect(stats.avgEffort).toBeLessThanOrEqual(5);
      expect(stats.avgLiability).toBeGreaterThan(1);
      expect(stats.avgLiability).toBeLessThanOrEqual(5);
      expect(stats.highLiabilityCount).toBe(31); // 18 (score 4) + 13 (score 5) = 31
      expect(stats.highEffortCount).toBe(33); // 26 (score 4) + 7 (score 5) = 33

      const qSum = stats.quadrantCounts.Q1 + stats.quadrantCounts.Q2 + stats.quadrantCounts.Q3 + stats.quadrantCounts.Q4;
      expect(qSum).toBe(60);
    });
  });

  describe('6. 2D Scatter Coordinate Generation & Clamping', () => {
    it('calculates valid bounded coordinates for all 60 regulations', () => {
      const width = 500, height = 500;
      const pad = { l: 54, r: 22, t: 22, b: 54 };

      EU_REGULATIONS_60.forEach(reg => {
        const { cx, cy } = calculateScatterCoordinates(reg, width, height, pad);
        expect(typeof cx).toBe('number');
        expect(typeof cy).toBe('number');
        expect(cx).toBeGreaterThanOrEqual(pad.l);
        expect(cx).toBeLessThanOrEqual(width - pad.r);
        expect(cy).toBeGreaterThanOrEqual(pad.t);
        expect(cy).toBeLessThanOrEqual(height - pad.b);
      });
    });
  });

  describe('7. 5-Factor Radar Geometry Generator', () => {
    it('generates 5 polygon points and grid rings for any regulation', () => {
      const reg = EU_REGULATIONS_60[0];
      const radar = generateRadarGeometry(reg, 160, 142, 104);
      expect(radar.points.length).toBe(5);
      expect(radar.gridRings.length).toBe(4);
      expect(radar.axes.length).toBe(5);
      expect(radar.polygonPointsStr).toContain(',');
    });
  });

  describe('8. Boardroom Compliance Shortlist CSV Export', () => {
    it('generates a clean RFC 4180 CSV string with all 14 columns', () => {
      const visible = EU_REGULATIONS_60.slice(0, 10);
      const csv = exportShortlistToCsv(visible);
      expect(csv).toContain('Short Code');
      expect(csv).toContain('Regulation Name');
      expect(csv).toContain('Strategic Quadrant');
      expect(csv).toContain('Key Actions Required (Must Do)');
      expect(csv).toContain('Applicable Industries');
      const lines = csv.split('\r\n');
      expect(lines.length).toBe(11); // header + 10 rows
    });
  });

});
