/**
 * NetZeroCalc-AI — EU CSRD Omnibus Simplification & CSDDD Due Diligence Service
 * Authoritative References:
 * - EU CSRD Omnibus Simplification Proposal (Feb 2025)
 * - Directive (EU) 2024/1760 (Corporate Sustainability Due Diligence Directive - CSDDD)
 * - Directive (EU) 2022/2464 (Corporate Sustainability Reporting Directive - CSRD)
 * - OECD Due Diligence Guidance for Responsible Business Conduct (6-Step Cycle)
 * - CEO Insights Brief 02: EU CSRD Omnibus Simplification (esg-hub.dk)
 */

// 1. Authoritative 11-Standard Omnibus Simplification Breakdown
export const OMNIBUS_STANDARDS_DATA = [
  {
    std: 'ESRS 2',
    full: 'General Disclosures',
    rows: 61,
    ret: 47,
    mod: 2,
    mov: 7,
    nw: 4,
    rem: 1,
    nsf: 0,
    csddd: 7,
    isBigThree: true,
    note: 'Foundation standard. MDR-P/A/M/T renamed to GDR-P/A/M/T and centralised here, removing near-identical blocks from all 11 topical standards. 7 DR codes renumbered. GOV-2 dissolved into GOV-1.'
  },
  {
    std: 'E1',
    full: 'Climate Change',
    rows: 49,
    ret: 44,
    mod: 2,
    mov: 1,
    nw: 2,
    rem: 0,
    nsf: 0,
    csddd: 3,
    isBigThree: true,
    note: 'Largest environment standard. Retains transition plan (E1-1), risk identification, resilience, and financial effects DRs. Highest compound-field density. 15 non-phaseable datapoints anchored to EU Climate Law and SFDR.'
  },
  {
    std: 'E2',
    full: 'Pollution',
    rows: 18,
    ret: 16,
    mod: 0,
    mov: 0,
    nw: 2,
    rem: 0,
    nsf: 0,
    csddd: 1,
    isBigThree: false,
    note: 'Shortest environmental standard. No incremental governance content. New NACE-sector scoping rule (AR5) adds routing logic splitting chemical-sector vs all-other-sectors pathways.'
  },
  {
    std: 'E3',
    full: 'Water',
    rows: 19,
    ret: 15,
    mod: 0,
    mov: 0,
    nw: 1,
    rem: 0,
    nsf: 3,
    csddd: 1,
    isBigThree: false,
    note: 'Title simplified from "Water and Marine Resources" to "Water". 3 sub-metrics unconfirmed. Marine-resources scope unresolved pending EFRAG Basis for Conclusions.'
  },
  {
    std: 'E4',
    full: 'Biodiversity & Ecosystems',
    rows: 24,
    ret: 19,
    mod: 0,
    mov: 1,
    nw: 4,
    rem: 0,
    nsf: 0,
    csddd: 1,
    isBigThree: false,
    note: 'Key architecture change: E4-5 prescribed quantitative metrics replaced by a flexible entity-specific framework with 4-category taxonomy. Critical for tools with hard-coded E4-5 fields.'
  },
  {
    std: 'E5',
    full: 'Resource Use & Circular Economy',
    rows: 22,
    ret: 15,
    mod: 1,
    mov: 3,
    nw: 2,
    rem: 0,
    nsf: 1,
    csddd: 1,
    isBigThree: false,
    note: 'E5-6 dissolved into ESRS 2 SBM-3. E5-4 scope narrowed from all materials to "key materials". New Critical Raw Materials Act flag per material.'
  },
  {
    std: 'S1',
    full: 'Own Workforce',
    rows: 58,
    ret: 44,
    mod: 5,
    mov: 3,
    nw: 1,
    rem: 2,
    nsf: 3,
    csddd: 8,
    isBigThree: true,
    note: 'Longest standard (16 DRs, was 17). Every DR from S1-2 onward renumbered by -1. Age distribution confirmed removed. H&S fatality scope narrowed to employees only. 8 non-phaseable datapoints.'
  },
  {
    std: 'S2',
    full: 'Workers in the Value Chain',
    rows: 17,
    ret: 10,
    mod: 0,
    mov: 3,
    nw: 2,
    rem: 0,
    nsf: 2,
    csddd: 9,
    isBigThree: false,
    note: '4 DRs (was 5). Supplier code of conduct elevated from guidance to mandatory non-phaseable DR. New HR incidents count (non-phaseable, SFDR-linked). Highest CSDDD overlap density (9 direct links).'
  },
  {
    std: 'S3',
    full: 'Affected Communities',
    rows: 15,
    ret: 9,
    mod: 1,
    mov: 3,
    nw: 0,
    rem: 0,
    nsf: 2,
    csddd: 9,
    isBigThree: false,
    note: '4 DRs (was 5). FPIC (Free, Prior and Informed Consent) engagement fully retained. AR8 explicitly adds land-rights/FPIC disputes as qualifying HR incidents.'
  },
  {
    std: 'S4',
    full: 'Consumers & End-Users',
    rows: 14,
    ret: 8,
    mod: 1,
    mov: 3,
    nw: 0,
    rem: 0,
    nsf: 2,
    csddd: 7,
    isBigThree: false,
    note: '4 DRs (was 5). Most templated social standard — approximately 90% identical structure to S2/S3. Product recall/withdrawal action disclosure status unconfirmed.'
  },
  {
    std: 'G1',
    full: 'Business Conduct',
    rows: 28,
    ret: 20,
    mod: 0,
    mov: 2,
    nw: 0,
    rem: 0,
    nsf: 6,
    csddd: 5,
    isBigThree: false,
    note: 'CRITICAL TRAP: G1-3 label changed from "Anti-corruption procedures" to "Targets related to business conduct" — same code, completely different content class. 6 NSF rows (highest count). Animal welfare policy status unconfirmed.'
  }
];

// 2. Summary Statistics for Omnibus
export const OMNIBUS_SUMMARY = {
  preOmnibusCount: 1100,
  postOmnibusClusters: 325,
  cutPercentage: 61,
  retainedExact: 71,
  retainedSimplified: 176,
  modified: 12,
  movedMerged: 26,
  newClusters: 18,
  confirmedRemoved: 3,
  noSuccessorFound: 19,
  nonPhaseableDatapoints: 41,
  bigThreeCount: 168, // ESRS 2 (61) + E1 (49) + S1 (58)
  bigThreePct: 51.7, // 168 / 325 = 51.7%
  csdddDirectOverlapClusters: 34
};

// 3. The 19 "No Successor Found" (NSF) Monitoring Watchlist
export const NSF_WATCHLIST = [
  { id: 'nsf_e3_1', std: 'E3', code: 'E3-4-03', title: 'Water discharge by destination quality', risk: 'Medium', note: 'Discharge breakdown metrics unconfirmed. Keep logging in draft.' },
  { id: 'nsf_e3_2', std: 'E3', code: 'E3-4-07', title: 'Marine resources spatial extraction intensity', risk: 'High', note: 'Pending clarification in EFRAG Basis for Conclusions.' },
  { id: 'nsf_e3_3', std: 'E3', code: 'E3-5-02', title: 'Water-stressed catchment financial exposure', risk: 'Medium', note: 'Financial risk calculation formula under technical review.' },
  { id: 'nsf_e5_1', std: 'E5', code: 'E5-5-04', title: 'Secondary raw materials content by product line', risk: 'Low', note: 'Replaced partially by Critical Raw Materials Act flag.' },
  { id: 'nsf_s1_1', std: 'S1', code: 'S1-7-04', title: 'Workforce age distribution by tier', risk: 'Confirmed Deleted', note: 'Age breakdown dropped in Omnibus; non-discrimination policy remains.' },
  { id: 'nsf_s1_2', std: 'S1', code: 'S1-14-06', title: 'Health & safety non-employee fatal incidents', risk: 'High', note: 'Contractor vs employee fatality reporting boundaries contested.' },
  { id: 'nsf_s1_3', std: 'S1', code: 'S1-16-03', title: 'Remuneration ratio highest-to-median across entities', risk: 'Medium', note: 'Consolidation method contested by Member States.' },
  { id: 'nsf_s2_1', std: 'S2', code: 'S2-2-05', title: 'Value chain worker channels for remediation', risk: 'High', note: 'Direct overlap with CSDDD Art. 11 complaints mechanism.' },
  { id: 'nsf_s2_2', std: 'S2', code: 'S2-4-03', title: 'Value chain living wage gap quantification', risk: 'High', note: 'Quantification methodology pending EU guidance.' },
  { id: 'nsf_s3_1', std: 'S3', code: 'S3-2-04', title: 'Indigenous peoples FPIC dispute resolution registry', risk: 'High', note: 'AR8 land-rights dispute coverage requires audit logging.' },
  { id: 'nsf_s3_2', std: 'S3', code: 'S3-4-02', title: 'Community displacement compensation escrow', risk: 'Medium', note: 'Merged into general adverse impact mitigation.' },
  { id: 'nsf_s4_1', std: 'S4', code: 'S4-2-04', title: 'End-user privacy grievance escalation tracking', risk: 'Medium', note: 'Overlaps with GDPR supervisory notifications.' },
  { id: 'nsf_s4_2', std: 'S4', code: 'S4-4-03', title: 'Product recall & voluntary withdrawal actions', risk: 'High', note: 'Mandatory vs voluntary disclosure status pending.' },
  { id: 'nsf_g1_1', std: 'G1', code: 'G1-1-05', title: 'Animal welfare policy and supply chain audits', risk: 'Medium', note: 'Agri-food sector specific requirement unconfirmed.' },
  { id: 'nsf_g1_2', std: 'G1', code: 'G1-2-04', title: 'Whistleblower protection retaliation cases count', risk: 'High', note: 'Whistleblower Directive (EU) 2019/1937 cross-link pending.' },
  { id: 'nsf_g1_3', std: 'G1', code: 'G1-3-01', title: 'Anti-corruption training completion by risk tier', risk: 'CRITICAL TRAP', note: 'G1-3 renamed to "Targets". Training shifted to G1-1 or entity-specific.' },
  { id: 'nsf_g1_4', std: 'G1', code: 'G1-4-03', title: 'Fines paid for corrupt practices / settlements', risk: 'High', note: 'Material litigation disclosure threshold pending.' },
  { id: 'nsf_g1_5', std: 'G1', code: 'G1-5-02', title: 'Political contributions and lobbying expenditure', risk: 'High', note: 'Transparency register alignment under revision.' },
  { id: 'nsf_g1_6', std: 'G1', code: 'G1-6-04', title: 'Payment practice average days to SME suppliers', risk: 'High', note: 'Late Payment Regulation interaction unresolved.' }
];

// 4. CSDDD Scope Evaluator
export function evaluateCsdddScope({
  companyType = 'eu',
  employees = 0,
  turnoverM = 0,
  euTurnoverM = 0,
  royaltiesM = 0,
  franchiseTurnoverM = 0
}) {
  const emp = Number(employees) || 0;
  const to = Number(turnoverM) || 0;
  const euTo = Number(euTurnoverM) || 0;
  const roy = Number(royaltiesM) || 0;
  const franTo = Number(franchiseTurnoverM) || 0;

  let inScope = false;
  let band = 'Out of scope';
  let date = 'N/A';
  let legalCitation = 'Directive (EU) 2024/1760 Art. 2 & 37';
  let reason = 'Company thresholds fall below CSDDD mandatory application limits.';
  let thresholdMargin = 0;

  if (companyType === 'eu') {
    // EU Company Group 1 (First Wave: 26 July 2028)
    if (emp > 5000 && to > 1500) {
      inScope = true;
      band = 'First Wave (Wave 1)';
      date = '26 July 2028';
      reason = 'EU entity exceeding 5,000 employees and €1,500M net worldwide turnover.';
      legalCitation = 'CSDDD Directive (EU) 2024/1760 Art. 2(1)(a) & Art. 37(1)(a)';
      thresholdMargin = Math.min((emp - 5000) / 5000, (to - 1500) / 1500) * 100;
    }
    // EU Company Group 2 (General Scope: 26 July 2029)
    else if (emp > 1000 && to > 450) {
      inScope = true;
      band = 'General Scope (Wave 2)';
      date = '26 July 2029';
      reason = 'EU entity exceeding 1,000 employees and €450M net worldwide turnover.';
      legalCitation = 'CSDDD Directive (EU) 2024/1760 Art. 2(1)(b) & Art. 37(1)(b)';
      thresholdMargin = Math.min((emp - 1000) / 1000, (to - 450) / 450) * 100;
    } else {
      inScope = false;
      band = 'Out of direct CSDDD scope';
      date = 'Exempt';
      reason = `EU company with ${emp} employees and €${to}M turnover does not meet direct thresholds (Min: 1,000 emp & €450M). Note: May still face indirect supply chain pass-through duties.`;
    }
  } else if (companyType === 'non-eu') {
    // Non-EU Company Group 1 (First Wave: 26 July 2028)
    if (euTo > 1500) {
      inScope = true;
      band = 'First Wave (Wave 1)';
      date = '26 July 2028';
      reason = 'Non-EU parent/group generating over €1,500M net turnover in the European Union.';
      legalCitation = 'CSDDD Directive (EU) 2024/1760 Art. 2(2)(a) & Art. 37(1)(a)';
      thresholdMargin = ((euTo - 1500) / 1500) * 100;
    }
    // Non-EU Company Group 2 (General Scope: 26 July 2029)
    else if (euTo > 450) {
      inScope = true;
      band = 'General Scope (Wave 2)';
      date = '26 July 2029';
      reason = 'Non-EU parent/group generating over €450M net turnover in the European Union.';
      legalCitation = 'CSDDD Directive (EU) 2024/1760 Art. 2(2)(b) & Art. 37(1)(b)';
      thresholdMargin = ((euTo - 450) / 450) * 100;
    } else {
      inScope = false;
      band = 'Out of direct CSDDD scope';
      date = 'Exempt';
      reason = `Non-EU entity with €${euTo}M EU turnover falls below the €450M EU turnover threshold.`;
    }
  } else {
    // Franchise & Licensing Route
    if (roy > 22.5 && franTo > 80) {
      inScope = true;
      band = 'Franchise/Licensing Route';
      date = '26 July 2029';
      reason = 'Company exceeding €22.5M in royalties and €80M in EU net franchise/licensing turnover.';
      legalCitation = 'CSDDD Directive (EU) 2024/1760 Art. 2(1)(c) & Art. 2(2)(c)';
      thresholdMargin = Math.min((roy - 22.5) / 22.5, (franTo - 80) / 80) * 100;
    } else {
      inScope = false;
      band = 'Out of direct CSDDD scope';
      date = 'Exempt';
      reason = `Royalties (€${roy}M) or franchise turnover (€${franTo}M) do not meet the dual threshold (>€22.5M royalties & >€80M EU turnover).`;
    }
  }

  return {
    inScope,
    band,
    date,
    reason,
    legalCitation,
    thresholdMargin: Number(thresholdMargin.toFixed(1)),
    companyType,
    inputs: { employees: emp, turnoverM: to, euTurnoverM: euTo, royaltiesM: roy, franchiseTurnoverM: franTo }
  };
}

// 5. OECD 6-Step Due Diligence Framework & Checklist
export const CSDDD_6_STEPS = [
  {
    step: 1,
    title: 'Embed Due Diligence into Policies & Management Systems',
    article: 'Art. 5 CSDDD',
    oecdStep: 'Step 1: Embed Responsible Business Conduct',
    description: 'Adopt and regularly update a corporate due diligence policy developed in consultation with employees and stakeholders.',
    requirements: [
      { id: 'dd_1_1', text: 'Written due diligence policy approved by the Board of Directors', standard: 'ESRS 2 GDR-P' },
      { id: 'dd_1_2', text: 'Code of Conduct describing rules and principles applicable across subsidiaries and business partners', standard: 'ESRS S2-1 / G1-1' },
      { id: 'dd_1_3', text: 'Documented processes to implement due diligence and integrate into corporate operational controls', standard: 'ESRS 2 SBM-2' },
      { id: 'dd_1_4', text: 'Annual policy review process with verified board oversight minutes', standard: 'ESRS 2 GOV-1' }
    ]
  },
  {
    step: 2,
    title: 'Identify & Assess Adverse Human Rights & Environmental Impacts',
    article: 'Art. 8 CSDDD',
    oecdStep: 'Step 2: Identify and Assess Adverse Impacts',
    description: 'Map operations, subsidiaries, and value chain business partners to identify actual and potential adverse impacts.',
    requirements: [
      { id: 'dd_2_1', text: 'Dynamic mapping of own operations and upstream/downstream value chain to pinpoint risk hotspots', standard: 'ESRS 2 IRO-1' },
      { id: 'dd_2_2', text: 'In-depth assessment of severe human rights impacts (forced labor, child labor, union freedom, health/safety)', standard: 'ESRS S1-1 / S2-2' },
      { id: 'dd_2_3', text: 'In-depth assessment of adverse environmental impacts (GHG, pollution, water depletion, deforestation, biodiversity)', standard: 'ESRS E1-9 to E5-3' },
      { id: 'dd_2_4', text: 'Multi-factor risk prioritization based on Severity (scale, scope, irremediable character) and Likelihood', standard: 'ESRS 2 IRO-1 (AR14)' }
    ]
  },
  {
    step: 3,
    title: 'Prevent, Mitigate & Cease Potential & Actual Adverse Impacts',
    article: 'Arts. 7 & 9 CSDDD',
    oecdStep: 'Step 3: Cease, Prevent or Mitigate Adverse Impacts',
    description: 'Develop and implement prevention action plans, obtain contractual assurances, and make necessary CapEx/OpEx investments.',
    requirements: [
      { id: 'dd_3_1', text: 'Time-bound Prevention Action Plan with designated owners, quantitative milestones, and board signoff', standard: 'ESRS 2 GDR-A' },
      { id: 'dd_3_2', text: 'Contractual assurances with direct business partners (Model Contractual Clauses, Art. 19)', standard: 'ESRS S2-4' },
      { id: 'dd_3_3', text: 'Financial, operational, or technical support for SME suppliers where compliance would jeopardize viability', standard: 'CSDDD Art. 7(2)(e)' },
      { id: 'dd_3_4', text: 'Responsible disengagement protocol as a last-resort measure when mitigation fails', standard: 'CSDDD Art. 7(6)' }
    ]
  },
  {
    step: 4,
    title: 'Remediate Actual Adverse Impacts',
    article: 'Art. 10 CSDDD',
    oecdStep: 'Step 4: Track Implementation and Results',
    description: 'Provide full financial or non-financial remediation where the company caused or contributed to an adverse impact.',
    requirements: [
      { id: 'dd_4_1', text: 'Formal remediation mechanism restoring affected persons to the state they would have been in', standard: 'ESRS S1-17 / S2-5' },
      { id: 'dd_4_2', text: 'Financial compensation and non-financial restitution procedures (apologies, reinstatement, clean-up)', standard: 'CSDDD Art. 10(1)' },
      { id: 'dd_4_3', text: 'Independent third-party verification of remediation adequacy in high-severity incidents', standard: 'ESRS S3-5' }
    ]
  },
  {
    step: 5,
    title: 'Stakeholder Engagement & Complaints Mechanism',
    article: 'Arts. 11 & 14 CSDDD',
    oecdStep: 'Step 5: Provide for or Cooperate in Remediation',
    description: 'Provide an accessible notification/complaints procedure and conduct meaningful stakeholder consultation at all stages.',
    requirements: [
      { id: 'dd_5_1', text: 'Accessible, confidential notification and grievance mechanism for workers, trade unions, and civil society', standard: 'ESRS 2 SBM-2 / S1-3' },
      { id: 'dd_5_2', text: 'Protection protocols shielding whistleblowers and complainants against retaliation or dismissal', standard: 'ESRS G1-2' },
      { id: 'dd_5_3', text: 'Documented stakeholder consultations during impact identification and action plan drafting', standard: 'ESRS 2 SBM-2 (AR12)' },
      { id: 'dd_5_4', text: 'Regular reporting back to complainants on follow-up investigations and resolution timelines', standard: 'CSDDD Art. 14(4)' }
    ]
  },
  {
    step: 6,
    title: 'Monitor Effectiveness & Publicly Report',
    article: 'Art. 13 CSDDD',
    oecdStep: 'Step 6: Communicate How Impacts are Addressed',
    description: 'Conduct annual reviews of due diligence measures and publish an annual statement satisfying CSRD limited assurance.',
    requirements: [
      { id: 'dd_6_1', text: 'Annual assessment of the effectiveness of identification, prevention, and remediation measures', standard: 'ESRS 2 GDR-M' },
      { id: 'dd_6_2', text: 'Corporate due diligence disclosures integrated into the CSRD Management Report under ESRS', standard: 'Directive 2022/2464' },
      { id: 'dd_6_3', text: 'Audit trail documentation maintained for at least 5 years ready for National Supervisory Authority inspection', standard: 'CSDDD Art. 18' }
    ]
  }
];

// 6. The 34 CSRD / CSDDD Direct Duplicate Datapoint Bridge
export const CSDDD_CSRD_BRIDGE_DATA = [
  // ESRS 2 General Disclosures (7 links)
  {
    id: 'br_1',
    csrdId: 'ESRS 2 GDR-P',
    std: 'ESRS 2',
    name: 'Policies adopted to manage material sustainability matters',
    csdddArticle: 'Art. 5(1)',
    csdddRequirement: 'Adoption and integration of due diligence policy into corporate strategies',
    synergyValue: '100% Shared Document: Board-approved CSDDD policy directly satisfies GDR-P disclosure.',
    status: 'Ready to populate'
  },
  {
    id: 'br_2',
    csrdId: 'ESRS 2 GDR-A',
    std: 'ESRS 2',
    name: 'Actions and resources in relation to material sustainability matters',
    csdddArticle: 'Art. 7(2)',
    csdddRequirement: 'Prevention and corrective action plans including CapEx/OpEx allocation',
    synergyValue: '100% Shared Data: CSDDD Action Plan translates directly to CSRD resource allocation disclosures.',
    status: 'Ready to populate'
  },
  {
    id: 'br_3',
    csrdId: 'ESRS 2 GDR-M',
    std: 'ESRS 2',
    name: 'Tracking effectiveness of policies and actions',
    csdddArticle: 'Art. 13',
    csdddRequirement: 'Annual periodic assessments of due diligence effectiveness',
    synergyValue: '100% Shared Process: Annual CSDDD evaluation report serves as the CSRD effectiveness evidence.',
    status: 'Ready to populate'
  },
  {
    id: 'br_4',
    csrdId: 'ESRS 2 GDR-T',
    std: 'ESRS 2',
    name: 'Tracking effectiveness of policies and actions through targets',
    csdddArticle: 'Art. 7(2)(a)',
    csdddRequirement: 'Measurable, time-bound qualitative and quantitative operational targets',
    synergyValue: 'Direct metric linkage: CSDDD key performance indicators fulfill GDR-T requirements.',
    status: 'Ready to populate'
  },
  {
    id: 'br_5',
    csrdId: 'ESRS 2 SBM-2',
    std: 'ESRS 2',
    name: 'Interests and views of stakeholders',
    csdddArticle: 'Art. 11',
    csdddRequirement: 'Meaningful engagement with affected stakeholders throughout the due diligence cycle',
    synergyValue: 'Shared consultation record: Trade union and worker engagement minutes populate SBM-2.',
    status: 'Ready to populate'
  },
  {
    id: 'br_6',
    csrdId: 'ESRS 2 IRO-1',
    std: 'ESRS 2',
    name: 'Description of processes to identify material impacts, risks, and opportunities',
    csdddArticle: 'Art. 8',
    csdddRequirement: 'Identification and mapping of actual and potential adverse impacts',
    synergyValue: 'Shared Methodology: CSDDD value chain risk mapping forms the factual basis of IRO-1.',
    status: 'Ready to populate'
  },
  {
    id: 'br_7',
    csrdId: 'ESRS 2 GOV-1',
    std: 'ESRS 2',
    name: 'Role of the administrative, management and supervisory bodies',
    csdddArticle: 'Art. 5(3) & 26',
    csdddRequirement: 'Oversight responsibility of directors for due diligence implementation',
    synergyValue: 'Shared Governance: Board oversight charters satisfy both directives simultaneously.',
    status: 'Ready to populate'
  },

  // E1 Climate Change (3 links)
  {
    id: 'br_8',
    csrdId: 'ESRS E1-1',
    std: 'E1',
    name: 'Transition plan for climate change mitigation',
    csdddArticle: 'Art. 22',
    csdddRequirement: 'Adoption and implementation of a climate transition plan aligned with Paris 1.5°C',
    synergyValue: 'Core Legal Equivalent: CSDDD Art. 22 mandates the exact same 1.5°C transition plan as E1-1.',
    status: 'Ready to populate'
  },
  {
    id: 'br_9',
    csrdId: 'ESRS E1-3',
    std: 'E1',
    name: 'Actions and resources in relation to climate change policies',
    csdddArticle: 'Art. 22(1)(d)',
    csdddRequirement: 'Financial resources and CapEx allocated to transition plan implementation',
    synergyValue: 'Direct financial alignment: CapEx roadmap populates E1-3 financial allocation tables.',
    status: 'Ready to populate'
  },
  {
    id: 'br_10',
    csrdId: 'ESRS E1-4',
    std: 'E1',
    name: 'Targets related to climate change mitigation and adaptation',
    csdddArticle: 'Art. 22(1)(b)',
    csdddRequirement: 'Absolute emission reduction targets for 2030 and five-year steps up to 2050',
    synergyValue: 'Scope 1-3 target parity: NetZeroCalc SBTi module exports populate both simultaneously.',
    status: 'Ready to populate'
  },

  // E2 to E5 Environment Topical (4 links)
  {
    id: 'br_11',
    csrdId: 'ESRS E2-1',
    std: 'E2',
    name: 'Policies related to pollution prevention and control',
    csdddArticle: 'Annex Part II (Env)',
    csdddRequirement: 'Prevention of unlawful air, water, and soil pollution under EU conventions',
    synergyValue: 'Shared compliance policy: Environmental due diligence protocols satisfy E2-1.',
    status: 'Ready to populate'
  },
  {
    id: 'br_12',
    csrdId: 'ESRS E3-1',
    std: 'E3',
    name: 'Policies related to water and marine resources',
    csdddArticle: 'Annex Part II (Water)',
    csdddRequirement: 'Due diligence on water abstraction and wastewater discharge impacts',
    synergyValue: 'Shared catchment assessment: Water stewardship reports populate E3-1 directly.',
    status: 'Ready to populate'
  },
  {
    id: 'br_13',
    csrdId: 'ESRS E4-1',
    std: 'E4',
    name: 'Transition plan and policies on biodiversity and ecosystems',
    csdddArticle: 'Annex Part II (Bio)',
    csdddRequirement: 'Prevention of deforestation, habitat destruction, and biodiversity loss',
    synergyValue: 'Shared LEAP / TNFD assessment: Supply chain biodiversity diligence satisfies E4-1.',
    status: 'Ready to populate'
  },
  {
    id: 'br_14',
    csrdId: 'ESRS E5-1',
    std: 'E5',
    name: 'Policies related to resource use and circular economy',
    csdddArticle: 'Annex Part II (Waste)',
    csdddRequirement: 'Adverse impact diligence on hazardous waste and Basel Convention compliance',
    synergyValue: 'Shared waste management logs: Hazardous waste shipment data populates E5-1.',
    status: 'Ready to populate'
  },

  // S1 Own Workforce (8 links)
  {
    id: 'br_15',
    csrdId: 'ESRS S1-1',
    std: 'S1',
    name: 'Policies related to own workforce',
    csdddArticle: 'Annex Part I (HR)',
    csdddRequirement: 'Compliance with core ILO conventions on worker rights in own operations',
    synergyValue: 'Universal labor standard: HR policies satisfy both frameworks with zero duplication.',
    status: 'Ready to populate'
  },
  {
    id: 'br_16',
    csrdId: 'ESRS S1-2',
    std: 'S1',
    name: 'Processes for engaging with own workers and workers representatives',
    csdddArticle: 'Art. 11',
    csdddRequirement: 'Consultation with trade unions and works councils on due diligence measures',
    synergyValue: 'Shared works council records: Social dialogue minutes populate S1-2.',
    status: 'Ready to populate'
  },
  {
    id: 'br_17',
    csrdId: 'ESRS S1-3',
    std: 'S1',
    name: 'Processes to remediate negative impacts and channels for own workers',
    csdddArticle: 'Art. 14',
    csdddRequirement: 'Internal operational grievance and complaints mechanism',
    synergyValue: 'Identical grievance facility: Channel statistics and case logs populate S1-3 directly.',
    status: 'Ready to populate'
  },
  {
    id: 'br_18',
    csrdId: 'ESRS S1-4',
    std: 'S1',
    name: 'Taking action on material impacts and effectiveness of actions',
    csdddArticle: 'Art. 7(2)',
    csdddRequirement: 'Internal corrective action programs for workplace violations',
    synergyValue: 'Shared action tracking: S1 internal audit logs fulfill S1-4 requirements.',
    status: 'Ready to populate'
  },
  {
    id: 'br_19',
    csrdId: 'ESRS S1-14',
    std: 'S1',
    name: 'Health and safety indicators',
    csdddArticle: 'Annex Part I (OSH)',
    csdddRequirement: 'Due diligence on safe and healthy working conditions under ILO 155',
    synergyValue: 'Shared OSH audit data: Incident frequency rates and fatality logs populate S1-14.',
    status: 'Ready to populate'
  },
  {
    id: 'br_20',
    csrdId: 'ESRS S1-16',
    std: 'S1',
    name: 'Remuneration metrics (fair wage and living wage)',
    csdddArticle: 'Annex Part I (Wage)',
    csdddRequirement: 'Adequate living wage assessments for employees and outsourced staff',
    synergyValue: 'Shared payroll benchmark: Living wage gap assessments satisfy S1-16.',
    status: 'Ready to populate'
  },
  {
    id: 'br_21',
    csrdId: 'ESRS S1-17',
    std: 'S1',
    name: 'Severe human rights incidents and complaints',
    csdddArticle: 'Art. 10',
    csdddRequirement: 'Tracking and remediating actual severe human rights violations',
    synergyValue: 'Shared incident register: Remediation case outcomes directly satisfy S1-17.',
    status: 'Ready to populate'
  },
  {
    id: 'br_22',
    csrdId: 'ESRS S1-8',
    std: 'S1',
    name: 'Collective bargaining coverage and social dialogue',
    csdddArticle: 'Annex Part I (FOA)',
    csdddRequirement: 'Respect for freedom of association and collective bargaining under ILO 87 & 98',
    synergyValue: 'Shared collective agreement data: Bargaining percentage logs populate S1-8.',
    status: 'Ready to populate'
  },

  // S2 Workers in the Value Chain (9 links — Highest Overlap Density)
  {
    id: 'br_23',
    csrdId: 'ESRS S2-1',
    std: 'S2',
    name: 'Policies related to value chain workers (Supplier Code of Conduct)',
    csdddArticle: 'Art. 5(1)(b)',
    csdddRequirement: 'Supplier Code of Conduct describing rules and safeguards applied across tiers',
    synergyValue: '100% Direct Duplicate: Mandatory S2-1 Supplier Code of Conduct is the core CSDDD instrument.',
    status: 'Ready to populate'
  },
  {
    id: 'br_24',
    csrdId: 'ESRS S2-2',
    std: 'S2',
    name: 'Processes for engaging with value chain workers about impacts',
    csdddArticle: 'Art. 11',
    csdddRequirement: 'Worker consultation in upstream supply chain facilities and audit sites',
    synergyValue: 'Shared worker voice data: Third-party supplier worker interviews populate S2-2.',
    status: 'Ready to populate'
  },
  {
    id: 'br_25',
    csrdId: 'ESRS S2-3',
    std: 'S2',
    name: 'Processes to remediate negative impacts and channels for value chain workers',
    csdddArticle: 'Art. 14',
    csdddRequirement: 'Multi-stakeholder external grievance mechanism open to value chain workers',
    synergyValue: '100% Direct Duplicate: External supplier worker hotline satisfies both directives.',
    status: 'Ready to populate'
  },
  {
    id: 'br_26',
    csrdId: 'ESRS S2-4',
    std: 'S2',
    name: 'Taking action on material impacts on value chain workers',
    csdddArticle: 'Art. 7(2)(b) & 19',
    csdddRequirement: 'Contractual assurances, supplier training, and collaborative remediation',
    synergyValue: 'Shared corrective action log: Supplier Corrective Action Plans (CAPs) populate S2-4.',
    status: 'Ready to populate'
  },
  {
    id: 'br_27',
    csrdId: 'ESRS S2-5',
    std: 'S2',
    name: 'Severe human rights incidents in the value chain',
    csdddArticle: 'Art. 10',
    csdddRequirement: 'Remediation and financial compensation provided for value chain harms',
    synergyValue: '100% Shared Register: Supplier incident tracking feeds directly into S2-5 table.',
    status: 'Ready to populate'
  },

  // S3 Affected Communities (1 link)
  {
    id: 'br_28',
    csrdId: 'ESRS S3-1',
    std: 'S3',
    name: 'Policies related to affected communities (FPIC & Land Rights)',
    csdddArticle: 'Annex Part I (Land)',
    csdddRequirement: 'Prohibition of unlawful land acquisition and respect for Indigenous FPIC rights',
    synergyValue: 'Shared land-rights policy: Community engagement protocols populate S3-1.',
    status: 'Ready to populate'
  },

  // S4 Consumers & End-Users (1 link)
  {
    id: 'br_29',
    csrdId: 'ESRS S4-1',
    std: 'S4',
    name: 'Policies related to consumers and end-users',
    csdddArticle: 'Annex Part I (Life)',
    csdddRequirement: 'Due diligence preventing adverse impacts on life, health, and consumer safety',
    synergyValue: 'Shared safety management: Product safety assurance files populate S4-1.',
    status: 'Ready to populate'
  },

  // G1 Business Conduct (5 links)
  {
    id: 'br_30',
    csrdId: 'ESRS G1-1',
    std: 'G1',
    name: 'Corporate culture and business conduct policies',
    csdddArticle: 'Art. 5',
    csdddRequirement: 'Integration of ethical conduct, human rights, and sustainability values',
    synergyValue: 'Shared ethics code: Corporate Code of Conduct satisfies G1-1.',
    status: 'Ready to populate'
  },
  {
    id: 'br_31',
    csrdId: 'ESRS G1-2',
    std: 'G1',
    name: 'Management of relationships with suppliers',
    csdddArticle: 'Arts. 7, 8, 19',
    csdddRequirement: 'Due diligence terms in procurement contracts and supplier onboarding checks',
    synergyValue: 'Shared procurement system: Responsible sourcing rules populate G1-2.',
    status: 'Ready to populate'
  },
  {
    id: 'br_32',
    csrdId: 'ESRS G1-3',
    std: 'G1',
    name: 'Targets related to business conduct (CHANGED FROM ANTI-CORRUPTION PROCEDURES)',
    csdddArticle: 'Art. 7(2)(a)',
    csdddRequirement: 'Quantitative targets for supplier code compliance and risk mitigation',
    synergyValue: 'Alert: Avoid legacy anti-corruption procedures; align with CSDDD quantifiable targets.',
    status: 'Ready to populate'
  },
  {
    id: 'br_33',
    csrdId: 'ESRS G1-4',
    std: 'G1',
    name: 'Prevention and detection of corruption or bribery',
    csdddArticle: 'Annex Part I',
    csdddRequirement: 'Anti-corruption controls preventing illicit financial flows and bribery in supply chain',
    synergyValue: 'Shared anti-bribery audits: Foreign Corrupt Practices & bribery logs satisfy G1-4.',
    status: 'Ready to populate'
  },
  {
    id: 'br_34',
    csrdId: 'ESRS G1-6',
    std: 'G1',
    name: 'Payment practices (Fair treatment of SME suppliers)',
    csdddArticle: 'Art. 7(2)(e)',
    csdddRequirement: 'Fair commercial terms ensuring supplier compliance does not cause insolvency',
    synergyValue: 'Shared invoice aging data: SME payment timeliness disclosures satisfy G1-6.',
    status: 'Ready to populate'
  }
];

// 7. CSDDD Risk Scoring Engine
export function calculateCsdddRiskScore({
  severity = 1,
  likelihood = 1,
  urgency = 1,
  control = 1,
  desc = '',
  category = 'human_rights',
  supplierId = ''
}) {
  const sev = Math.max(1, Math.min(5, Number(severity) || 1));
  const lik = Math.max(1, Math.min(5, Number(likelihood) || 1));
  const urg = Math.max(1, Math.min(3, Number(urgency) || 1));
  const ctl = Math.max(1, Math.min(3, Number(control) || 1));

  // Statutory CSDDD Formula: (Severity * Likelihood) + Urgency - Control
  const score = (sev * lik) + urg - ctl;

  let level = { label: 'Low', cls: 'emerald', action: 'Monitor and review periodically in annual audit cycle.' };
  if (score >= 16) {
    level = { label: 'Critical', cls: 'rose', action: 'Immediate board escalation, corrective prevention plan, and executive notification.' };
  } else if (score >= 10) {
    level = { label: 'High', cls: 'amber', action: 'Prioritise for senior management oversight and time-bound remediation plan.' };
  } else if (score >= 6) {
    level = { label: 'Medium', cls: 'yellow', action: 'Implement targeted supplier corrective action and monitor at next audit cycle.' };
  }

  return {
    score,
    level,
    severity: sev,
    likelihood: lik,
    urgency: urg,
    control: ctl,
    desc,
    category,
    supplierId,
    calculatedAt: new Date().toISOString()
  };
}

// 8. CSDDD Due Diligence Overall Maturity Evaluator
export function evaluateDueDiligenceReadiness(checkedRequirements = {}) {
  let totalReqs = 0;
  let completedReqs = 0;

  const stepBreakdown = CSDDD_6_STEPS.map(s => {
    const totalInStep = s.requirements.length;
    let completedInStep = 0;

    s.requirements.forEach(r => {
      totalReqs++;
      if (checkedRequirements[r.id]) {
        completedReqs++;
        completedInStep++;
      }
    });

    const pct = totalInStep > 0 ? Math.round((completedInStep / totalInStep) * 100) : 0;
    return {
      step: s.step,
      title: s.title,
      article: s.article,
      totalInStep,
      completedInStep,
      pct,
      status: pct === 100 ? 'Audit Ready' : pct >= 50 ? 'In Progress' : 'Action Required'
    };
  });

  const overallPct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

  let maturityTier = 'Initial (Ad-hoc)';
  let advice = 'Establish baseline due diligence policies and start mapping Tier 1 suppliers.';
  if (overallPct >= 85) {
    maturityTier = 'Advanced (Audit Ready)';
    advice = 'Ready for National Supervisory Authority inspection and CSRD limited assurance verification.';
  } else if (overallPct >= 50) {
    maturityTier = 'Operational (In Progress)';
    advice = 'Core policies active. Prioritize formal grievance mechanisms and contractual assurances.';
  }

  return {
    totalRequirements: totalReqs,
    completedRequirements: completedReqs,
    overallPct,
    maturityTier,
    advice,
    stepBreakdown
  };
}

// 9. Art. 22 Climate Transition Plan Evaluator
export function evaluateTransitionPlanArt22(planData = {}, ghgData = {}) {
  const has15Goal = Boolean(planData.has15Goal);
  const hasTargets2030 = Boolean(planData.hasTargets2030);
  const hasScope3Target = Boolean(planData.hasScope3Target);
  const hasCapexAllocated = Boolean(planData.hasCapexAllocated);
  const hasBoardOversight = Boolean(planData.hasBoardOversight);

  const checklist = [
    { key: 'has15Goal', label: 'Explicit 1.5°C Paris Agreement alignment objective', passed: has15Goal },
    { key: 'hasTargets2030', label: 'Absolute Scope 1 & 2 GHG reduction targets for 2030 (minimum -42%)', passed: hasTargets2030 },
    { key: 'hasScope3Target', label: 'Material Scope 3 reduction targets covering value chain hotspots', passed: hasScope3Target },
    { key: 'hasCapexAllocated', label: 'Quantified CapEx and OpEx allocated to decarbonization measures', passed: hasCapexAllocated },
    { key: 'hasBoardOversight', label: 'Executive remuneration tied to climate target achievement', passed: hasBoardOversight }
  ];

  const passedCount = checklist.filter(c => c.passed).length;
  const isArt22Compliant = passedCount === 5;
  const complianceScore = Math.round((passedCount / checklist.length) * 100);

  // Link to corporate GHG inventory if present
  const totalEmissionsTons = ghgData?.totalTons || 0;
  const scope1Tons = ghgData?.scope1Tons || 0;
  const scope2MbTons = ghgData?.scope2MbTons || 0;
  const scope3Tons = ghgData?.scope3Tons || 0;

  return {
    checklist,
    passedCount,
    totalItems: checklist.length,
    complianceScore,
    isArt22Compliant,
    corporateGhg: {
      totalEmissionsTons,
      scope1Tons,
      scope2MbTons,
      scope3Tons
    }
  };
}

// 10. Default Workspace & Export Utilities
export function createDefaultCsdddWorkspace() {
  return {
    schema_version: '1.1.0',
    last_modified: new Date().toISOString(),
    scopeCheck: null,
    dueDiligenceChecks: {
      dd_1_1: true,
      dd_1_2: true,
      dd_2_1: true,
      dd_6_2: true
    },
    suppliers: [
      { id: 'sup_1', name: 'Alps Precision Components', country: 'Germany', tier: 'Tier 1', sector: 'Machinery & Metals', score: 6, status: 'Monitored', contractualClause: true, grievanceAccess: true },
      { id: 'sup_2', name: 'Mekong Polymer Solutions', country: 'Vietnam', tier: 'Tier 2', sector: 'Chemicals & Plastics', score: 18, status: 'Mitigation plan active', contractualClause: true, grievanceAccess: false },
      { id: 'sup_3', name: 'Cerrado Agriculture Co-op', country: 'Brazil', tier: 'Raw Materials (Tier N)', sector: 'Agriculture & Food', score: 12, status: 'Under review', contractualClause: false, grievanceAccess: false },
      { id: 'sup_4', name: 'Silesian Assembly Sp. z o.o.', country: 'Poland', tier: 'Tier 1', sector: 'Electronics & Assembly', score: 4, status: 'Monitored', contractualClause: true, grievanceAccess: true }
    ],
    risks: [
      {
        id: 'r_1',
        desc: 'Unverified overtime hours and high ambient temperatures in tier-2 molding workshop',
        category: 'human_rights',
        supplierId: 'sup_2',
        severity: 4,
        likelihood: 4,
        urgency: 3,
        control: 1,
        score: 18,
        createdAt: new Date().toISOString()
      },
      {
        id: 'r_2',
        desc: 'Potential native vegetation clearance in soy/palm oil buffer zones',
        category: 'environmental',
        supplierId: 'sup_3',
        severity: 4,
        likelihood: 3,
        urgency: 2,
        control: 2,
        score: 12,
        createdAt: new Date().toISOString()
      }
    ],
    actions: [
      {
        id: 'act_1',
        owner: 'Procurement Director / Supply Chain Audit Lead',
        deadline: '2026-11-30',
        details: 'Commission third-party SMETA 4-Pillar audit and install digital heat-stress telemetry at Vietnam facility.',
        riskId: 'r_1',
        status: 'in_progress',
        createdAt: new Date().toISOString()
      },
      {
        id: 'act_2',
        owner: 'Sustainability ESG Officer',
        deadline: '2026-08-15',
        details: 'Enforce satellite deforestation verification clause via EUDR traceability platform.',
        riskId: 'r_2',
        status: 'open',
        createdAt: new Date().toISOString()
      }
    ],
    transitionPlan: {
      has15Goal: true,
      hasTargets2030: true,
      hasScope3Target: true,
      hasCapexAllocated: true,
      hasBoardOversight: false
    }
  };
}

export function exportCsdddWorkspaceToJson(workspace) {
  return JSON.stringify(workspace, null, 2);
}

export function exportCsdddActionsToCsv(actions = [], risks = []) {
  const header = ['Action ID', 'Risk Description', 'Status', 'Owner', 'Deadline', 'Details', 'Created At'];
  const rows = actions.map(a => {
    const r = risks.find(item => item.id === a.riskId);
    return [
      `"${a.id}"`,
      `"${(r ? r.desc : '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${(a.owner || '').replace(/"/g, '""')}"`,
      `"${a.deadline || ''}"`,
      `"${(a.details || '').replace(/"/g, '""')}"`,
      `"${a.createdAt || ''}"`
    ].join(',');
  });
  return [header.join(','), ...rows].join('\n');
}

export function exportCsdddSuppliersToCsv(suppliers = []) {
  const header = ['Supplier ID', 'Name', 'Country', 'Tier', 'Sector', 'Risk Score', 'Status', 'Model Clauses', 'Grievance Access'];
  const rows = suppliers.map(s => [
    `"${s.id}"`,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${(s.country || '').replace(/"/g, '""')}"`,
    `"${s.tier || ''}"`,
    `"${(s.sector || '').replace(/"/g, '""')}"`,
    s.score || 0,
    `"${s.status || ''}"`,
    s.contractualClause ? 'Yes' : 'No',
    s.grievanceAccess ? 'Yes' : 'No'
  ].join(','));
  return [header.join(','), ...rows].join('\n');
}
