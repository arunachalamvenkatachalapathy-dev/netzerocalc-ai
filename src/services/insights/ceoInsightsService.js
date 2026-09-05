/**
 * NetZeroCalc-AI — Executive CEO Insights & Strategic Briefs Service
 * Executive decision intelligence, empirical filings analytics,
 * strategic maturity scorecard evaluator, and boardroom export generators.
 */

import {
  CEO_STRATEGIC_BRIEFS,
  STRATEGIC_CATEGORIES,
  STRATEGIC_MATURITY_PILLARS
} from '../../data/ceoInsightsData.js';

export {
  CEO_STRATEGIC_BRIEFS,
  STRATEGIC_CATEGORIES,
  STRATEGIC_MATURITY_PILLARS
};

/**
 * Retrieve all executive strategic briefs
 */
export function getAllBriefs() {
  return CEO_STRATEGIC_BRIEFS;
}

/**
 * Get single brief by ID
 */
export function getBriefById(id) {
  return CEO_STRATEGIC_BRIEFS.find(b => b.id === id) || null;
}

/**
 * Filter briefs by strategic category
 */
export function filterBriefsByCategory(category = 'all') {
  if (!category || category === 'all') {
    return CEO_STRATEGIC_BRIEFS;
  }
  return CEO_STRATEGIC_BRIEFS.filter(b => b.category === category);
}

/**
 * Compute executive aggregate intelligence statistics
 */
export function calculateInsightsMetrics(briefs = CEO_STRATEGIC_BRIEFS) {
  const totalBriefs = briefs.length;
  const categoriesCount = STRATEGIC_CATEGORIES.length - 1; // Exclude 'all'
  const totalBoardQuestions = briefs.reduce((acc, b) => acc + (b.boardroomQuestions?.length || 0), 0);
  const totalExecutiveActions = briefs.reduce((acc, b) => acc + (b.actionPlan?.length || 0), 0);

  return {
    totalBriefs,
    categoriesCount,
    totalBoardQuestions,
    totalExecutiveActions,
    averageReadTime: '5.6 min',
    benchmarkCoverage: 'Wave 1 European & Global Leaders',
    activeDirectivesMapped: 60,
    carbonPriceHorizon: '€80 to €200 / tCO2e'
  };
}

/**
 * Evaluate Executive Strategic Maturity Scorecard across 5 core pillars
 * Input: answers = { [pillarId]: score (1-5) }
 */
export function evaluateMaturityScorecard(answers = {}) {
  const pillars = STRATEGIC_MATURITY_PILLARS;
  let totalScore = 0;
  let answeredCount = 0;
  const pillarResults = [];

  pillars.forEach(p => {
    const rawVal = answers[p.id];
    const score = typeof rawVal === 'number' && rawVal >= 1 && rawVal <= 5 ? rawVal : 1;
    if (typeof rawVal === 'number') answeredCount++;

    totalScore += score;
    pillarResults.push({
      id: p.id,
      title: p.title,
      score,
      maxScore: 5,
      percentage: Math.round((score / 5) * 100),
      status: score >= 4 ? 'Advanced' : score >= 3 ? 'Proficient' : score >= 2 ? 'Emerging' : 'Lagging'
    });
  });

  const overallScore = Number((totalScore / pillars.length).toFixed(1));
  const overallPct = Math.round((overallScore / 5) * 100);

  let tier = '';
  let executiveSummary = '';
  let priorityDirective = '';

  if (overallScore >= 4.5) {
    tier = 'Tier 1: Executive Market Leader (Strategic Frontrunner)';
    executiveSummary = 'Enterprise ESG practice is fully embedded into corporate governance, capital allocation, and supply chain procurement. Well positioned for Tier-1 customer lock-in and preferential cost of capital.';
    priorityDirective = 'Maintain competitive edge through reasonable assurance milestones, digital product passport scale-up, and net-positive biodiversity roadmaps.';
  } else if (overallScore >= 3.5) {
    tier = 'Tier 2: Advanced Integrator (Capital & Governance Linked)';
    executiveSummary = 'Core reporting and due diligence frameworks are robust. Opportunity lies in formalizing internal shadow carbon pricing in CapEx and expanding quantitative scenario modeling.';
    priorityDirective = 'Integrate shadow carbon pricing (€75–€130/t) into investment hurdle rates and quantify balance sheet outcomes under IEA NZE and NGFS reference scenarios.';
  } else if (overallScore >= 2.3) {
    tier = 'Tier 3: Developing Practitioner (Emerging Compliance)';
    executiveSummary = 'Compliance baseline is established, but operations remain siloed across reporting, procurement, and finance. High vulnerability to upcoming 2026–2027 enforcement deadlines.';
    priorityDirective = 'Consolidate CSRD, CSDDD, and CBAM data pipelines into a shared architecture to eliminate duplicate costs and audit control gaps.';
  } else {
    tier = 'Tier 4: Compliance Novice (Fragmented & High Risk)';
    executiveSummary = 'Sustainability is treated as an ad hoc disclosure checklist rather than a strategic operating condition. Acute risk of qualified assurance opinions, customs border delays, and investor disqualification.';
    priorityDirective = 'Commission an immediate cross-functional audit across CSRD 325 clusters, CSDDD Tier-1 supply chains, and the 10 maximum-liability EU regulations.';
  }

  return {
    overallScore,
    overallPct,
    answeredCount,
    totalPillars: pillars.length,
    tier,
    executiveSummary,
    priorityDirective,
    pillars: pillarResults
  };
}

/**
 * Export Executive Briefing Summary to RFC 4180 CSV
 */
export function exportExecutiveSummaryCsv(briefs = CEO_STRATEGIC_BRIEFS, enterpriseName = 'Enterprise Organization') {
  const headers = [
    'Brief ID',
    'Category',
    'Title',
    'Read Time',
    'Lead Headline',
    'Key Metric 1',
    'Key Metric 2',
    'Connected NetZeroCalc Engine',
    'Board Questions Count',
    'Executive Actions Count'
  ];

  const rows = briefs.map(b => {
    const stat1 = b.stats?.[0] ? `${b.stats[0].label}: ${b.stats[0].value}` : '';
    const stat2 = b.stats?.[1] ? `${b.stats[1].label}: ${b.stats[1].value}` : '';
    return [
      b.id,
      b.categoryLabel,
      b.title,
      b.readTime,
      b.leadHeadline,
      stat1,
      stat2,
      b.connectedEngine?.label || 'NetZeroCalc Core',
      b.boardroomQuestions?.length || 0,
      b.actionPlan?.length || 0
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
}

/**
 * Format Full Boardroom Briefing Deck into publication-ready Markdown
 */
export function exportBoardroomBriefingMarkdown(briefId, enterpriseName = 'Enterprise Organization', reportingYear = 2026) {
  const brief = getBriefById(briefId) || CEO_STRATEGIC_BRIEFS[0];

  let md = `# EXECUTIVE BOARDROOM STRATEGIC BRIEF
**Document Classification:** Strictly Confidential — Board of Directors & Executive Committee  
**Prepared For:** ${enterpriseName}  
**Strategic Domain:** ${brief.categoryLabel}  
**Review Cycle:** FY${reportingYear} Corporate Governance & Capital Allocation  
**Platform Reference:** NetZeroCalc-AI Enterprise Intelligence Hub  
**Date:** ${new Date().toISOString().split('T')[0]}  

---

## 1. Executive Briefing Headline
### ${brief.title}
*${brief.subtitle}*

> ${brief.leadHeadline}

---

## 2. Key Empirical Metrics & Strategic Indicators
`;

  brief.stats?.forEach(stat => {
    md += `- **${stat.label}: ${stat.value}** — ${stat.desc}\n`;
  });

  md += `\n---

## 3. The Strategic Shift: Context & Imperative
`;

  brief.theShift?.paragraphs?.forEach(p => {
    md += `${p}\n\n`;
  });

  md += `---

## 4. Multi-Lens Strategic Evaluation Matrix
`;

  brief.threeLenses?.forEach((lens, idx) => {
    md += `### ${idx + 1}. ${lens.title}
${lens.description}
- **Strategic Takeaway:** ${lens.keyTakeaway}

`;
  });

  md += `---

## 5. In-Depth Strategic Analyses
`;

  brief.deepInsights?.forEach(insight => {
    md += `#### ${insight.title}
${insight.detail}

`;
  });

  md += `---

## 6. Boardroom & Audit Committee Decision Checklist
The following questions should be formally reviewed in the next Board Risk and Audit Committee session:

`;

  brief.boardroomQuestions?.forEach((q, idx) => {
    md += `[ ] **Question ${idx + 1}:** ${q}\n`;
  });

  md += `\n---

## 7. Executive Action Plan by Role
`;

  brief.actionPlan?.forEach(action => {
    md += `- **${action.role}:** ${action.action}\n`;
  });

  md += `\n---

## 8. Associated NetZeroCalc Enterprise Action Engine
- **Tool:** ${brief.connectedEngine?.label}
- **Actionable Scope:** ${brief.connectedEngine?.description}

================================================================================
END OF BOARDROOM STRATEGIC BRIEF · GENERATED BY NETZEROCALC ENTERPRISE
================================================================================
`;

  return md;
}
