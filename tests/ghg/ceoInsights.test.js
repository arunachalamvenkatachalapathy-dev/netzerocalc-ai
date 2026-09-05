import { describe, it, expect } from 'bun:test';
import {
  CEO_STRATEGIC_BRIEFS,
  STRATEGIC_CATEGORIES,
  STRATEGIC_MATURITY_PILLARS,
  getAllBriefs,
  getBriefById,
  filterBriefsByCategory,
  calculateInsightsMetrics,
  evaluateMaturityScorecard,
  exportExecutiveSummaryCsv,
  exportBoardroomBriefingMarkdown
} from '../../src/services/insights/ceoInsightsService.js';

describe('Executive CEO Insights & Strategic Briefs Service (Part 10)', () => {

  describe('1. Dataset Integrity & Unreferenced Strategic Modeling', () => {
    it('contains exactly 5 authoritative boardroom strategic briefs', () => {
      expect(CEO_STRATEGIC_BRIEFS.length).toBe(5);
    });

    it('contains 6 category definitions including all', () => {
      expect(STRATEGIC_CATEGORIES.length).toBe(6);
      expect(STRATEGIC_CATEGORIES[0].id).toBe('all');
    });

    it('contains exactly 5 strategic maturity pillars with 5-point evaluation scales', () => {
      expect(STRATEGIC_MATURITY_PILLARS.length).toBe(5);
      STRATEGIC_MATURITY_PILLARS.forEach(p => {
        expect(p.id).toBeDefined();
        expect(p.title).toBeDefined();
        expect(p.description).toBeDefined();
        expect(p.questions.length).toBeGreaterThan(0);
        expect(p.questions[0].options.length).toBe(5);
      });
    });

    it('enforces complete executive schema attributes for every brief', () => {
      CEO_STRATEGIC_BRIEFS.forEach(brief => {
        expect(brief.id).toBeDefined();
        expect(brief.category).toBeDefined();
        expect(brief.categoryLabel).toBeDefined();
        expect(brief.title).toBeDefined();
        expect(brief.subtitle).toBeDefined();
        expect(brief.readTime).toBeDefined();
        expect(brief.leadHeadline).toBeDefined();

        // Stats array
        expect(brief.stats).toBeDefined();
        expect(brief.stats.length).toBeGreaterThanOrEqual(3);
        brief.stats.forEach(s => {
          expect(s.label).toBeDefined();
          expect(s.value).toBeDefined();
          expect(s.desc).toBeDefined();
        });

        // The Shift
        expect(brief.theShift).toBeDefined();
        expect(brief.theShift.title).toBeDefined();
        expect(brief.theShift.paragraphs.length).toBeGreaterThan(0);

        // Three Lenses
        expect(brief.threeLenses).toBeDefined();
        expect(brief.threeLenses.length).toBe(3);
        brief.threeLenses.forEach(lens => {
          expect(lens.title).toBeDefined();
          expect(lens.description).toBeDefined();
          expect(lens.keyTakeaway).toBeDefined();
        });

        // Deep Insights
        expect(brief.deepInsights).toBeDefined();
        expect(brief.deepInsights.length).toBeGreaterThanOrEqual(3);
        brief.deepInsights.forEach(d => {
          expect(d.title).toBeDefined();
          expect(d.detail).toBeDefined();
        });

        // Boardroom Decision Questions
        expect(brief.boardroomQuestions).toBeDefined();
        expect(brief.boardroomQuestions.length).toBeGreaterThanOrEqual(4);

        // Action Plan
        expect(brief.actionPlan).toBeDefined();
        expect(brief.actionPlan.length).toBeGreaterThanOrEqual(4);
        brief.actionPlan.forEach(a => {
          expect(a.role).toBeDefined();
          expect(a.action).toBeDefined();
        });

        // Connected NetZeroCalc Engine
        expect(brief.connectedEngine).toBeDefined();
        expect(brief.connectedEngine.id).toBeDefined();
        expect(brief.connectedEngine.label).toBeDefined();
      });
    });
  });

  describe('2. Retrieval & Scoped Filtering', () => {
    it('retrieves all briefs via getAllBriefs()', () => {
      const all = getAllBriefs();
      expect(all.length).toBe(5);
    });

    it('retrieves specific brief by ID correctly', () => {
      const csrdBrief = getBriefById('brief-csrd-benchmarking');
      expect(csrdBrief).toBeDefined();
      expect(csrdBrief.title).toContain('Corporate Filings Benchmarking');
      expect(csrdBrief.connectedEngine.id).toBe('csrd-materiality');

      const nullBrief = getBriefById('non-existent-id');
      expect(nullBrief).toBeNull();
    });

    it('filters briefs cleanly by category', () => {
      const carbonBriefs = filterBriefsByCategory('carbon-economics');
      expect(carbonBriefs.length).toBe(1);
      expect(carbonBriefs[0].id).toBe('brief-cost-of-carbon');

      const allBriefs = filterBriefsByCategory('all');
      expect(allBriefs.length).toBe(5);
    });
  });

  describe('3. Intelligence Metrics & Aggregations', () => {
    it('computes aggregated boardroom intelligence statistics', () => {
      const metrics = calculateInsightsMetrics();
      expect(metrics.totalBriefs).toBe(5);
      expect(metrics.categoriesCount).toBe(5);
      expect(metrics.totalBoardQuestions).toBeGreaterThanOrEqual(20);
      expect(metrics.totalExecutiveActions).toBeGreaterThanOrEqual(20);
      expect(metrics.activeDirectivesMapped).toBe(60);
    });
  });

  describe('4. Strategic Maturity Scorecard Engine', () => {
    it('evaluates baseline novice tier for empty/minimum answers', () => {
      const result = evaluateMaturityScorecard({});
      expect(result.overallScore).toBe(1.0);
      expect(result.overallPct).toBe(20);
      expect(result.tier).toContain('Novice');
      expect(result.pillars.length).toBe(5);
      result.pillars.forEach(p => expect(p.status).toBe('Lagging'));
    });

    it('evaluates developing practitioner tier for mid-range answers', () => {
      const answers = {
        governance_integration: 3,
        scenario_resilience: 3,
        regulatory_architecture: 3,
        supply_chain_diligence: 3,
        assurance_readiness: 3
      };

      const result = evaluateMaturityScorecard(answers);
      expect(result.overallScore).toBe(3.0);
      expect(result.overallPct).toBe(60);
      expect(result.tier).toContain('Developing Practitioner');
      result.pillars.forEach(p => expect(p.status).toBe('Proficient'));
    });

    it('evaluates executive market leader tier for frontrunner scores', () => {
      const answers = {
        governance_integration: 5,
        scenario_resilience: 5,
        regulatory_architecture: 5,
        supply_chain_diligence: 5,
        assurance_readiness: 5
      };

      const result = evaluateMaturityScorecard(answers);
      expect(result.overallScore).toBe(5.0);
      expect(result.overallPct).toBe(100);
      expect(result.tier).toContain('Executive Market Leader');
      result.pillars.forEach(p => expect(p.status).toBe('Advanced'));
    });
  });

  describe('5. Boardroom Exporters & RFC 4180 CSV', () => {
    it('generates compliant RFC 4180 CSV with escaped fields', () => {
      const csv = exportExecutiveSummaryCsv();
      expect(csv).toBeDefined();

      const lines = csv.split('\r\n');
      expect(lines.length).toBe(6); // 1 header + 5 briefs
      expect(lines[0]).toContain('"Brief ID"');
      expect(lines[0]).toContain('"Connected NetZeroCalc Engine"');

      // Check all rows have quotes
      lines.forEach(l => {
        expect(l.startsWith('"')).toBe(true);
        expect(l.endsWith('"')).toBe(true);
      });
    });

    it('formats a comprehensive boardroom briefing deck in Markdown', () => {
      const md = exportBoardroomBriefingMarkdown('brief-csrd-benchmarking', 'Global Industries Inc.', 2026);
      expect(md).toBeDefined();
      expect(md).toContain('# EXECUTIVE BOARDROOM STRATEGIC BRIEF');
      expect(md).toContain('Global Industries Inc.');
      expect(md).toContain('FY2026 Corporate Governance & Capital Allocation');
      expect(md).toContain('Corporate Filings Benchmarking');
      expect(md).toContain('Lens 1: Compliance Completeness & Assurance');
      expect(md).toContain('Boardroom & Audit Committee Decision Checklist');
      expect(md).toContain('Question 1:');
      expect(md).toContain('Chief Executive Officer');
      expect(md).toContain('Chief Financial Officer');
      expect(md).toContain('END OF BOARDROOM STRATEGIC BRIEF');
    });
  });

});
