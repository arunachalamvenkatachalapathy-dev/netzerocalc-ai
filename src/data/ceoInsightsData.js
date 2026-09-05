/**
 * NetZeroCalc-AI — Executive CEO Insights & Strategic Briefs Data Layer
 * Authoritative, unreferenced board-ready strategic frameworks, decarbonization economics,
 * empirical corporate reporting benchmarks, and C-suite decision matrices.
 */

export const STRATEGIC_CATEGORIES = [
  { id: 'all', label: 'All Strategic Briefs' },
  { id: 'csrd-strategy', label: 'Corporate Governance & CSRD Strategy' },
  { id: 'omnibus-architecture', label: 'Regulatory Architecture & Due Diligence' },
  { id: 'carbon-economics', label: 'Carbon Economics & Financial Strategy' },
  { id: 'eu-cohesion', label: 'EU Regulatory Cohesion & Friction' },
  { id: 'global-convergence', label: 'Global Convergence & Capital Markets' }
];

export const CEO_STRATEGIC_BRIEFS = [
  {
    id: 'brief-csrd-benchmarking',
    category: 'csrd-strategy',
    categoryLabel: 'Corporate Governance & CSRD Strategy',
    title: 'Corporate Filings Benchmarking: The Strategy Integration Gap',
    subtitle: 'Wave 1 Assured Disclosures Reveal a 1.6-Point Spread Between Compliance Checklists and Capital Allocation',
    readTime: '6 min read',
    leadHeadline: 'The transition of ESG reporting from voluntary communication to mandatory, assured governance has revealed a critical divide: enterprises that treat disclosure as a reporting exercise vs. those utilizing it to re-engineer capital strategy.',
    stats: [
      { label: 'Wave 1 Filings Benchmark', value: '4.0 / 5.0', desc: 'Average composite score across European multinational reporters' },
      { label: 'Strategic Performance Spread', value: '1.6 pts', desc: 'Differential between compliance-led and strategy-integrated firms' },
      { label: 'CapEx Shadow Carbon Pricing', value: '40%', desc: 'Only 4 of 10 assessed leaders embed carbon prices into investment decisions' },
      { label: 'Quantified Scenario Analysis', value: '40%', desc: 'Only 4 of 10 quantify financial outcomes under named reference scenarios' }
    ],
    theShift: {
      title: 'The Shift: From Voluntary Narrative to Assured Governance',
      paragraphs: [
        'Mandatory sustainability reporting has fundamentally altered corporate accountability. Sustainability statements are now legal documents subject to statutory limited assurance, examined closely by institutional asset managers, credit rating agencies, lenders, and proxy advisors.',
        'Market data demonstrates that the companies that approached reporting preparation purely as an accounting checklist look distinctly different from those that used the exercise to stress-test enterprise resilience, CapEx durability, and commercial positioning.',
        'The performance spread observed across major corporate filings is not merely a reporting gap; it is an executive strategy gap that directly impacts credit ratings and the long-term cost of capital.'
      ]
    },
    threeLenses: [
      {
        title: 'Lens 1: Compliance Completeness & Assurance',
        description: 'Verifies whether statutory requirements are fulfilled without qualification, including double materiality execution, value chain boundary setting, and third-party assurance sign-off.',
        keyTakeaway: 'Compliance is now the operational floor. Transparent disclosure of data limitations and phased roadmaps correlates with higher assurance credibility.'
      },
      {
        title: 'Lens 2: Quality & Financial Connectivity',
        description: 'Examines whether sustainability metrics are integrated into financial accounting, CapEx allocation, executive compensation formulas, and audited financial statements.',
        keyTakeaway: 'Disconnects between stated climate ambition and balance sheet capital allocation represent the most common vulnerability flagged by assurance providers.'
      },
      {
        title: 'Lens 3: Strategic Advantage & Transition Leadership',
        description: 'Assesses whether the business model creates structural competitive advantage, green pricing power, and supply chain decarbonization leadership.',
        keyTakeaway: 'Enterprises pricing carbon internally before statutory mandates produce measurably superior disclosures and defensible capital allocations.'
      }
    ],
    deepInsights: [
      {
        title: 'The Scenario Analysis Vulnerability',
        detail: 'The most widespread deficiency across initial corporate reporting cycles is the absence of quantified scenario analysis. Many organizations still rely on qualitative narrative descriptions rather than modeling quantified balance sheet impacts against established international reference pathways (IEA Net Zero 2050, IPCC RCP 2.6/8.5, NGFS Net Zero). Closing this gap requires integrated financial and climate modeling under joint CFO and CSO oversight.'
      },
      {
        title: 'Capital Allocation & Shadow Carbon Pricing',
        detail: 'Leading multinational enterprises embed explicit internal shadow carbon prices (typically €50 to €130 / $75 per tCO2e) into capital expenditure evaluation thresholds. Treating carbon cost as a physical parameter rather than a regulatory compliance line item provides structural defense against future EU ETS allowance inflation and border adjustment mechanisms.'
      },
      {
        title: 'Nature & Biodiversity Scrutiny (ESRS E4)',
        detail: 'Biodiversity and ecosystem disclosure exhibits the widest variance in corporate reporting. Conclusions declaring Nature and Biodiversity immaterial face intense challenge from institutional investors aligned with TNFD recommendations. Organizations must rigorously substantiate dependency evaluations across Tier-1 and agricultural supply chains.'
      },
      {
        title: 'Transparent Limitation Disclosure',
        detail: 'Benchmarking frameworks confirm that explicitly disclosing data limitations, restatements, and unassured parameters correlates with higher overall governance confidence. Disclosing an in-flight roadmap is viewed by assurance providers as vastly more credible than obscuring data maturity gaps.'
      }
    ],
    boardroomQuestions: [
      'Has our board examined how our sustainability disclosure compares against European and global industry peers on CapEx integration?',
      'Do we utilize named, quantified reference scenarios (IEA, IPCC, NGFS) with projected financial balance sheet outcomes, or is our scenario modeling still qualitative?',
      'Are executive management incentives explicitly and quantifiably linked to verified decarbonization and sustainability targets in our assured statements?',
      'If our double materiality assessment deemed ESRS E4 (Biodiversity) immaterial, will that determination withstand rigorous TNFD-aligned investor examination?'
    ],
    actionPlan: [
      { role: 'Chief Executive Officer', action: 'Direct joint CFO-CSO integration of internal shadow carbon pricing into all major CapEx and acquisition approvals.' },
      { role: 'Chief Financial Officer', action: 'Commission quantitative climate scenario modeling with projected cash flow and balance sheet sensitivities under 1.5°C and 3.0°C pathways.' },
      { role: 'Chief Sustainability Officer', action: 'Establish audited data ownership and traceability for all material metrics prior to third-party verification cycles.' },
      { role: 'Audit Committee', action: 'Review materiality determination rationales, particularly for nature, biodiversity, and value chain human rights.' }
    ],
    connectedEngine: {
      id: 'csrd-materiality',
      label: 'CSRD Double Materiality & ESRS Benchmark Matrix',
      description: 'Access the 325 post-Omnibus datapoints, dual-axis materiality scoring matrix, and peer benchmark comparison.'
    }
  },
  {
    id: 'brief-omnibus-assessment',
    category: 'omnibus-architecture',
    categoryLabel: 'Regulatory Architecture & Due Diligence',
    title: 'The Omnibus Regulatory Simplification: Substance Remains',
    subtitle: 'A 61% Datapoint Reduction Does Not Eliminate Disclosure Obligations, Assurance Requirements, or CSDDD Due Diligence',
    readTime: '5 min read',
    leadHeadline: 'The European regulatory simplification reduces raw field counts by 61%, yet 76% of substantive disclosure requirements remain unchanged. Treating administrative rationalization as deregulation creates catastrophic compliance liabilities.',
    stats: [
      { label: 'Raw Field Count Reduction', value: '-61%', desc: 'Reduction from pre-Omnibus ~1,100 fields to 325 consolidated clusters' },
      { label: 'Substantive Continuity', value: '76%', desc: 'Proportion of disclosure obligations continuing with unchanged substance' },
      { label: 'Dominant Core Standards', value: '52%', desc: 'ESRS 2, E1, and S1 account for over half of all post-Omnibus clusters' },
      { label: 'Non-Phaseable Mandates', value: '41 items', desc: 'Statutory requirements anchored to SFDR & Pillar 3 that cannot be deferred' }
    ],
    theShift: {
      title: 'The Shift: Administrative Rationalization vs. Statutory Continuity',
      paragraphs: [
        'The EU Omnibus simplification package consolidates fragmented reporting fields into streamlined clusters, eliminating redundant text fields and simplifying presentation formats. However, it preserves the foundational disclosure architecture of ESRS.',
        'Furthermore, Corporate Sustainability Due Diligence Directive (CSDDD) mandates operate in parallel with reporting obligations regardless of reporting field adjustments. Managing sustainability reporting and corporate supply chain due diligence as separate workstreams is the leading cause of operational duplication and compliance failure.',
        'Organizations that dismantled data collection capabilities under the misconception that Omnibus constitutes a relaxation face severe cost penalties when mandatory assurance deadlines arrive.'
      ]
    },
    threeLenses: [
      {
        title: 'Lens 1: The Fallacy of Deregulation',
        description: 'The headline 61% cut reflects consolidated entry fields, not a waiver of underlying environmental and social obligations.',
        keyTakeaway: 'The obligation to measure, verify, and obtain limited third-party assurance over core impacts remains statutory law.'
      },
      {
        title: 'Lens 2: CSDDD & CSRD Structural Inseparability',
        description: 'Reporting disclosure (CSRD) and supply chain duty of care (CSDDD) share core data registries, risk assessments, and remediation policies.',
        keyTakeaway: 'ESRS S2 (Workers in Value Chain) has 9 direct identical touchpoints with CSDDD 6-step due diligence. Operating unified data governance saves 30–40% in administrative overhead.'
      },
      {
        title: 'Lens 3: Strategic Narrative Over Checklist Assembly',
        description: 'Beginning with a cohesive corporate transition narrative and aligning metrics toward it produces superior assurance outcomes.',
        keyTakeaway: 'Focusing on the 3 dominant standards (ESRS 2, E1, S1) establishes defensible board-level oversight while accommodating future delegated acts.'
      }
    ],
    deepInsights: [
      {
        title: 'The 41 Non-Phaseable Anchors',
        detail: 'The Omnibus introduces transitional phase-ins for smaller entities, but 41 specific datapoints cannot be deferred by law. These represent non-phaseable statutory requirements anchored to financial market regulations, including SFDR Principal Adverse Impact (PAI) indicators, EBA Pillar 3 prudential reporting, and EU Benchmark regulations.'
      },
      {
        title: 'Classification Pitfalls: The G1-3 Evolution',
        detail: 'In the simplified structure, specific requirement codes have evolved in substantive focus. For example, requirement G1-3 shifted from general anti-corruption procedures to broader corporate business conduct targets. Failing to update internal audit templates to match new classifications results in critical assurance non-conformances.'
      },
      {
        title: 'The 19 Watchlist Datapoints',
        detail: 'Nineteen specific pre-Omnibus items lack an explicit one-to-one successor in draft delegated acts. Rather than assuming these requirements are permanently extinguished, prudent governance requires maintaining them on an active regulatory monitoring watchlist pending final administrative confirmation.'
      }
    ],
    boardroomQuestions: [
      'Has our enterprise re-baselined its reporting scoping against the 325 consolidated clusters rather than outdated pre-Omnibus field lists?',
      'Have we identified which of the 41 non-phaseable statutory indicators apply to our legal entities, and is formal executive ownership assigned?',
      'Are our CSRD disclosure teams and CSDDD supply chain due diligence teams operating from a shared data and risk registry, or running redundant silos?',
      'Is our ESG communication driven by an authentic corporate transition strategy, or an uncoordinated effort to satisfy disparate compliance checklists?'
    ],
    actionPlan: [
      { role: 'General Counsel', action: 'Formalize unified legal oversight across CSRD reporting disclosures and CSDDD supply chain diligence obligations.' },
      { role: 'Chief Financial Officer', action: 'Ensure finance systems capture non-phaseable SFDR and Pillar 3 data lines to preserve institutional investor access.' },
      { role: 'Chief Procurement Officer', action: 'Integrate CSDDD Tier-1 supplier risk audits directly into CSRD ESRS S2 value chain documentation.' },
      { role: 'Board Audit Committee', action: 'Establish quarterly monitoring of the 19 unassigned regulatory watchlist items ahead of delegated act adoption.' }
    ],
    connectedEngine: {
      id: 'omnibus-csddd',
      label: 'Omnibus Simplification & CSDDD Readiness Engine',
      description: 'Review the 61% datapoint reduction breakdown, 41 non-phaseable requirements, and 6-step CSDDD due diligence workflow.'
    }
  },
  {
    id: 'brief-cost-of-carbon',
    category: 'carbon-economics',
    categoryLabel: 'Carbon Economics & Financial Strategy',
    title: 'Balance Sheet Decarbonization: The Embedded Cost of Carbon',
    subtitle: 'From €80 Today to Projected €145 in 2030 and €200 in 2035 — Transforming Hidden Liabilities into Capital Allocation Defense',
    readTime: '6 min read',
    leadHeadline: 'Carbon expenditure is already embedded inside corporate electricity tariffs, logistics surcharges, and supply chain inputs. As European and global carbon allowances trajectory past €145/t, unquantified carbon exposure transforms into a balance sheet crisis.',
    stats: [
      { label: 'Current EU ETS Allowance', value: '~€80 / t', desc: 'Current spot pricing for European Union Allowances (EUA)' },
      { label: '2030 Baseline Projection', value: '€145 / t', desc: 'Projected allowance floor driven by statutory linear reduction factor tightening' },
      { label: '2035 Horizon Projection', value: '€200 / t', desc: 'Accelerated phase-out of free allocation and maritime/transport expansion' },
      { label: 'Operational Exposure Layers', value: '3 Layers', desc: 'Direct Scope 1 taxes, indirect power tariffs, and supply chain polluter-pays pass-through' }
    ],
    theShift: {
      title: 'The Shift: From Compliance Expense to Enterprise Valuation Factor',
      paragraphs: [
        'Carbon pricing is no longer an abstract environmental policy debate. It is a present operational cost actively flowing through enterprise cost structures. Power utilities incorporate EU ETS allowance costs directly into industrial electricity tariffs, while logistics and materials suppliers pass national carbon levies downstream under polluter-pays mechanisms.',
        'Operating in or sourcing from jurisdictions with weaker immediate climate ambition does not eliminate carbon exposure—it defers it. Global border carbon adjustments (CBAM), customer Scope 3 mandates, and investor portfolio decarbonization ensure that delayed policy alignment results in sharper, abrupt financial corrections.',
        'Embedding forward-looking carbon price trajectories directly into CapEx models and shadow pricing mechanisms transforms decarbonization from an unquantified cost center into an ROI-positive capital allocation filter.'
      ]
    },
    threeLenses: [
      {
        title: 'Layer 1: Power Tariffs & Indirect Allowance Pass-Through',
        description: 'Electricity generators pass marginal allowance acquisition costs directly into power purchase contracts and commercial tariffs.',
        keyTakeaway: 'Every MWh consumed carries embedded carbon cost. Organizations without visibility cannot model true forward energy inflation.'
      },
      {
        title: 'Layer 2: Downstream Supply Chain Pass-Through',
        description: 'National carbon taxation is widening beyond heavy industry into transport, heating, industrial services, and agricultural inputs.',
        keyTakeaway: 'Under standard commercial terms, upstream suppliers reflect compliance levies in invoice pricing, burdening procurement budgets with unmodeled costs.'
      },
      {
        title: 'Layer 3: The Deferred Ambition Trap',
        description: 'Sourcing components from low-regulation markets creates heightened exposure to import border carbon levies (CBAM) and customer disqualification.',
        keyTakeaway: 'Low-ambition jurisdictions represent high catch-up volatility rather than sustainable cost advantages.'
      }
    ],
    deepInsights: [
      {
        title: 'EU ETS 2 Expansion (2027 Activation)',
        detail: 'The launch of EU ETS 2 in 2027 expands direct carbon pricing to commercial road transport fuels and building heating fuels. This will directly impact fleet operations, distribution logistics, and facility overheads across Europe, introducing carbon volatility into previously exempt operating lines.'
      },
      {
        title: 'Internal Shadow Pricing Benchmark',
        detail: 'Global industrial and logistics frontrunners apply an internal shadow carbon price of €75 to €130 / tCO2e across all capital expenditure decisions above €1M. Projects that fail to achieve targeted internal rate of return (IRR) hurdles under forward carbon pricing scenarios are redesigned or rejected.'
      },
      {
        title: 'Connecting Carbon Reduction to CFO Language',
        detail: 'Quantifying carbon cost exposure provides the exact financial justification required for sustainability investments. Abatement projects that appear cost-neutral on simple energy savings alone become highly accretive when modeled against projected €145/t and €200/t allowance trajectories.'
      }
    ],
    boardroomQuestions: [
      'What specific percentage of our current electricity and logistics expenditure is directly attributable to embedded carbon allowance pricing?',
      'Have we quantified national carbon tax exposure across our complete manufacturing and supply chain footprint?',
      'Are forward-looking carbon price trajectories (e.g. €145 in 2030, €200 in 2035) built into our financial hurdle rates and CapEx evaluation models?',
      'Which of our primary sourcing regions carry the highest CBAM tariff exposure and supply chain catch-up risk?'
    ],
    actionPlan: [
      { role: 'Chief Financial Officer', action: 'Incorporate shadow carbon pricing (€80–€150/t) into corporate investment guidelines and discounted cash flow models.' },
      { role: 'Chief Operating Officer', action: 'Audit electricity contracts and utility invoices to isolate embedded ETS pass-through surcharges.' },
      { role: 'Head of Procurement', action: 'Map supplier carbon intensity across high-volume categories to hedge against CBAM and transport levy escalations.' },
      { role: 'Executive Board', action: 'Mandate carbon liability disclosures within statutory financial review and risk committee reporting.' }
    ],
    connectedEngine: {
      id: 'carbon-cost',
      label: 'Carbon Cost & Shadow Pricing Simulator',
      description: 'Simulate financial liability across historical and forward EUA price curves (€80 to €200/t) and calculate internal shadow pricing impact.'
    }
  },
  {
    id: 'brief-eu-regulations',
    category: 'eu-cohesion',
    categoryLabel: 'EU Regulatory Cohesion & Friction',
    title: 'European ESG Regulatory Cohesion: 60 Rules, One Architecture',
    subtitle: '51 Instruments in Force Across 8 Domains — Why Siloed Compliance Workstreams Guarantee Enterprise Friction',
    readTime: '6 min read',
    leadHeadline: 'The European Green Deal encompasses 60 interrelated directives and regulations. With 51 already in force and 57% rated high implementation effort, compliance is no longer a peripheral task—it is the core European operating environment.',
    stats: [
      { label: 'Active Regulatory Regimes', value: '51 / 60', desc: 'Directives and regulations already in force or in phased implementation' },
      { label: 'High Implementation Effort', value: '57%', desc: 'Instruments requiring extensive enterprise systems and cross-functional overhaul' },
      { label: 'Maximum Liability Risk', value: '10 regimes', desc: 'Directives carrying statutory criminal sanctions, market exclusions, or import bans' },
      { label: 'Primary Policy Domains', value: '8 Domains', desc: 'Climate, Reporting, Finance, Nature, Circularity, Products, Supply Chain, and Social' }
    ],
    theShift: {
      title: 'The Shift: From Peripheral Compliance to Core Market License',
      paragraphs: [
        'European sustainability regulation has matured into a unified economic operating environment. CSRD mandates corporate reporting, CSDDD governs supply chain human rights and environmental diligence, CBAM prices embedded carbon at external borders, EU Taxonomy establishes sustainable finance eligibility, and ESPR defines circular product design.',
        'These frameworks do not function as isolated policy streams. They share data dependencies, governance standards, and enforcement liabilities. Treating each directive as an independent, disconnected compliance exercise multiplies overhead costs and exposes the enterprise to critical audit discrepancies.',
        'Organizations that establish centralized, modular ESG data architecture achieve regulatory readiness efficiently while turning verified compliance into preferred supplier status and reduced borrowing costs.'
      ]
    },
    threeLenses: [
      {
        title: 'Lens 1: Compliance as Baseline Operating License',
        description: 'With over 50 binding frameworks active, baseline compliance offers zero competitive differentiation. Efficiency and data integration are the true executive metrics.',
        keyTakeaway: 'The question for leadership is not whether compliance is mandatory, but how to execute it without crippling operational agility.'
      },
      {
        title: 'Lens 2: Maximum Liability Exposure',
        description: 'Ten frameworks carry maximum liability ratings (5/5), including EU ETS, REACH, GDPR, CSDDD, IED, and the EU Forced Labour Regulation.',
        keyTakeaway: 'Non-compliance in these domains results in commercial market bans, product seizure at customs, civil litigation, and personal director liability.'
      },
      {
        title: 'Lens 3: The 2026–2027 Enforcement Horizon',
        description: 'The convergence of CBAM definitive rules, EUDR deforestation enforcement, PPWR packaging standards, and Pay Transparency creates severe operational bottlenecks.',
        keyTakeaway: 'Building data systems requires 12–24 months of lead time. Deferring preparation until enforcement dates guarantees operational failure.'
      }
    ],
    deepInsights: [
      {
        title: 'The Interconnected Data Backbone',
        detail: 'A single validated emissions dataset supports multiple statutory obligations: GHG Protocol corporate accounting feeds ESRS E1, which feeds CBAM verification, which feeds EU Taxonomy Capex KPIs, which feeds SFDR financial product disclosures. Centralizing this data spine eliminates 40% of corporate reporting overhead.'
      },
      {
        title: 'Enforcement Escalation Beyond Fines',
        detail: 'The enforcement mechanism of modern European legislation has shifted from administrative fines to commercial disqualification. The EU Deforestation Regulation (EUDR) and Forced Labour Regulation prohibit non-compliant products from crossing customs borders, turning compliance into a direct revenue continuity requirement.'
      },
      {
        title: 'Supply Chain Multiplier Effects',
        detail: 'Large European corporations subject to CSDDD and CSRD are contractually passing statutory requirements down to tier-1 and tier-2 suppliers globally. Mid-market enterprises that deliver pre-verified, audit-ready data win preferred supplier status and long-term contract lock-in.'
      }
    ],
    boardroomQuestions: [
      'Does our executive committee maintain a single unified map of which of the 60 EU ESG regulations legally apply across all our operating entities?',
      'Are our CSRD disclosure, CSDDD supply chain diligence, and EU Taxonomy alignment programmes sharing data architecture, or operating in functional silos?',
      'Have our legal and executive risk teams conducted joint liability audits across the 10 regulations rated maximum enforcement and sanction severity?',
      'Are enterprise preparation budgets and system deployments fully funded for the wave of 2026–2027 enforcement mandates (CBAM definitive, EUDR, PPWR, Pay Transparency)?'
    ],
    actionPlan: [
      { role: 'Executive Committee', action: 'Approve single enterprise ESG data architecture to service CSRD, CSDDD, Taxonomy, and CBAM simultaneously.' },
      { role: 'General Counsel', action: 'Institute joint legal-operational oversight over the 10 maximum-liability EU regulatory regimes.' },
      { role: 'Chief Information Officer', action: 'Deploy automated audit-trail data pipelines connecting ERP activity data with sustainability metrics.' },
      { role: 'Risk & Audit Committee', action: 'Integrate the 2026–2028 EU regulatory enforcement calendar into quarterly enterprise risk registers.' }
    ],
    connectedEngine: {
      id: 'eu-navigator',
      label: 'EU ESG Regulation Navigator (60 Regs & 5-Factor Radar)',
      description: 'Explore the full 60-regulation database with interactive effort vs. liability scatter matrix and multi-dimensional radar profiles.'
    }
  },
  {
    id: 'brief-global-reporting',
    category: 'global-convergence',
    categoryLabel: 'Global Convergence & Capital Markets',
    title: 'Global ESG Disclosure Convergence: Multi-Jurisdiction Architecture',
    subtitle: 'From the G20 to Global Supply Chains — Navigating ISSB Baseline Convergence and Cross-Border Interoperability',
    readTime: '5 min read',
    leadHeadline: 'Across 20 major global jurisdictions, voluntary reporting has been permanently replaced by mandatory statutory regimes. ISSB is emerging as the global financial baseline, while CSRD establishes the highest standard of stakeholder accountability.',
    stats: [
      { label: 'Mandatory G20 Coverage', value: '20 / 20', desc: 'Every major economic bloc has enacted or formally adopted mandatory ESG regimes' },
      { label: 'ISSB Adoption Rate', value: '13 / 20', desc: 'Jurisdictions formally adopting or referencing IFRS S1 and S2 standards' },
      { label: 'TCFD Climate Bedrock', value: '100%', desc: 'Universal foundation for climate governance and scenario analysis globally' },
      { label: 'Peak Enforcement Window', value: '2025–2026', desc: 'Activation horizon across Australia, Canada, US/California, Japan, and Korea' }
    ],
    theShift: {
      title: 'The Shift: The End of Voluntary Safe Harbors',
      paragraphs: [
        'The era of corporate sustainability reporting as an elective public relations exercise has permanently closed. All 20 major economic jurisdictions—from the European Union and the United Kingdom to the United States, India, Japan, and Australia—have enacted or finalized mandatory disclosure frameworks.',
        'Multinational enterprises operating across multiple continents face between four and six overlapping statutory disclosure regimes simultaneously. Managing these requirements through fragmented regional accounting teams creates massive cost inflation, contradictory disclosures, and severe liability under statutory assurance audits.',
        'The emerging strategic consensus is clear: build enterprise data infrastructure to ISSB S1/S2 as the global financial disclosure baseline, with CSRD ESRS as the European double materiality layer. This "build once to the highest common denominator" strategy is the most capital-efficient compliance model available.'
      ]
    },
    threeLenses: [
      {
        title: 'Lens 1: No Jurisdictional Safe Harbors',
        description: 'Every major capital market enforces mandatory climate and sustainability reporting with tightening third-party verification standards.',
        keyTakeaway: 'Attempting to maintain disparate regional disclosures creates irreconcilable public contradictions that attract regulatory scrutiny.'
      },
      {
        title: 'Lens 2: ISSB as the Universal Spine',
        description: 'Thirteen of twenty jurisdictions are building domestic standards directly upon IFRS S1 and S2 (UK SRS, Australia ASRS, Japan SSBJ, Singapore, Canada).',
        keyTakeaway: 'A core data architecture aligned with ISSB S1/S2 satisfies 70–80% of climate reporting requirements globally.'
      },
      {
        title: 'Lens 3: Sub-National & Border Enforcement',
        description: 'Jurisdictional reach extends far beyond corporate headquarters. California SB 253 mandates Scope 1, 2, and 3 disclosure for all companies with >$1B revenue operating in the state.',
        keyTakeaway: 'Multinationals are bound by regional standards based on where they conduct business, not solely where they are legally incorporated.'
      }
    ],
    deepInsights: [
      {
        title: 'The California SB 253 Scope 3 Global Impact',
        detail: 'California Senate Bill 253 applies to public and private entities with global annual revenues exceeding $1 billion that do business in California. It mandates third-party assured reporting across Scope 1, Scope 2, and crucially Scope 3 emissions, effectively imposing comprehensive value chain reporting on global corporations regardless of their national domicile.'
      },
      {
        title: 'India SEBI BRSR Core & Assurance',
        detail: 'India has instituted one of the most advanced mandatory assurance frameworks globally. The Securities and Exchange Board of India (SEBI) mandates Business Responsibility and Sustainability Reporting (BRSR Core) with mandatory reasonable assurance across top listed companies, demonstrating that high assurance expectations are not confined to Western economies.'
      },
      {
        title: 'Value Chain Cap Defense for Supply Chains',
        detail: 'As mandatory reporting expands globally, mid-sized suppliers face overwhelming data demands from global buyers. Leveraging statutory protections such as the EU VSME Value Chain Cap (Commission Delegated Regulation C(2026) 5011 Annex II) provides a legally vetted boundary that prevents disproportionate compliance friction.'
      }
    ],
    boardroomQuestions: [
      'Has our enterprise mapped its complete global entity and subsidiary footprint against the 20 mandatory reporting regimes active across the G20?',
      'Is our core ESG reporting infrastructure architected to ISSB S1 and S2 as a universal data model, or are we maintaining fragmented software tools in each region?',
      'Have our US operational subsidiaries prepared for California SB 253 Scope 1–3 reporting obligations and associated third-party assurance deadlines?',
      'Does our enterprise supply chain data meet the rigorous assurance standards required by our largest corporate customers across the EU, UK, and Asia-Pacific?'
    ],
    actionPlan: [
      { role: 'Chief Financial Officer', action: 'Standardize enterprise financial and carbon accounting systems on ISSB S1/S2 data definitions.' },
      { role: 'VP of Global Tax & Compliance', action: 'Map subsidiary filing obligations and assurance timelines across EU, US, UK, and APAC jurisdictions.' },
      { role: 'Head of Global Procurement', action: 'Deploy standardized Scope 3 calculation protocols to satisfy customer procurement disclosures globally.' },
      { role: 'Audit Committee Chair', action: 'Engage external auditors to conduct a global multi-jurisdictional assurance readiness assessment.' }
    ],
    connectedEngine: {
      id: 'vsme',
      label: 'VSME Voluntary SME Reporting Tool & Value Chain Cap Shield',
      description: 'Explore the EFRAG C(2026) 5011 voluntary standard, size relief, and statutory Value Chain Cap protection for non-listed supply chains.'
    }
  }
];

export const STRATEGIC_MATURITY_PILLARS = [
  {
    id: 'governance_integration',
    title: 'Governance & Capital Allocation Integration',
    description: 'Degree to which ESG targets and shadow carbon pricing are embedded into Board decisions, CapEx evaluation, and executive incentive packages.',
    questions: [
      {
        text: 'How are carbon costs and climate metrics integrated into your enterprise capital allocation process?',
        options: [
          { score: 1, label: 'Not integrated — sustainability and capital budgeting operate independently.' },
          { score: 2, label: 'Qualitative consideration — reviewed informally without quantified financial metrics.' },
          { score: 3, label: 'Formal review — major CapEx requires an ESG risk memo but no shadow carbon price.' },
          { score: 4, label: 'Quantified shadow pricing — formal internal carbon price (€50–€100/t) applied to CapEx.' },
          { score: 5, label: 'Fully embedded — shadow carbon pricing and SBTi intensity hurdles dictate project approvals and board compensation.' }
        ]
      }
    ]
  },
  {
    id: 'scenario_resilience',
    title: 'Quantified Climate Scenario Analysis',
    description: 'Maturity of forward-looking financial balance sheet modeling against international reference pathways (IEA NZE, IPCC, NGFS).',
    questions: [
      {
        text: 'What is the current maturity of your enterprise climate scenario modeling?',
        options: [
          { score: 1, label: 'No formal climate scenario analysis conducted.' },
          { score: 2, label: 'Qualitative narrative — descriptive review of physical and transition risks.' },
          { score: 3, label: 'Named reference scenarios — 1.5°C and 3.0°C reference pathways selected without financial modeling.' },
          { score: 4, label: 'Quantified financial impacts — estimated revenue and cost variances under 2 distinct scenarios.' },
          { score: 5, label: 'Full balance sheet integration — dynamic cash flow, asset impairment, and CapEx sensitivity modeled across 3+ audited scenarios.' }
        ]
      }
    ]
  },
  {
    id: 'regulatory_architecture',
    title: 'Integrated Regulatory Data Architecture',
    description: 'Cohesion of data systems serving CSRD, CSDDD, CBAM, EU Taxonomy, and global reporting regimes simultaneously.',
    questions: [
      {
        text: 'How does your organization handle multi-directive ESG data collection and compliance?',
        options: [
          { score: 1, label: 'Ad hoc spreadsheets — manual data calls assembled retrospectively for each request.' },
          { score: 2, label: 'Siloed projects — separate internal teams manage CSRD, CSDDD, and CBAM independently.' },
          { score: 3, label: 'Shared data repository — central ESG metrics warehouse serving multiple reporting templates.' },
          { score: 4, label: 'Integrated workflow — unified policies, risk registers, and supplier tracking shared across CSRD and CSDDD.' },
          { score: 5, label: 'Enterprise automated spine — single ERP-connected data model powering ISSB, CSRD, and CBAM with automated audit trails.' }
        ]
      }
    ]
  },
  {
    id: 'supply_chain_diligence',
    title: 'Value Chain Diligence & Scope 3 Decarbonization',
    description: 'Depth of supplier engagement, primary product carbon footprint (PCF) collection, and human rights due diligence.',
    questions: [
      {
        text: 'How mature is your value chain emissions and human rights due diligence programme?',
        options: [
          { score: 1, label: 'Spend-based estimates only — no direct engagement with supply chain partners.' },
          { score: 2, label: 'Supplier code of conduct — basic contractual commitments without verification.' },
          { score: 3, label: 'Targeted surveys — primary activity data collected from top 20% high-emitting tier-1 suppliers.' },
          { score: 4, label: 'Active supplier decarbonization — verified PCF data, CSDDD audits, and capacity building for tier-1 suppliers.' },
          { score: 5, label: 'Integrated value chain ecosystem — dynamic digital product passports, supplier SBTi mandates, and statutory Value Chain Cap shields.' }
        ]
      }
    ]
  },
  {
    id: 'assurance_readiness',
    title: 'Statutory Assurance & Data Quality Discipline',
    description: 'Traceability, internal controls, documentation citations, and external assurance verification readiness.',
    questions: [
      {
        text: 'What is the current assurance readiness of your enterprise sustainability metrics?',
        options: [
          { score: 1, label: 'Unverified — internal metrics assembled without documented audit trails or methodology papers.' },
          { score: 2, label: 'Self-reviewed — internal audit checks calculations, but no external verification.' },
          { score: 3, label: 'Limited assurance on Scope 1 and 2 GHG emissions only.' },
          { score: 4, label: 'Limited assurance across full CSRD/ESG statement with named data owners and documented calculations.' },
          { score: 5, label: 'Reasonable assurance ready — rigorous internal financial-grade controls, continuous automated auditing, and zero material findings.' }
        ]
      }
    ]
  }
];
