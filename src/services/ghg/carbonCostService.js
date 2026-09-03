/**
 * NetZeroCalc-AI — Carbon Cost Exposure & Shadow Pricing Calculation Service
 * References:
 * - EU ETS Phase 4 Regulations & Directive 2003/87/EC as amended by Directive (EU) 2023/958
 * - EU CBAM Regulation (EU) 2023/956
 * - IEA World Energy Outlook & BloombergNEF Carbon Price Projections (2025–2035)
 */

export const CARBON_PRICE_BENCHMARKS = {
  current_2025: {
    label: "Current Market (2025 Baseline)",
    eurPerTonne: 70.0,
    source: "EEX / ICE EU ETS Spot Average"
  },
  consensus_2030: {
    label: "2030 Consensus (EUA €145 Target)",
    eurPerTonne: 145.0,
    source: "IEA / BNEF / Refinitiv Consensus Projection"
  },
  phaseout_2035: {
    label: "2035 Free Allowance Phase-Out (€200 Target)",
    eurPerTonne: 200.0,
    source: "EU CBAM / ETS Cap Zero-Allocation Projection"
  },
  accelerated_15c: {
    label: "Accelerated 1.5°C Deep Decarbonization",
    eurPerTonne: 250.0,
    source: "High-Level Commission on Carbon Prices (Stern-Stiglitz)"
  }
};

export const CURRENCY_RATES = {
  EUR: { symbol: '€', rate: 1.0, label: 'Euros (EUR)' },
  USD: { symbol: '$', rate: 1.09, label: 'US Dollars (USD)' },
  INR: { symbol: '₹', rate: 90.0, label: 'Indian Rupees (INR)' },
  GBP: { symbol: '£', rate: 0.85, label: 'British Pounds (GBP)' }
};

/**
 * Calculate single-point annual financial liability for given emissions and carbon price
 */
export function calculateCarbonLiability({
  scope1Tonnes = 0,
  scope2Tonnes = 0,
  scope3Tonnes = 0,
  eurPerTonne = 145.0,
  scope3PassThroughRatePct = 50.0, // suppliers pass through 50% of carbon tax
  currency = 'EUR'
}) {
  const fx = CURRENCY_RATES[currency]?.rate || 1.0;
  const sym = CURRENCY_RATES[currency]?.symbol || '€';
  const priceLocal = eurPerTonne * fx;

  const scope1Cost = scope1Tonnes * priceLocal;
  const scope2Cost = scope2Tonnes * priceLocal;
  const scope3PassThroughTonnes = scope3Tonnes * (scope3PassThroughRatePct / 100);
  const scope3Cost = scope3PassThroughTonnes * priceLocal;

  const totalCost = scope1Cost + scope2Cost + scope3Cost;
  const complianceDirectCost = scope1Cost; // Direct regulatory compliance (ETS / CBAM)

  return {
    eurPerTonne,
    priceLocal: Number(priceLocal.toFixed(2)),
    currency,
    currencySymbol: sym,
    scope1Tonnes: Number(scope1Tonnes.toFixed(2)),
    scope2Tonnes: Number(scope2Tonnes.toFixed(2)),
    scope3Tonnes: Number(scope3Tonnes.toFixed(2)),
    scope3PassThroughRatePct,
    scope3PassThroughTonnes: Number(scope3PassThroughTonnes.toFixed(2)),
    scope1Cost: Number(scope1Cost.toFixed(2)),
    scope2Cost: Number(scope2Cost.toFixed(2)),
    scope3Cost: Number(scope3Cost.toFixed(2)),
    complianceDirectCost: Number(complianceDirectCost.toFixed(2)),
    totalCost: Number(totalCost.toFixed(2))
  };
}

/**
 * Multi-Year Carbon Liability Trajectory across 2025, 2030, and 2035 price milestones
 */
export function calculateMultiYearCarbonExposure({
  emissionsTonnes = { scope1: 0, scope2lb: 0, scope3: 0 },
  customPrice2030 = null,
  customPrice2035 = null,
  scope3PassThroughRatePct = 50.0,
  currency = 'EUR',
  annualAbatementRatePct = 0.0 // if company reduces emissions over time
}) {
  const s1 = emissionsTonnes.scope1 || 0;
  const s2 = emissionsTonnes.scope2lb || 0;
  const s3 = emissionsTonnes.scope3 || 0;

  const p2025 = CARBON_PRICE_BENCHMARKS.current_2025.eurPerTonne;
  const p2030 = customPrice2030 != null ? Number(customPrice2030) : CARBON_PRICE_BENCHMARKS.consensus_2030.eurPerTonne;
  const p2035 = customPrice2035 != null ? Number(customPrice2035) : CARBON_PRICE_BENCHMARKS.phaseout_2035.eurPerTonne;

  // If company abates emissions:
  const abateFactor = (years) => Math.pow(1 - (annualAbatementRatePct / 100), years);

  // 2025 (Baseline)
  const l2025 = calculateCarbonLiability({
    scope1Tonnes: s1,
    scope2Tonnes: s2,
    scope3Tonnes: s3,
    eurPerTonne: p2025,
    scope3PassThroughRatePct,
    currency
  });

  // 2030 (5 years of potential abatement)
  const l2030 = calculateCarbonLiability({
    scope1Tonnes: s1 * abateFactor(5),
    scope2Tonnes: s2 * abateFactor(5),
    scope3Tonnes: s3 * abateFactor(5),
    eurPerTonne: p2030,
    scope3PassThroughRatePct,
    currency
  });

  // 2035 (10 years of potential abatement)
  const l2035 = calculateCarbonLiability({
    scope1Tonnes: s1 * abateFactor(10),
    scope2Tonnes: s2 * abateFactor(10),
    scope3Tonnes: s3 * abateFactor(10),
    eurPerTonne: p2035,
    scope3PassThroughRatePct,
    currency
  });

  // Unmitigated 2030 and 2035 (Business as Usual - no abatement)
  const l2030_bau = calculateCarbonLiability({
    scope1Tonnes: s1,
    scope2Tonnes: s2,
    scope3Tonnes: s3,
    eurPerTonne: p2030,
    scope3PassThroughRatePct,
    currency
  });

  const l2035_bau = calculateCarbonLiability({
    scope1Tonnes: s1,
    scope2Tonnes: s2,
    scope3Tonnes: s3,
    eurPerTonne: p2035,
    scope3PassThroughRatePct,
    currency
  });

  const cumulativeSavingsBy2035 = (l2030_bau.totalCost - l2030.totalCost) * 5 + (l2035_bau.totalCost - l2035.totalCost) * 5;

  return {
    currency,
    currencySymbol: CURRENCY_RATES[currency]?.symbol || '€',
    annualAbatementRatePct,
    scenarios: {
      year2025: { year: 2025, ...l2025 },
      year2030: { year: 2030, ...l2030, bauTotalCost: l2030_bau.totalCost },
      year2035: { year: 2035, ...l2035, bauTotalCost: l2035_bau.totalCost }
    },
    cumulativeSavingsBy2035: Number(cumulativeSavingsBy2035.toFixed(2))
  };
}

/**
 * CapEx Decarbonization Payback with Shadow Carbon Pricing
 * Compares standard ROI vs Shadow-Priced ROI
 */
export function calculateShadowPricingPayback({
  capexInvestment = 250000, // e.g. €250k for boiler electrification or heat pump
  annualEmissionReductionTonnes = 350, // e.g. saves 350 tCO2e/yr
  shadowCarbonPriceEur = 145.0, // €145/t shadow price
  directEnergySavingsAnnual = 25000, // €25k/yr energy cost savings
  currency = 'EUR'
}) {
  const fx = CURRENCY_RATES[currency]?.rate || 1.0;
  const sym = CURRENCY_RATES[currency]?.symbol || '€';

  const capexLocal = capexInvestment * fx;
  const energySavingsLocal = directEnergySavingsAnnual * fx;
  const shadowPriceLocal = shadowCarbonPriceEur * fx;

  const carbonCostAvoidedAnnual = annualEmissionReductionTonnes * shadowPriceLocal;
  const totalAnnualBenefitShadowPriced = energySavingsLocal + carbonCostAvoidedAnnual;

  // Traditional Payback (ignoring carbon cost): CapEx / EnergySavings
  const traditionalPaybackYears = energySavingsLocal > 0
    ? capexLocal / energySavingsLocal
    : Infinity;

  // Shadow-Priced Payback: CapEx / (EnergySavings + CarbonAvoided)
  const shadowPaybackYears = totalAnnualBenefitShadowPriced > 0
    ? capexLocal / totalAnnualBenefitShadowPriced
    : Infinity;

  const paybackReductionYears = traditionalPaybackYears !== Infinity && shadowPaybackYears !== Infinity
    ? traditionalPaybackYears - shadowPaybackYears
    : 0;

  return {
    currency,
    currencySymbol: sym,
    capexLocal: Number(capexLocal.toFixed(2)),
    shadowPriceLocal: Number(shadowPriceLocal.toFixed(2)),
    energySavingsLocal: Number(energySavingsLocal.toFixed(2)),
    carbonCostAvoidedAnnual: Number(carbonCostAvoidedAnnual.toFixed(2)),
    totalAnnualBenefitShadowPriced: Number(totalAnnualBenefitShadowPriced.toFixed(2)),
    traditionalPaybackYears: traditionalPaybackYears !== Infinity ? Number(traditionalPaybackYears.toFixed(1)) : 'N/A',
    shadowPaybackYears: shadowPaybackYears !== Infinity ? Number(shadowPaybackYears.toFixed(1)) : 'N/A',
    paybackReductionYears: Number(paybackReductionYears.toFixed(1))
  };
}
