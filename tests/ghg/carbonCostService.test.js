import { describe, test, expect } from 'bun:test';
import {
  calculateCarbonLiability,
  calculateMultiYearCarbonExposure,
  calculateShadowPricingPayback,
  CARBON_PRICE_BENCHMARKS,
  CURRENCY_RATES
} from '../../src/services/ghg/carbonCostService.js';

describe('Carbon Cost Exposure & Shadow Pricing Engine (Part 5)', () => {

  test('calculates single-point annual balance sheet liability across Scopes 1, 2, and 3', () => {
    const res = calculateCarbonLiability({
      scope1Tonnes: 20.0,
      scope2Tonnes: 80.0,
      scope3Tonnes: 50.0,
      eurPerTonne: 145.0, // 2030 EUA consensus
      scope3PassThroughRatePct: 50.0,
      currency: 'EUR'
    });

    expect(res.eurPerTonne).toBe(145.0);
    expect(res.currency).toBe('EUR');
    expect(res.currencySymbol).toBe('€');

    // Scope 1: 20 * 145 = 2,900 €
    expect(res.scope1Cost).toBe(2900.0);
    // Scope 2: 80 * 145 = 11,600 €
    expect(res.scope2Cost).toBe(11600.0);
    // Scope 3 pass-through: 50 * 50% = 25 tonnes * 145 = 3,625 €
    expect(res.scope3PassThroughTonnes).toBe(25.0);
    expect(res.scope3Cost).toBe(3625.0);
    // Total: 2900 + 11600 + 3625 = 18,125 €
    expect(res.totalCost).toBe(18125.0);
    // Direct compliance cost equals Scope 1
    expect(res.complianceDirectCost).toBe(2900.0);
  });

  test('converts carbon liability correctly into multi-currency valuations (USD, INR, GBP)', () => {
    // USD FX = 1.09
    const usd = calculateCarbonLiability({
      scope1Tonnes: 10.0,
      scope2Tonnes: 0,
      scope3Tonnes: 0,
      eurPerTonne: 100.0,
      currency: 'USD'
    });
    expect(usd.currencySymbol).toBe('$');
    expect(usd.priceLocal).toBe(109.0);
    expect(usd.totalCost).toBe(1090.0);

    // INR FX = 90.0
    const inr = calculateCarbonLiability({
      scope1Tonnes: 10.0,
      scope2Tonnes: 0,
      scope3Tonnes: 0,
      eurPerTonne: 100.0,
      currency: 'INR'
    });
    expect(inr.currencySymbol).toBe('₹');
    expect(inr.priceLocal).toBe(9000.0);
    expect(inr.totalCost).toBe(90000.0);
  });

  test('evaluates multi-year carbon liability trajectory across 2025, 2030, and 2035 with abatement', () => {
    const emissions = { scope1: 20, scope2lb: 80, scope3: 50 };
    const res = calculateMultiYearCarbonExposure({
      emissionsTonnes: emissions,
      scope3PassThroughRatePct: 50,
      currency: 'EUR',
      annualAbatementRatePct: 4.2 // 4.2%/yr SBTi 1.5C pace
    });

    const s = res.scenarios;
    expect(s.year2025.year).toBe(2025);
    expect(s.year2025.eurPerTonne).toBe(70.0);

    expect(s.year2030.year).toBe(2030);
    expect(s.year2030.eurPerTonne).toBe(145.0);
    // BAU unabated in 2030: (20 + 80 + 25) * 145 = 18,125 €
    expect(s.year2030.bauTotalCost).toBe(18125.0);
    // Mitigated in 2030 is lower than BAU because of 4.2%/yr abatement
    expect(s.year2030.totalCost).toBeLessThan(s.year2030.bauTotalCost);

    expect(s.year2035.year).toBe(2035);
    expect(s.year2035.eurPerTonne).toBe(200.0);
    expect(s.year2035.totalCost).toBeLessThan(s.year2035.bauTotalCost);

    // Cumulative savings through 2035 must be positive
    expect(res.cumulativeSavingsBy2035).toBeGreaterThan(0);
  });

  test('computes internal shadow pricing CapEx hurdle rate and accelerated payback', () => {
    // Project: €200,000 CapEx, saves 200 tCO2e/yr and €20,000/yr energy cost
    // Shadow carbon price: €145/t
    const payback = calculateShadowPricingPayback({
      capexInvestment: 200000,
      annualEmissionReductionTonnes: 200,
      shadowCarbonPriceEur: 145.0,
      directEnergySavingsAnnual: 20000,
      currency: 'EUR'
    });

    // Traditional Payback: 200,000 / 20,000 = 10.0 years
    expect(payback.traditionalPaybackYears).toBe(10.0);

    // Avoided carbon cost per year: 200 * 145 = 29,000 €
    expect(payback.carbonCostAvoidedAnnual).toBe(29000.0);

    // Total shadow benefit per year: 20,000 + 29,000 = 49,000 €
    expect(payback.totalAnnualBenefitShadowPriced).toBe(49000.0);

    // Shadow Payback: 200,000 / 49,000 = ~4.1 years
    expect(payback.shadowPaybackYears).toBeCloseTo(4.1, 1);

    // Payback accelerated by ~5.9 years
    expect(payback.paybackReductionYears).toBeCloseTo(5.9, 1);
  });

});
