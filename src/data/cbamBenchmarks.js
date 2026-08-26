/**
 * EU Carbon Border Adjustment Mechanism (CBAM) Benchmark Reference Database
 * 
 * Official Regulatory Sources:
 * 1. Regulation (EU) 2023/956 of the European Parliament and of the Council (Annex I & Annex IV).
 * 2. Commission Implementing Regulation (EU) 2023/1773 (Rules for transitional period and reporting obligations).
 * 3. European Commission Directorate-General for Taxation and Customs Union (DG TAXUD) Default Values Guidance.
 * 4. Commission Implementing Regulation (EU) 2021/447 and Commission Implementing Regulation (EU) 2024/873 (EU ETS product benchmark values).
 */

export const CBAM_BENCHMARKS = [
  // ==========================================
  // 1. ALUMINIUM SECTOR (CN 7601 - 7616)
  // ==========================================
  {
    sector: 'Aluminium',
    sectorCode: 'AL',
    cnCode: '7601 10 00',
    productName: 'Unwrought Aluminium, Non-Alloyed (Primary Smelter Ingot)',
    productionRoute: 'Primary Smelting (Hall-Héroult Electrolysis)',
    directBenchmark: 1.464, // tCO2e/t (EU ETS benchmark for direct emissions per Implementing Reg 2021/447)
    euDefaultBenchmark: 14.50, // tCO2e/t (Indicative default penalty including grid fallback)
    euEtsBestInClass: 6.80, // tCO2e/t (Low-carbon hydro/renewables powered primary smelter)
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2', 'PFCs (CF4, C2F6)'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'CBAM definitive phase requires actual verified emissions. EU default penalty assigns high indirect electricity factor from regional grid mix.'
  },
  {
    sector: 'Aluminium',
    sectorCode: 'AL',
    cnCode: '7601 20 00',
    productName: 'Unwrought Aluminium Alloys / Secondary Recycled Ingot',
    productionRoute: 'Secondary Smelting & Scrap Refining',
    directBenchmark: 0.280, // tCO2e/t
    euDefaultBenchmark: 2.10, // tCO2e/t
    euEtsBestInClass: 0.45, // tCO2e/t
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'Secondary aluminium has over 90% lower embedded emissions than primary virgin metal under CBAM methodology.'
  },
  {
    sector: 'Aluminium',
    sectorCode: 'AL',
    cnCode: '7606 12 00',
    productName: 'Aluminium Alloy Plates, Sheets & Strip (Thickness > 0.2mm)',
    productionRoute: 'Rolling & Finishing from Ingot/Slab',
    directBenchmark: 0.350,
    euDefaultBenchmark: 15.20,
    euEtsBestInClass: 7.20,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2', 'PFCs'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'Complex good: includes precursor embedded emissions from unwrought aluminium ingot.'
  },
  {
    sector: 'Aluminium',
    sectorCode: 'AL',
    cnCode: '7604 29 00',
    productName: 'Aluminium Alloy Extruded Bars, Rods & Profiles',
    productionRoute: 'Extrusion from Billet',
    directBenchmark: 0.420,
    euDefaultBenchmark: 15.40,
    euEtsBestInClass: 7.40,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2', 'PFCs'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'Calculated using precursor specific embedded emissions plus extrusion electricity intensity.'
  },

  // ==========================================
  // 2. IRON & STEEL SECTOR (CN 7201 - 7326)
  // ==========================================
  {
    sector: 'Iron & Steel',
    sectorCode: 'FE',
    cnCode: '7201 10 00',
    productName: 'Pig Iron & Hot Metal (Blast Furnace)',
    productionRoute: 'Blast Furnace - Basic Oxygen Furnace (BF-BOF)',
    directBenchmark: 1.288, // tCO2e/t (EU ETS benchmark per Commission Implementing Regulation (EU) 2021/447)
    euDefaultBenchmark: 2.15, // tCO2e/t
    euEtsBestInClass: 1.35,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2021/447',
    notes: 'BF-BOF route has high coke and direct reduction emissions. DRI-EAF route reduces intensity significantly.'
  },
  {
    sector: 'Iron & Steel',
    sectorCode: 'FE',
    cnCode: '7206 10 00',
    productName: 'Crude Steel (Electric Arc Furnace - Scrap Route)',
    productionRoute: 'Electric Arc Furnace (EAF - 100% Scrap)',
    directBenchmark: 0.210,
    euDefaultBenchmark: 0.65,
    euEtsBestInClass: 0.28,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2021/447',
    notes: 'Scrap-based EAF steel achieves the lowest direct embedded emissions under EU ETS benchmarks.'
  },
  {
    sector: 'Iron & Steel',
    sectorCode: 'FE',
    cnCode: '7208 51 00',
    productName: 'Hot-Rolled Steel Flat Products & Heavy Plates',
    productionRoute: 'Continuous Casting & Hot Strip Mill',
    directBenchmark: 0.310,
    euDefaultBenchmark: 2.33,
    euEtsBestInClass: 1.55,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'EU default penalty for flat steel imports based on regional average BF-BOF carbon intensity.'
  },
  {
    sector: 'Iron & Steel',
    sectorCode: 'FE',
    cnCode: '7213 10 00',
    productName: 'Steel Wire Rod & Rebars (Concrete Reinforcing Bars)',
    productionRoute: 'EAF / Rolling Mill',
    directBenchmark: 0.290,
    euDefaultBenchmark: 2.10,
    euEtsBestInClass: 0.95,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'Includes heating furnace fuels and rolling electricity consumption.'
  },

  // ==========================================
  // 3. CEMENT SECTOR (CN 2523)
  // ==========================================
  {
    sector: 'Cement',
    sectorCode: 'CEM',
    cnCode: '2523 10 00',
    productName: 'Cement Clinker (Dry Process)',
    productionRoute: 'Rotary Kiln Calcination (Dry Process with Precalciner)',
    directBenchmark: 0.693, // tCO2e/t (EU ETS benchmark per Commission Implementing Regulation (EU) 2021/447)
    euDefaultBenchmark: 0.766, // tCO2e/t (DG TAXUD published benchmark)
    euEtsBestInClass: 0.680,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2021/447',
    notes: 'Process emissions from limestone calcination (CaCO3 -> CaO + CO2) represent ~60% of total clinker emissions.'
  },
  {
    sector: 'Cement',
    sectorCode: 'CEM',
    cnCode: '2523 29 00',
    productName: 'Portland Pozzolana / Blended Cement (PPC)',
    productionRoute: 'Clinker Grinding with Fly Ash / Slag Additives',
    directBenchmark: 0.480,
    euDefaultBenchmark: 0.650,
    euEtsBestInClass: 0.420,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'High fly-ash/slag blending ratio (clinker factor < 70%) delivers significant CBAM certificate savings.'
  },

  // ==========================================
  // 4. FERTILISERS SECTOR (CN 2808, 2814, 3102)
  // ==========================================
  {
    sector: 'Fertilisers',
    sectorCode: 'FERT',
    cnCode: '2814 10 00',
    productName: 'Anhydrous Ammonia (Haber-Bosch)',
    productionRoute: 'Natural Gas Steam Methane Reforming + Synthesis',
    directBenchmark: 1.573, // tCO2e/t (EU ETS benchmark per Commission Implementing Regulation (EU) 2021/447)
    euDefaultBenchmark: 1.850, // tCO2e/t
    euEtsBestInClass: 1.520,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2', 'N2O'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2021/447',
    notes: 'Ammonia is the primary precursor for urea, nitric acid, and ammonium nitrate fertilisers.'
  },
  {
    sector: 'Fertilisers',
    sectorCode: 'FERT',
    cnCode: '3102 10 00',
    productName: 'Urea (Synthesized with CO2 recycling)',
    productionRoute: 'Ammonia + CO2 Reaction & Prilling',
    directBenchmark: 0.350,
    euDefaultBenchmark: 1.250,
    euEtsBestInClass: 0.980,
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2', 'N2O'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2023/1773',
    notes: 'Embedded emissions include precursor ammonia consumption minus chemical CO2 bound in molecule.'
  },

  // ==========================================
  // 5. HYDROGEN SECTOR (CN 2804 10 00)
  // ==========================================
  {
    sector: 'Hydrogen',
    sectorCode: 'H2',
    cnCode: '2804 10 00',
    productName: 'Hydrogen (Grey / SMR Process)',
    productionRoute: 'Steam Methane Reforming (Natural Gas)',
    directBenchmark: 6.840, // tCO2e/t (EU ETS benchmark per Commission Implementing Regulation (EU) 2021/447)
    euDefaultBenchmark: 9.200, // tCO2e/t
    euEtsBestInClass: 0.500, // Green Electrolytic Hydrogen
    unit: 'tCO₂e / tonne product',
    includedGases: ['CO2'],
    regulationRef: 'Regulation (EU) 2023/956 Annex I; Commission Implementing Regulation (EU) 2021/447',
    notes: 'Electrolytic green hydrogen (RE powered) has 0.00 tCO2e direct emissions, creating a major tariff advantage.'
  }
];

export const CBAM_SECTORS = [
  'All Covered Sectors',
  'Aluminium',
  'Iron & Steel',
  'Cement',
  'Fertilisers',
  'Hydrogen'
];
