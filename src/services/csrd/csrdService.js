/**
 * NetZeroCalc-AI — CSRD Double Materiality & ESRS Benchmark Service
 * Standards:
 * - EU Corporate Sustainability Reporting Directive (EU) 2022/2464
 * - European Sustainability Reporting Standards (ESRS Set 1 & Omnibus Simplification)
 * - EFRAG Double Materiality Guidelines (Impact Materiality + Financial Materiality)
 * - CEO Insights Brief 01: CSRD Benchmarking (Danish Global Brands Wave 1 Analysis)
 */

import {
  CSRD_DATAPOINTS,
  STANDARDS_ORDER,
  STANDARD_NAMES,
  COMPANY_TYPE_NOTES
} from '../../data/csrdDatapoints.js';

export { STANDARDS_ORDER, STANDARD_NAMES, COMPANY_TYPE_NOTES };

/**
 * 1. Double Materiality Scoring Evaluator
 * Materiality threshold: If either Impact Materiality (inside-out) >= 3 OR Financial Materiality (outside-in) >= 3,
 * the topic is deemed Material under the CSRD Double Materiality framework.
 */
export function evaluateDoubleMateriality(impactScore = 1, financialScore = 1, isPhaseIn = false) {
  const iScore = Math.max(1, Math.min(5, Number(impactScore) || 1));
  const fScore = Math.max(1, Math.min(5, Number(financialScore) || 1));

  if (isPhaseIn) {
    return {
      impactScore: iScore,
      financialScore: fScore,
      isMaterial: true,
      materialityStatus: 'phasein',
      rationale: 'Eligible for transitional phase-in relief (first 1–2 reporting years).'
    };
  }

  const isMaterial = iScore >= 3 || fScore >= 3;
  let rationale = 'Below materiality threshold for both impact and financial dimensions.';
  if (iScore >= 3 && fScore >= 3) {
    rationale = 'Double Material: High negative/positive impact AND high financial risk/opportunity.';
  } else if (iScore >= 3) {
    rationale = 'Impact Material: Significant outward impact on environment/society.';
  } else if (fScore >= 3) {
    rationale = 'Financial Material: Significant inward financial risk/opportunity to the business.';
  }

  return {
    impactScore: iScore,
    financialScore: fScore,
    isMaterial,
    materialityStatus: isMaterial ? 'material' : 'notmaterial',
    rationale
  };
}

/**
 * 2. Progress & Readiness Dashboard Metrics
 */
export function calculateCsrdProgress(materialityMap = {}, responsesMap = {}) {
  // ESRS 2 is always material by law
  const isStdMaterial = (std) => {
    if (std === 'ESRS 2') return true;
    const m = materialityMap[std];
    return m === 'material' || m === 'phasein' || (m && m.isMaterial);
  };

  const materialStds = STANDARDS_ORDER.filter(isStdMaterial);
  const materialDatapoints = CSRD_DATAPOINTS.filter(dp => isStdMaterial(dp.std));
  const totalDPs = materialDatapoints.length;

  let completedDPs = 0;
  let inProgressDPs = 0;
  let nonPhTotal = 0;
  let nonPhCompleted = 0;
  let csdddDirectDuplicates = 0;

  materialDatapoints.forEach(dp => {
    const resp = responsesMap[dp.id] || {};
    const isExplicitDone = resp.status === 'complete' || resp.status === 'na';
    const isExplicitInProg = resp.status === 'inprogress';
    const hasContent = (resp.narrative && resp.narrative.trim().length > 0) || (resp.quantValue !== undefined && resp.quantValue !== '');

    const isDone = isExplicitDone || (!isExplicitInProg && hasContent);
    const isInProg = isExplicitInProg || (!isDone && hasContent);

    if (isDone) completedDPs++;
    else if (isInProg) inProgressDPs++;

    if (dp.nonph) {
      nonPhTotal++;
      if (isDone) nonPhCompleted++;
    }

    if (dp.csddd === 'Direct duplicate') {
      csdddDirectDuplicates++;
    }
  });

  const completionPct = totalDPs > 0 ? Math.round((completedDPs / totalDPs) * 100) : 0;
  const nonPhOutstanding = nonPhTotal - nonPhCompleted;

  // Breakdown by standard
  const standardsBreakdown = STANDARDS_ORDER.map(std => {
    const dps = CSRD_DATAPOINTS.filter(dp => dp.std === std);
    const material = isStdMaterial(std);
    let done = 0;
    dps.forEach(dp => {
      const resp = responsesMap[dp.id];
      if (resp && (resp.status === 'complete' || resp.status === 'na' || resp.narrative || resp.quantValue)) {
        done++;
      }
    });
    return {
      std,
      name: STANDARD_NAMES[std] || std,
      totalCount: dps.length,
      completedCount: done,
      completionPct: dps.length > 0 ? Math.round((done / dps.length) * 100) : 0,
      isMaterial: material
    };
  });

  return {
    totalMaterialStandards: materialStds.length,
    totalMaterialDatapoints: totalDPs,
    completedDatapoints: completedDPs,
    inProgressDatapoints: inProgressDPs,
    notStartedDatapoints: totalDPs - completedDPs - inProgressDPs,
    completionPct,
    nonPhaseableTotal: nonPhTotal,
    nonPhaseableCompleted: nonPhCompleted,
    nonPhaseableOutstanding: nonPhOutstanding,
    csdddDirectDuplicates,
    standardsBreakdown
  };
}

/**
 * 3. Danish Global Brands CSRD Benchmark Analysis (Brief 01 Engine)
 * Reference: Wave 1 Danish global brands average 4.0 / 5.0 with 1.6-point spread between best and worst.
 */
export const DANISH_BENCHMARK_PILLARS = [
  {
    id: 'gov',
    name: 'Governance & Incentive Integration',
    esrs: 'ESRS 2 GOV-1, GOV-2',
    danishPeerAvg: 4.2,
    leaderScore: 4.8,
    description: 'Explicit linkage between executive remuneration and verified ESG targets.'
  },
  {
    id: 'strategy',
    name: 'Quantified Scenario Analysis',
    esrs: 'ESRS 2 SBM-3, E1-3',
    danishPeerAvg: 3.8,
    leaderScore: 4.7,
    description: 'Named reference climate scenarios with balance sheet quantified financial outcomes.'
  },
  {
    id: 'decarb',
    name: 'Decarbonization & 1.5°C Alignment',
    esrs: 'ESRS E1-1, E1-6, E1-8',
    danishPeerAvg: 4.5,
    leaderScore: 5.0,
    description: 'Gross Scope 1-3 SBTi validated targets with transparent Capex/Opex allocation.'
  },
  {
    id: 'nature',
    name: 'Nature & Biodiversity Scrutiny',
    esrs: 'ESRS E4-1 to E4-5',
    danishPeerAvg: 3.4,
    leaderScore: 4.2,
    description: 'TNFD-aligned LEAP assessment defending E4 materiality conclusions.'
  },
  {
    id: 'value_chain',
    name: 'Value Chain Due Diligence',
    esrs: 'ESRS S2, CSDDD Alignment',
    danishPeerAvg: 3.9,
    leaderScore: 4.6,
    description: 'Audited Tier 1-3 human rights and environmental risk assessment.'
  }
];

export function evaluateCsrdPeerBenchmark(companyScores = {}) {
  let totalCompanyScore = 0;
  let totalPeerScore = 0;

  const results = DANISH_BENCHMARK_PILLARS.map(p => {
    const userScore = companyScores[p.id] != null ? Number(companyScores[p.id]) : 3.5;
    totalCompanyScore += userScore;
    totalPeerScore += p.danishPeerAvg;
    const gap = userScore - p.danishPeerAvg;
    return {
      id: p.id,
      name: p.name,
      esrs: p.esrs,
      userScore: Number(userScore.toFixed(1)),
      danishPeerAvg: p.danishPeerAvg,
      leaderScore: p.leaderScore,
      gap: Number(gap.toFixed(1)),
      isOutperforming: gap >= 0
    };
  });

  const avgCompanyScore = Number((totalCompanyScore / DANISH_BENCHMARK_PILLARS.length).toFixed(1));
  const avgPeerScore = Number((totalPeerScore / DANISH_BENCHMARK_PILLARS.length).toFixed(1));
  const overallGap = Number((avgCompanyScore - avgPeerScore).toFixed(1));

  let statusBadge = 'Competitive';
  let recommendation = 'Your disclosure maturity aligns with the Danish peer benchmark (4.0/5.0). Focus on closing the gap in Nature E4 and scenario financial quantification.';
  if (avgCompanyScore >= 4.4) {
    statusBadge = 'Top Quartile Leader';
    recommendation = 'Exceptional readiness. Your statement demonstrates institutionalized governance and rigorous capital integration comparable to top global benchmarks.';
  } else if (avgCompanyScore < 3.5) {
    statusBadge = 'Vulnerable to Investor Scrutiny';
    recommendation = 'Significant spread visible against peer leaders. Investors and assurance providers will challenge unquantified scenario narratives and weak executive incentive linkages.';
  }

  return {
    avgCompanyScore,
    avgPeerScore,
    overallGap,
    statusBadge,
    recommendation,
    pillars: results
  };
}
