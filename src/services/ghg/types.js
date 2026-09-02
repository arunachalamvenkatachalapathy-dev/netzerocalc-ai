/**
 * Corporate GHG Inventory Domain Types & Constants
 * Reference: NetZeroCalc_Antigravity_Implementation_Spec.xlsx & GHG Protocol Corporate Standard
 */

export const CONSOLIDATION_APPROACHES = [
  'Operational Control',
  'Financial Control',
  'Equity Share'
];

export const GWP_BASES = [
  'IPCC AR6',
  'IPCC AR5',
  'IPCC AR4'
];

export const PERIOD_STATUSES = [
  'draft',
  'in_review',
  'locked',
  'assured'
];

export const GRID_REGIONS = [
  { id: 'IN_CEA_NATIONAL', name: 'India - CEA National Grid Mix (2024)', country: 'IN', factor: 0.7314, unit: 'kgCO2e/kWh' },
  { id: 'IN_NORTHERN', name: 'India - Northern Regional Grid', country: 'IN', factor: 0.7420, unit: 'kgCO2e/kWh' },
  { id: 'IN_WESTERN', name: 'India - Western Regional Grid', country: 'IN', factor: 0.7580, unit: 'kgCO2e/kWh' },
  { id: 'IN_SOUTHERN', name: 'India - Southern Regional Grid', country: 'IN', factor: 0.7050, unit: 'kgCO2e/kWh' },
  { id: 'IN_EASTERN', name: 'India - Eastern Regional Grid', country: 'IN', factor: 0.8120, unit: 'kgCO2e/kWh' },
  { id: 'US_CAMX', name: 'US - WECC California (CAMX)', country: 'US', factor: 0.2150, unit: 'kgCO2e/kWh' },
  { id: 'US_ERCT', name: 'US - ERCOT Texas (ERCT)', country: 'US', factor: 0.3850, unit: 'kgCO2e/kWh' },
  { id: 'US_RFCW', name: 'US - RFC West (RFCW)', country: 'US', factor: 0.4950, unit: 'kgCO2e/kWh' },
  { id: 'EU_RER_AVG', name: 'EU - ENTSO-E Continental Average', country: 'EU', factor: 0.2520, unit: 'kgCO2e/kWh' },
  { id: 'GLOBAL_AVG', name: 'Global - World Grid Average (IEA)', country: 'GLO', factor: 0.4400, unit: 'kgCO2e/kWh' },
];

/**
 * Creates a default Organization structure
 */
export function createDefaultOrganization(name = 'My Enterprise Organization', country = 'IN') {
  return {
    id: 'org_' + Date.now(),
    name: name.trim() || 'My Enterprise Organization',
    country: country || 'IN',
    consolidationApproach: 'Operational Control',
    gwpBasis: 'IPCC AR6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
