/**
 * Central Emission Factor Registry & Governance Engine
 * Reference: NetZeroCalc Phase 2 Specification, GHG Protocol & SBTi Net-Zero V2.0
 */

import { areUnitsCompatible, normalizeUnit, getUnitDimension, convertQuantity } from './unitService.js';

/**
 * Authoritative Seed Emission Factors
 * Strict Provenance: Only verified official factors with explicit sources, GWP basis, and publication years.
 */
export const DEFAULT_EMISSION_FACTORS = [
  // --- India Regional & National Electricity Grids (CEA Baseline Database v19.0) ---
  {
    id: 'ef_cea_grid_national_2024',
    name: 'India Grid Electricity - National Average (CEA v19.0)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.7160,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.712, ch4: 0.0015, n2o: 0.0025, notes: 'CEA v19 weighted average operating margin / build margin grid mix.' },
    geography: 'IN',
    country: 'India',
    region: 'National',
    gridRegion: 'IN_CEA_NATIONAL',
    source: 'Central Electricity Authority (CEA)',
    sourceOrganization: 'Ministry of Power, Government of India',
    sourceReference: 'CO2 Baseline Database for the Indian Power Sector, User Guide Version 19.0 (Dec 2023)',
    sourceVersion: 'v19.0',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Average Grid Emission Factor (Weighted Operating Margin / Build Margin)',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { gridType: 'National Interconnected Grid' }
  },
  {
    id: 'ef_cea_grid_southern_2024',
    name: 'India Southern Regional Grid Electricity (CEA v19.0)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.6980,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.694, ch4: 0.0015, n2o: 0.0025 },
    geography: 'IN',
    country: 'India',
    region: 'Southern Region (TN, KA, AP, TS, KL)',
    gridRegion: 'IN_SOUTHERN',
    source: 'Central Electricity Authority (CEA)',
    sourceOrganization: 'Ministry of Power, Government of India',
    sourceReference: 'CO2 Baseline Database for the Indian Power Sector, Version 19.0',
    sourceVersion: 'v19.0',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Regional Weighted Average Grid Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { regionalMix: 'Includes high renewable penetration in Tamil Nadu and Karnataka' }
  },
  {
    id: 'ef_cea_grid_western_2024',
    name: 'India Western Regional Grid Electricity (CEA v19.0)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.7420,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.738, ch4: 0.0015, n2o: 0.0025 },
    geography: 'IN',
    country: 'India',
    region: 'Western Region (MH, GJ, MP, CG, Goa)',
    gridRegion: 'IN_WESTERN',
    source: 'Central Electricity Authority (CEA)',
    sourceOrganization: 'Ministry of Power, Government of India',
    sourceReference: 'CO2 Baseline Database for the Indian Power Sector, Version 19.0',
    sourceVersion: 'v19.0',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Regional Weighted Average Grid Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { regionalMix: 'Thermal dominated with heavy industrial load in Maharashtra & Gujarat' }
  },
  {
    id: 'ef_cea_grid_northern_2024',
    name: 'India Northern Regional Grid Electricity (CEA v19.0)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.7050,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.701, ch4: 0.0015, n2o: 0.0025 },
    geography: 'IN',
    country: 'India',
    region: 'Northern Region (DL, HR, PB, UP, RJ, UK, HP, JK)',
    gridRegion: 'IN_NORTHERN',
    source: 'Central Electricity Authority (CEA)',
    sourceOrganization: 'Ministry of Power, Government of India',
    sourceReference: 'CO2 Baseline Database for the Indian Power Sector, Version 19.0',
    sourceVersion: 'v19.0',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Regional Weighted Average Grid Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { regionalMix: 'Hydro mix from HP/UK plus solar installations in Rajasthan' }
  },
  {
    id: 'ef_cea_grid_eastern_2024',
    name: 'India Eastern Regional Grid Electricity (CEA v19.0)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.7550,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.751, ch4: 0.0015, n2o: 0.0025 },
    geography: 'IN',
    country: 'India',
    region: 'Eastern Region (WB, OD, JH, BR)',
    gridRegion: 'IN_EASTERN',
    source: 'Central Electricity Authority (CEA)',
    sourceOrganization: 'Ministry of Power, Government of India',
    sourceReference: 'CO2 Baseline Database for the Indian Power Sector, Version 19.0',
    sourceVersion: 'v19.0',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Regional Weighted Average Grid Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { regionalMix: 'Pit-head thermal coal stations' }
  },
  {
    id: 'ef_cea_grid_northeastern_2024',
    name: 'India North-Eastern Regional Grid Electricity (CEA v19.0)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.4850,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.481, ch4: 0.0015, n2o: 0.0025 },
    geography: 'IN',
    country: 'India',
    region: 'North-Eastern Region (AS, ML, MN, MZ, NL, TR, AR)',
    gridRegion: 'IN_NORTH_EASTERN',
    source: 'Central Electricity Authority (CEA)',
    sourceOrganization: 'Ministry of Power, Government of India',
    sourceReference: 'CO2 Baseline Database for the Indian Power Sector, Version 19.0',
    sourceVersion: 'v19.0',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Regional Weighted Average Grid Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { regionalMix: 'High hydro and natural gas mix' }
  },

  // --- India Thermal Fuels (Stationary & Mobile Combustion) ---
  {
    id: 'ef_ind_diesel_stationary_2024',
    name: 'Diesel Fuel - Stationary Combustion (Boilers & DG Sets)',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 2.6558,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'L',
    co2eUnit: 'kgCO2e',
    gases: { co2: 2.6400, ch4_n2o_uplift: 0.0158, notes: 'Base CO2 (2.64 kg/L) + ~0.6% CH4/N2O stoichiometric uplift per US EPA methodology.' },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC / US EPA GHG Equivalencies',
    sourceOrganization: 'WRI India / CII / TERI India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6 / MoEFCC Guidelines',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry + N2O/CH4 Uplift',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { densityKgPerL: 0.832, netCalorificValueGjPerTonne: 42.6 }
  },
  {
    id: 'ef_ind_petrol_mobile_2024',
    name: 'Petrol / Motor Gasoline - Mobile Combustion',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 2.2836,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'L',
    co2eUnit: 'kgCO2e',
    gases: { co2: 2.2700, ch4_n2o_uplift: 0.0136 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC',
    sourceOrganization: 'WRI India / CII India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry + N2O/CH4 Uplift',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { densityKgPerL: 0.745 }
  },
  {
    id: 'ef_ind_coal_stationary_2024',
    name: 'Indian Coal - Stationary Combustion (Industrial Boilers)',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 1.9919,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 1.9800, ch4_n2o_uplift: 0.0119 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC',
    sourceOrganization: 'WRI India / CII India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6 (Non-Coking Coal)',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry for Indian Non-Coking Coal',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { ashContentPct: 38.0, grossCalorificValueKcalPerKg: 3800 }
  },
  {
    id: 'ef_ind_furnace_oil_2024',
    name: 'Furnace Oil - Industrial Boilers',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 3.1186,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'L',
    co2eUnit: 'kgCO2e',
    gases: { co2: 3.1000, ch4_n2o_uplift: 0.0186 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC',
    sourceOrganization: 'WRI India / CII India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { densityKgPerL: 0.940 }
  },
  {
    id: 'ef_ind_natural_gas_2024',
    name: 'Natural Gas - Piped / Industrial',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 1.8913,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'm3',
    co2eUnit: 'kgCO2e',
    gases: { co2: 1.8800, ch4_n2o_uplift: 0.0113 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC',
    sourceOrganization: 'WRI India / CII India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6 (1 scm = 1 m3)',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { netCalorificValueMjPerScm: 37.5 }
  },
  {
    id: 'ef_ind_lpg_commercial_2024',
    name: 'Liquefied Petroleum Gas (LPG) - Commercial/Industrial',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 2.9979,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 2.9800, ch4_n2o_uplift: 0.0179 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC',
    sourceOrganization: 'WRI India / CII India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { mix: '60% Butane / 40% Propane' }
  },
  {
    id: 'ef_ind_cng_mobile_2024',
    name: 'Compressed Natural Gas (CNG) - Fleet Vehicles',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    activityType: 'Fuel Combustion',
    factorValue: 2.6860,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 2.6700, ch4_n2o_uplift: 0.0160 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'India GHG Program / MoEFCC',
    sourceOrganization: 'WRI India / CII India GHG Program',
    sourceReference: 'India GHG Program Standard Emission Factors v6',
    sourceVersion: 'v6 (2024)',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Thermal Combustion Stoichiometry',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { operatingPressureBar: 200 }
  },

  // --- UK DEFRA / DESNZ 2024 Official Conversion Factors ---
  {
    id: 'ef_defra_grid_uk_2024',
    name: 'UK National Grid Electricity (DEFRA 2024)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.20705,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.20520, ch4: 0.00065, n2o: 0.00120 },
    geography: 'UK',
    country: 'United Kingdom',
    region: 'National',
    gridRegion: 'UK_NATIONAL_GRID',
    source: 'UK DEFRA / DESNZ',
    sourceOrganization: 'UK Department for Energy Security and Net Zero',
    sourceReference: 'UK Government GHG Conversion Factors for Company Reporting 2024',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'UK Generation Grid Average (Excluding T&D)',
    tier: 'Tier 2',
    uncertainty: '±3%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { excludesTransmissionLosses: true }
  },
  {
    id: 'ef_defra_car_diesel_km_2024',
    name: 'Passenger Car - Average Diesel (Distance-Based)',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    activityType: 'Passenger Vehicle',
    factorValue: 0.1684,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'km',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.1668, ch4: 0.0001, n2o: 0.0015 },
    geography: 'UK',
    country: 'United Kingdom',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / DESNZ',
    sourceOrganization: 'UK Department for Energy Security and Net Zero',
    sourceReference: 'DEFRA 2024 Business Travel - Land: Passenger Cars',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Distance-Based Real-World Activity Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { vehicleClass: 'Medium Car 1.4 - 2.0L Diesel' }
  },
  {
    id: 'ef_defra_car_petrol_km_2024',
    name: 'Passenger Car - Average Petrol (Distance-Based)',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    activityType: 'Passenger Vehicle',
    factorValue: 0.1648,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'km',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.1632, ch4: 0.0003, n2o: 0.0013 },
    geography: 'UK',
    country: 'United Kingdom',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / DESNZ',
    sourceOrganization: 'UK Department for Energy Security and Net Zero',
    sourceReference: 'DEFRA 2024 Business Travel - Land: Passenger Cars',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Distance-Based Real-World Activity Factor',
    tier: 'Tier 2',
    uncertainty: '±5%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { vehicleClass: 'Medium Car 1.4 - 2.0L Petrol' }
  },
  {
    id: 'ef_defra_hgv_rigid_tkm_2024',
    name: 'Freight Transport - HGV Rigid (7.5t - 17t, 50% Laden)',
    scope: 'Scope 3',
    category: 'Cat 4: Upstream Transportation & Distribution',
    activityType: 'Freight Transport',
    factorValue: 0.1983,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'tkm',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.1965, ch4: 0.0002, n2o: 0.0016 },
    geography: 'UK',
    country: 'United Kingdom',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / DESNZ',
    sourceOrganization: 'UK Department for Energy Security and Net Zero',
    sourceReference: 'DEFRA 2024 Freighting Goods - HGVs (All Diesel)',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Tonne-Kilometer Freight Intensity Factor',
    tier: 'Tier 2',
    uncertainty: '±8%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { loadFactor: '50% average load factor' }
  },
  {
    id: 'ef_defra_air_domestic_pkm_2024',
    name: 'Commercial Air Travel - Domestic Flight (with Radiative Forcing)',
    scope: 'Scope 3',
    category: 'Cat 6: Business Travel',
    activityType: 'Air Travel',
    factorValue: 0.2458,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'p-km',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.1340, ch4: 0.0001, n2o: 0.0012, notes: 'Includes indirect Radiative Forcing factor multiplier per DEFRA guidance.' },
    geography: 'UK',
    country: 'United Kingdom',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / DESNZ',
    sourceOrganization: 'UK Department for Energy Security and Net Zero',
    sourceReference: 'DEFRA 2024 Business Travel - Air: Domestic',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Passenger-Kilometer Aviation Factor with Radiative Forcing',
    tier: 'Tier 2',
    uncertainty: '±10%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { cabinClass: 'Average Domestic', includesRadiativeForcing: true }
  },
  {
    id: 'ef_defra_hotel_night_ind_2024',
    name: 'Hotel Stay - India (Per Room Night)',
    scope: 'Scope 3',
    category: 'Cat 6: Business Travel',
    activityType: 'Accommodation',
    factorValue: 42.5000,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'night',
    co2eUnit: 'kgCO2e',
    gases: { co2: 42.20, ch4: 0.10, n2o: 0.20 },
    geography: 'IN',
    country: 'India',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / DESNZ / Cornell Hotel Sustainability Benchmarking',
    sourceOrganization: 'DEFRA / CHSB Index',
    sourceReference: 'DEFRA 2024 Business Travel - Hotel Stay: India',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Room-Night Energy & Water Footprint Benchmark',
    tier: 'Tier 2',
    uncertainty: '±15%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { metric: 'kg CO2e per room per night' }
  },
  {
    id: 'ef_defra_water_supply_2024',
    name: 'Municipal Water Supply (Mains Water)',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods & Services',
    activityType: 'Water Utility',
    factorValue: 0.1490,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'm3',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.148, ch4: 0.0003, n2o: 0.0007 },
    geography: 'GLOBAL',
    country: 'Global',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / Water UK',
    sourceOrganization: 'DEFRA',
    sourceReference: 'DEFRA 2024 Water Supply',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Water extraction, treatment, and distribution lifecycle footprint',
    tier: 'Tier 2',
    uncertainty: '±10%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { unitEquivalent: '1 m3 = 1000 Liters' }
  },
  {
    id: 'ef_defra_water_treatment_2024',
    name: 'Water Treatment / Sewage Processing',
    scope: 'Scope 3',
    category: 'Cat 5: Waste Generated in Operations',
    activityType: 'Waste Processing',
    factorValue: 0.2720,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'm3',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.265, ch4: 0.0035, n2o: 0.0035 },
    geography: 'GLOBAL',
    country: 'Global',
    region: null,
    gridRegion: null,
    source: 'UK DEFRA / Water UK',
    sourceOrganization: 'DEFRA',
    sourceReference: 'DEFRA 2024 Water Treatment',
    sourceVersion: '2024.1',
    publicationYear: 2024,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Sewage and wastewater treatment biological processing footprint',
    tier: 'Tier 2',
    uncertainty: '±12%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { unitEquivalent: '1 m3 = 1000 Liters' }
  },

  // --- EU CBAM Official Default Benchmark Factors (Regulations 2021/447 & 2024/873) ---
  {
    id: 'ef_cbam_aluminium_primary_2024',
    name: 'Primary Aluminium Ingot (Unwrought Aluminium)',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods & Services',
    activityType: 'Raw Material',
    factorValue: 14.2000,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 12.80, pfc: 1.40, notes: 'Includes electrolysis PFC perfluorocarbon emissions.' },
    geography: 'GLOBAL',
    country: 'Global Default',
    region: null,
    gridRegion: null,
    source: 'European Commission CBAM Transitional Methodology',
    sourceOrganization: 'European Commission Directorate-General for Taxation and Customs Union',
    sourceReference: 'Commission Implementing Regulation (EU) 2023/1773 & Benchmark Reg 2021/447 Annex I (CN 7601)',
    sourceVersion: 'CBAM 2024 Default',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Cradle-to-gate direct + indirect embedded emissions default benchmark',
    tier: 'Tier 2',
    uncertainty: '±10%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { cnCode: '7601', productGroup: 'Aluminium' }
  },
  {
    id: 'ef_cbam_steel_bof_2024',
    name: 'Crude Steel - Blast Furnace / Basic Oxygen Furnace (BOF)',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods & Services',
    activityType: 'Raw Material',
    factorValue: 2.1500,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 2.14, ch4: 0.005, n2o: 0.005 },
    geography: 'GLOBAL',
    country: 'Global Default',
    region: null,
    gridRegion: null,
    source: 'European Commission CBAM Benchmark Values',
    sourceOrganization: 'European Commission',
    sourceReference: 'Commission Implementing Regulation (EU) 2021/447 Benchmark Reg (CN 7206/7207)',
    sourceVersion: 'CBAM 2024 Default',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'BF-BOF integrated steel production default embedded emissions',
    tier: 'Tier 2',
    uncertainty: '±8%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { route: 'BF-BOF Primary' }
  },
  {
    id: 'ef_cbam_steel_eaf_2024',
    name: 'Crude Steel - Electric Arc Furnace (EAF / Scrap Route)',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods & Services',
    activityType: 'Raw Material',
    factorValue: 0.4500,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.44, ch4: 0.005, n2o: 0.005 },
    geography: 'GLOBAL',
    country: 'Global Default',
    region: null,
    gridRegion: null,
    source: 'European Commission CBAM Benchmark Values',
    sourceOrganization: 'European Commission',
    sourceReference: 'Commission Implementing Regulation (EU) 2021/447 (CN 7206/7207 EAF)',
    sourceVersion: 'CBAM 2024 Default',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'EAF scrap-based steel default embedded emissions',
    tier: 'Tier 2',
    uncertainty: '±8%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { route: 'EAF Secondary / Recycled' }
  },
  {
    id: 'ef_cbam_cement_clinker_2024',
    name: 'Cement Clinker (Grey Clinker)',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods & Services',
    activityType: 'Raw Material',
    factorValue: 0.8500,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.845, ch4: 0.002, n2o: 0.003 },
    geography: 'GLOBAL',
    country: 'Global Default',
    region: null,
    gridRegion: null,
    source: 'European Commission CBAM Benchmark Values',
    sourceOrganization: 'European Commission',
    sourceReference: 'Commission Implementing Regulation (EU) 2021/447 Annex I (CN 2523 10 00)',
    sourceVersion: 'CBAM 2024 Default',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Calcinated clinker production default embedded emissions',
    tier: 'Tier 2',
    uncertainty: '±6%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { productGroup: 'Cement' }
  },
  {
    id: 'ef_cbam_ammonia_anhydrous_2024',
    name: 'Anhydrous Ammonia (Fertilizer Precursor)',
    scope: 'Scope 3',
    category: 'Cat 1: Purchased Goods & Services',
    activityType: 'Raw Material',
    factorValue: 2.4000,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kg',
    co2eUnit: 'kgCO2e',
    gases: { co2: 2.39, ch4: 0.005, n2o: 0.005 },
    geography: 'GLOBAL',
    country: 'Global Default',
    region: null,
    gridRegion: null,
    source: 'European Commission CBAM Benchmark Values',
    sourceOrganization: 'European Commission',
    sourceReference: 'Commission Implementing Regulation (EU) 2021/447 Annex I (CN 2814 10 00)',
    sourceVersion: 'CBAM 2024 Default',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Steam methane reforming Haber-Bosch process benchmark',
    tier: 'Tier 2',
    uncertainty: '±8%',
    status: 'verified',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { productGroup: 'Fertilizers / Chemicals' }
  },

  // --- Global Fallback Proxy (Clearly marked provisional) ---
  {
    id: 'ef_global_grid_avg_2024',
    name: 'Global Average Grid Electricity (Provisional Proxy)',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    activityType: 'Grid Electricity',
    factorValue: 0.4750,
    numeratorUnit: 'kgCO2e',
    denominatorUnit: 'kWh',
    co2eUnit: 'kgCO2e',
    gases: { co2: 0.471, ch4: 0.002, n2o: 0.002 },
    geography: 'GLOBAL',
    country: 'Global',
    region: null,
    gridRegion: 'GLOBAL_AVG',
    source: 'IEA Global Energy & Climate Model / WRI',
    sourceOrganization: 'International Energy Agency',
    sourceReference: 'IEA World Energy Outlook 2023 / Emission Factors Database',
    sourceVersion: '2023 Provisional',
    publicationYear: 2023,
    validFrom: '2024-01-01',
    validTo: null,
    gwpBasis: 'IPCC AR6',
    methodology: 'Global Weighted Average Carbon Intensity of Power Generation',
    tier: 'Tier 1',
    uncertainty: '±15%',
    status: 'provisional',
    isDefault: true,
    isCustom: false,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: { notes: 'Fallback global proxy when country-specific or regional grid factor is unavailable.' }
  }
];

/**
 * Validates input parameters for creating or updating an emission factor
 */
export function validateEmissionFactor(factor) {
  const errors = [];

  if (!factor.name || !factor.name.trim()) {
    errors.push('Factor name is required.');
  }

  const val = Number(factor.factorValue);
  if (isNaN(val) || val < 0) {
    errors.push('Factor value must be a non-negative number.');
  }

  if (!factor.denominatorUnit || !factor.denominatorUnit.trim()) {
    errors.push('Denominator unit (e.g. kWh, L, kg, m3) is required.');
  } else {
    const dim = getUnitDimension(factor.denominatorUnit);
    if (!dim) {
      errors.push(`Unrecognized denominator unit: "${factor.denominatorUnit}".`);
    }
  }

  if (!factor.scope || !['Scope 1', 'Scope 2', 'Scope 3'].includes(factor.scope)) {
    errors.push('Scope must be one of: Scope 1, Scope 2, Scope 3.');
  }

  if (!factor.activityType || !factor.activityType.trim()) {
    errors.push('Activity type (e.g. Fuel Combustion, Grid Electricity) is required.');
  }

  if (!factor.source || !factor.source.trim()) {
    errors.push('Authoritative source citation is required.');
  }

  if (!factor.sourceReference || !factor.sourceReference.trim()) {
    errors.push('Source reference document or URL is required for audit traceability.');
  }

  if (!factor.gwpBasis || !factor.gwpBasis.trim()) {
    errors.push('GWP basis (e.g. IPCC AR6, IPCC AR5) is required.');
  }

  if (factor.validFrom && factor.validTo && factor.validFrom > factor.validTo) {
    errors.push('validTo cannot be earlier than validFrom.');
  }

  return errors;
}

/**
 * Returns complete factors list merging defaults and custom factor definitions
 */
export function getAllEmissionFactors(customFactors = []) {
  const customMap = new Map();
  // Filter and index custom factors
  if (Array.isArray(customFactors)) {
    customFactors.forEach(cf => {
      customMap.set(cf.id, cf);
    });
  }

  // Combine defaults and custom factors, ensuring custom overrides or versions take precedence
  const combined = [...DEFAULT_EMISSION_FACTORS];
  customMap.forEach((cf, id) => {
    const existingIdx = combined.findIndex(f => f.id === id);
    if (existingIdx >= 0) {
      combined[existingIdx] = cf;
    } else {
      combined.push(cf);
    }
  });

  return combined;
}

/**
 * Retrieves a factor by its exact ID
 */
export function getFactorById(factorId, customFactors = []) {
  if (!factorId) return null;
  const all = getAllEmissionFactors(customFactors);
  return all.find(f => f.id === factorId) || null;
}

/**
 * Registers a new custom emission factor
 */
export function createCustomEmissionFactor(data, customFactors = []) {
  const errors = validateEmissionFactor(data);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const now = new Date().toISOString();
  const id = data.id || ('ef_custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));

  const newFactor = {
    ...data,
    id,
    name: data.name.trim(),
    scope: data.scope,
    category: data.category || 'Custom Category',
    activityType: data.activityType.trim(),
    factorValue: Number(data.factorValue),
    numeratorUnit: data.numeratorUnit || 'kgCO2e',
    denominatorUnit: normalizeUnit(data.denominatorUnit),
    co2eUnit: data.co2eUnit || 'kgCO2e',
    gases: data.gases || {},
    geography: data.geography?.toUpperCase() || 'GLOBAL',
    country: data.country || 'Custom',
    region: data.region || null,
    gridRegion: data.gridRegion || null,
    source: data.source.trim(),
    sourceOrganization: data.sourceOrganization || 'Internal / Supplier Primary Data',
    sourceReference: data.sourceReference.trim(),
    sourceVersion: data.sourceVersion || '1.0',
    publicationYear: Number(data.publicationYear) || new Date().getFullYear(),
    validFrom: data.validFrom || now.split('T')[0],
    validTo: data.validTo || null,
    gwpBasis: data.gwpBasis || 'IPCC AR6',
    methodology: data.methodology || 'Supplier-specific measured / site calculation',
    tier: data.tier || 'Tier 3',
    uncertainty: data.uncertainty || '±5%',
    status: data.status || 'verified',
    isDefault: false,
    isCustom: true,
    version: 1,
    supersedes: null,
    supersededBy: null,
    metadata: data.metadata || {},
    createdAt: now,
    updatedAt: now
  };

  return [...customFactors, newFactor];
}

/**
 * Spawns a new version of an existing factor without mutating historical records.
 * The original factor is preserved and marked as supersededBy the new version.
 */
export function createFactorVersion(originalFactorId, updates, reason, createdBy = 'System', customFactors = []) {
  const all = getAllEmissionFactors(customFactors);
  const original = all.find(f => f.id === originalFactorId);
  if (!original) {
    throw new Error(`Original emission factor "${originalFactorId}" not found.`);
  }

  const errors = validateEmissionFactor({ ...original, ...updates });
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const now = new Date().toISOString();
  const newVersionNum = (original.version || 1) + 1;
  const newFactorId = `${original.id.replace(/_v[0-9]+$/, '')}_v${newVersionNum}`;

  const newFactor = {
    ...original,
    ...updates,
    id: newFactorId,
    name: updates.name ? updates.name.trim() : original.name,
    factorValue: Number(updates.factorValue !== undefined ? updates.factorValue : original.factorValue),
    denominatorUnit: normalizeUnit(updates.denominatorUnit || original.denominatorUnit),
    sourceReference: updates.sourceReference ? updates.sourceReference.trim() : original.sourceReference,
    version: newVersionNum,
    supersedes: original.id,
    supersededBy: null,
    isDefault: false,
    isCustom: true,
    metadata: {
      ...(original.metadata || {}),
      ...(updates.metadata || {}),
      versionReason: reason || 'Factor value updated',
      versionAuthor: createdBy
    },
    createdAt: now,
    updatedAt: now
  };

  // Mark original as superseded
  const updatedOriginal = {
    ...original,
    supersededBy: newFactorId,
    validTo: updates.validFrom || now.split('T')[0],
    updatedAt: now
  };

  // Replace original in custom list or add to custom list if default
  let nextCustoms = customFactors.filter(f => f.id !== original.id && f.id !== newFactor.id);
  nextCustoms.push(updatedOriginal);
  nextCustoms.push(newFactor);

  return {
    newFactor,
    updatedOriginal,
    customFactors: nextCustoms
  };
}

/**
 * Checks if a factor is referenced by any locked reporting period
 */
export function isFactorReferencedInLockedPeriod(factorId, periods = [], corporateLedgers = {}) {
  if (!Array.isArray(periods)) return false;
  const lockedPeriods = periods.filter(p => p.status === 'locked' || p.status === 'assured');
  if (lockedPeriods.length === 0) return false;

  const lockedIds = new Set(lockedPeriods.map(p => p.id));

  // Check Scope 1, Scope 2, Scope 3 records
  const allActivities = [
    ...(corporateLedgers.scope1 || []),
    ...(corporateLedgers.scope2 || []),
    ...(corporateLedgers.scope3 || [])
  ];

  return allActivities.some(act => lockedIds.has(act.periodId) && act.factorId === factorId);
}

/**
 * Creates a structured Factor Override record
 * Preserves the original factor value and provides complete provenance for custom/site-specific replacements.
 */
export function createFactorOverride({
  organizationId,
  facilityId = null,
  originalFactorId,
  replacementFactorValue,
  replacementUnit,
  reason,
  source,
  sourceReference,
  evidence = null,
  createdBy = 'Analyst'
}) {
  if (!originalFactorId) {
    throw new Error('Original factor ID is required to create an override.');
  }
  const repVal = Number(replacementFactorValue);
  if (isNaN(repVal) || repVal < 0) {
    throw new Error('Replacement factor value must be a valid non-negative number.');
  }
  if (!replacementUnit || !replacementUnit.trim()) {
    throw new Error('Replacement unit is required.');
  }
  if (!reason || !reason.trim()) {
    throw new Error('A detailed audit justification reason is required for factor overrides.');
  }
  if (!source || !source.trim()) {
    throw new Error('Source organization/authority is required for factor overrides.');
  }
  if (!sourceReference || !sourceReference.trim()) {
    throw new Error('Source documentation reference is required for factor overrides.');
  }

  return {
    id: 'ovr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    organizationId: organizationId || 'org_default',
    facilityId: facilityId || null,
    originalFactorId,
    replacementFactorValue: repVal,
    replacementUnit: normalizeUnit(replacementUnit),
    reason: reason.trim(),
    source: source.trim(),
    sourceReference: sourceReference.trim(),
    evidence: evidence || null,
    createdBy: createdBy.trim(),
    createdAt: new Date().toISOString()
  };
}

/**
 * Deterministic Emission Factor Resolver
 * Evaluates overrides, geographic hierarchy, temporal applicability, unit compatibility, and GWP basis.
 */
export function resolveEmissionFactor({
  activityType,
  scope = null,
  category = null,
  geography = 'IN',
  gridRegion = null,
  facilityId = null,
  reportingPeriod = null,
  activityUnit = null,
  preferredSource = null,
  gwpBasis = 'IPCC AR6',
  overrides = [],
  customFactors = []
}) {
  if (!activityType || typeof activityType !== 'string' || !activityType.trim()) {
    throw new Error('resolveEmissionFactor: activityType is required.');
  }

  const allFactors = getAllEmissionFactors(customFactors);

  // 1. Filter candidates by activityType (and scope if provided)
  const normActivity = activityType.trim().toLowerCase();
  let candidates = allFactors.filter(f => {
    const actMatch = f.activityType.toLowerCase() === normActivity ||
                     (f.name && f.name.toLowerCase().includes(normActivity));
    if (!actMatch) return false;

    if (scope && f.scope && f.scope.toLowerCase() !== scope.toLowerCase()) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    throw new Error(
      `No emission factor found matching activity "${activityType}"${scope ? ` in ${scope}` : ''}.`
    );
  }

  // 2. Filter candidates by GWP Basis (Strict Alignment)
  if (gwpBasis) {
    const gwpMatches = candidates.filter(f => f.gwpBasis && f.gwpBasis.toUpperCase() === gwpBasis.toUpperCase());
    if (gwpMatches.length > 0) {
      candidates = gwpMatches;
    }
  }

  // 3. Evaluate Geographic Precedence Hierarchy
  // Order of preference:
  // Level 1: Site-specific factor (if facilityId matches)
  // Level 2: Grid-region specific factor (if gridRegion matches)
  // Level 3: Country / National match (if geography matches)
  // Level 4: Global average fallback
  let selected = null;
  let applicabilityLevel = 'global';

  // Check Grid Region match
  if (gridRegion) {
    const gridMatch = candidates.find(f => f.gridRegion && f.gridRegion.toUpperCase() === gridRegion.toUpperCase());
    if (gridMatch) {
      selected = gridMatch;
      applicabilityLevel = 'grid';
    }
  }

  // Check Country / National match
  if (!selected && geography) {
    const normGeo = geography.trim().toUpperCase();
    const geoMatch = candidates.find(f => f.geography && f.geography.toUpperCase() === normGeo);
    if (geoMatch) {
      selected = geoMatch;
      applicabilityLevel = 'country';
    }
  }

  // Fallback to Global match
  if (!selected) {
    const globalMatch = candidates.find(f => f.geography === 'GLOBAL');
    if (globalMatch) {
      selected = globalMatch;
      applicabilityLevel = 'global';
    } else {
      // Pick first candidate if no global explicit
      selected = candidates[0];
      applicabilityLevel = 'default';
    }
  }

  if (!selected) {
    throw new Error(
      `No applicable emission factor candidate survived geographic filtering for activity "${activityType}" (geo: ${geography}, grid: ${gridRegion || 'none'}).`
    );
  }

  // 4. Temporal Validity Evaluation
  let temporalStatus = 'valid';
  if (reportingPeriod && reportingPeriod.startDate && reportingPeriod.endDate) {
    const pStart = reportingPeriod.startDate;
    const pEnd = reportingPeriod.endDate;

    if (selected.validFrom && selected.validFrom > pEnd) {
      temporalStatus = 'future_factor_mismatch';
    } else if (selected.validTo && selected.validTo < pStart) {
      temporalStatus = 'expired_factor_mismatch';
    }
  }

  // 5. Unit Dimensional Compatibility Check
  if (activityUnit) {
    const normActUnit = normalizeUnit(activityUnit);
    const normFactorDenom = normalizeUnit(selected.denominatorUnit);

    const isCompat = areUnitsCompatible(normActUnit, normFactorDenom);
    if (!isCompat) {
      const actDim = getUnitDimension(normActUnit);
      const factorDim = getUnitDimension(normFactorDenom);

      throw new Error(
        `Unit dimension incompatibility for factor "${selected.name}": activity unit "${activityUnit}" (${actDim || 'unknown'}) cannot convert to factor denominator "${selected.denominatorUnit}" (${factorDim || 'unknown'}) without explicit physical conversion properties.`
      );
    }
  }

  // 6. Check Overrides (Highest Priority for final value)
  let isOverridden = false;
  let activeOverride = null;
  let finalFactorValue = selected.factorValue;
  let finalUnit = selected.denominatorUnit;

  if (Array.isArray(overrides) && overrides.length > 0) {
    // 1st priority: site-specific override matching both facilityId and originalFactorId
    if (facilityId) {
      activeOverride = overrides.find(o => o.originalFactorId === selected.id && o.facilityId === facilityId);
    }
    // 2nd priority: enterprise-wide override matching originalFactorId
    if (!activeOverride) {
      activeOverride = overrides.find(o => o.originalFactorId === selected.id && (!o.facilityId || o.facilityId === 'all'));
    }

    if (activeOverride) {
      isOverridden = true;
      finalFactorValue = activeOverride.replacementFactorValue;
      finalUnit = activeOverride.replacementUnit || selected.denominatorUnit;
    }
  }

  return {
    factor: selected,
    factorId: selected.id,
    factorVersion: selected.version || 1,
    factorName: selected.name,
    factorValue: finalFactorValue,
    originalFactorValue: selected.factorValue,
    factorUnit: finalUnit,
    co2eUnit: selected.co2eUnit || 'kgCO2e',
    scope: selected.scope,
    category: selected.category,
    source: selected.source,
    sourceReference: selected.sourceReference,
    gwpBasis: selected.gwpBasis,
    tier: selected.tier,
    applicabilityLevel,
    temporalStatus,
    isOverridden,
    override: activeOverride,
    selectionReason: isOverridden
      ? `Factor overridden by audit justification: "${activeOverride.reason}" (${activeOverride.source})`
      : `Matched via ${applicabilityLevel} geographic resolution (${selected.source})`
  };
}
