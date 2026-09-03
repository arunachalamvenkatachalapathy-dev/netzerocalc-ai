/**
 * NetZeroCalc-AI — Authoritative Corporate GHG Factor Library
 * Standard: GHG Protocol Corporate Standard & Scope 2 Guidance
 * GWP: IPCC AR6 (100-year) — CH4: 29.8, N2O: 273
 */

export const GWP_AR6 = {
  CO2: 1.0,
  CH4: 29.8,
  N2O: 273.0
};

export const GHG_FACTOR_LIBRARY = {
  stationary: {
    natural_gas: {
      label: "Natural Gas",
      value: 0.18316,
      unit: "kgCO2e/kWh_gross",
      supportedUnits: ["kWh_gross", "MWh", "therms", "m3"],
      source: "DEFRA 2024",
      version: "2024.1",
      tier: 2
    },
    diesel: {
      label: "Diesel (Gas Oil)",
      value: 2.68787,
      unit: "kgCO2e/L",
      supportedUnits: ["L", "gallons", "m3", "tonnes"],
      source: "DEFRA 2024",
      version: "2024.1",
      tier: 2
    },
    fuel_oil: {
      label: "Fuel Oil (Heavy/Residual)",
      value: 3.17,
      unit: "kgCO2e/L",
      supportedUnits: ["L", "gallons", "tonnes"],
      source: "EPA 2023",
      version: "2023.1",
      tier: 2
    },
    lpg: {
      label: "LPG (Liquefied Petroleum Gas)",
      value: 1.55537,
      unit: "kgCO2e/L",
      supportedUnits: ["L", "kg", "gallons"],
      source: "DEFRA 2024",
      version: "2024.1",
      tier: 2
    },
    coal: {
      label: "Coal (Industrial Bituminous)",
      value: 2.42,
      unit: "kgCO2e/kg",
      supportedUnits: ["kg", "tonnes"],
      source: "IPCC AR6 / CEA",
      version: "2021.1",
      tier: 3
    }
  },

  mobile_fuel: {
    petrol: {
      label: "Motor Gasoline (Petrol)",
      value: 2.31495,
      unit: "kgCO2e/L",
      supportedUnits: ["L", "gallons"],
      source: "DEFRA 2024",
      version: "2024.1",
      tier: 2
    },
    diesel: {
      label: "On-Road Diesel",
      value: 2.68787,
      unit: "kgCO2e/L",
      supportedUnits: ["L", "gallons"],
      source: "DEFRA 2024",
      version: "2024.1",
      tier: 2
    },
    cng: {
      label: "CNG (Compressed Natural Gas)",
      value: 0.44602,
      unit: "kgCO2e/kg",
      supportedUnits: ["kg"],
      source: "DEFRA 2024",
      version: "2024.1",
      tier: 2
    }
  },

  mobile_distance: {
    car_avg: {
      label: "Average Passenger Car",
      value: 0.168,
      unit: "kgCO2e/km",
      supportedUnits: ["km", "miles"],
      source: "DEFRA 2024 (Average car)",
      version: "2024.1",
      tier: 3
    },
    van: {
      label: "Light Commercial Van (<3.5t)",
      value: 0.251,
      unit: "kgCO2e/km",
      supportedUnits: ["km", "miles"],
      source: "DEFRA 2024 (Class II)",
      version: "2024.1",
      tier: 3
    },
    hgv: {
      label: "Heavy Goods Vehicle (Rigid >17t)",
      value: 0.842,
      unit: "kgCO2e/km",
      supportedUnits: ["km", "miles"],
      source: "DEFRA 2024 (HGV rigid avg)",
      version: "2024.1",
      tier: 3
    }
  },

  grid_location: {
    IN: {
      label: "India — National Grid Mix (CEA CO2 Baseline Database v19)",
      value: 0.716,
      unit: "kgCO2e/kWh",
      source: "CEA India 2024 (Weighted Average)",
      version: "19.0",
      tier: 2
    },
    US: {
      label: "United States — National Average (eGRID 2023)",
      value: 0.367,
      unit: "kgCO2e/kWh",
      source: "EPA eGRID 2023",
      version: "2023.1",
      tier: 2
    },
    EU: {
      label: "European Union — EU-27 Grid Average",
      value: 0.230,
      unit: "kgCO2e/kWh",
      source: "EEA 2023 EU-27",
      version: "2023.1",
      tier: 2
    },
    UK: {
      label: "United Kingdom — National Grid",
      value: 0.207,
      unit: "kgCO2e/kWh",
      source: "DEFRA 2024 UK Grid",
      version: "2024.1",
      tier: 2
    },
    DK: {
      label: "Denmark — Energinet Grid Mix",
      value: 0.135,
      unit: "kgCO2e/kWh",
      source: "Energinet 2023",
      version: "2023.1",
      tier: 2
    },
    CN: {
      label: "China — National Grid Average",
      value: 0.581,
      unit: "kgCO2e/kWh",
      source: "IEA 2023 CN avg",
      version: "2023.1",
      tier: 3
    },
    global: {
      label: "Global Default — World Grid Average",
      value: 0.436,
      unit: "kgCO2e/kWh",
      source: "IEA 2023 World Average",
      version: "2023.1",
      tier: 3
    }
  },

  residual_mix: {
    EU: {
      label: "European Residual Mix (AIB 2023)",
      value: 0.400,
      unit: "kgCO2e/kWh",
      source: "AIB European Residual Mix 2023",
      version: "2023.1",
      tier: 2
    },
    US: {
      label: "US Green-e Residual Mix",
      value: 0.450,
      unit: "kgCO2e/kWh",
      source: "Green-e Residual Mix 2023",
      version: "2023.1",
      tier: 2
    },
    global: {
      label: "Global Conservative Residual Proxy",
      value: 0.500,
      unit: "kgCO2e/kWh",
      source: "IEA / GHG Protocol conservative proxy",
      version: "2023.1",
      tier: 3
    }
  },

  scope3_activity: {
    cat1:  { label: "1. Purchased Goods & Services", value: 0.420, unit: "kgCO2e/$ (sector avg)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat2:  { label: "2. Capital Goods", value: 0.380, unit: "kgCO2e/$ (capital goods avg)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat3:  { label: "3. Fuel- and Energy-Related Activities", value: 0.045, unit: "kgCO2e/kWh (WTT+T&D)", source: "DEFRA 2024 WTT", version: "2024.1", tier: 2 },
    cat4:  { label: "4. Upstream Transportation & Distribution", value: 0.000113, unit: "kgCO2e/tonne-km (road freight)", source: "DEFRA 2024", version: "2024.1", tier: 2 },
    cat5:  { label: "5. Waste Generated in Operations", value: 21.30, unit: "kgCO2e/tonne (mixed landfill)", source: "DEFRA 2024", version: "2024.1", tier: 2 },
    cat6:  { label: "6. Business Travel", value: 0.158, unit: "kgCO2e/passenger-km (short-haul air)", source: "DEFRA 2024", version: "2024.1", tier: 2 },
    cat7:  { label: "7. Employee Commuting", value: 0.171, unit: "kgCO2e/km (avg commute mode mix)", source: "DEFRA 2024", version: "2024.1", tier: 3 },
    cat8:  { label: "8. Upstream Leased Assets", value: 0.18316, unit: "kgCO2e/kWh (leased asset energy)", source: "DEFRA 2024", version: "2024.1", tier: 2 },
    cat9:  { label: "9. Downstream Transportation & Distribution", value: 0.000113, unit: "kgCO2e/tonne-km", source: "DEFRA 2024", version: "2024.1", tier: 2 },
    cat10: { label: "10. Processing of Sold Products", value: 0.050, unit: "kgCO2e/unit processed", source: "Ecoinvent 3.9", version: "3.9", tier: 3 },
    cat11: { label: "11. Use of Sold Products", value: 0.367, unit: "kgCO2e/kWh (use-phase grid avg)", source: "EPA eGRID 2023", version: "2023.1", tier: 3 },
    cat12: { label: "12. End-of-Life Treatment of Sold Products", value: 21.30, unit: "kgCO2e/tonne (EoL mixed)", source: "DEFRA 2024", version: "2024.1", tier: 3 },
    cat13: { label: "13. Downstream Leased Assets", value: 0.18316, unit: "kgCO2e/kWh (leased asset energy)", source: "DEFRA 2024", version: "2024.1", tier: 2 },
    cat14: { label: "14. Franchises", value: 0.436, unit: "kgCO2e/$ revenue (franchise S1+S2 proxy)", source: "Internal proxy", version: "1.0", tier: 3 },
    cat15: { label: "15. Investments", value: 0.300, unit: "kgCO2e/$ invested (PCAF generic proxy)", source: "PCAF generic proxy", version: "2023.1", tier: 3 }
  },

  scope3_spend: {
    cat1:  { label: "1. Purchased Goods & Services", value: 0.420, unit: "kgCO2e/$", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat2:  { label: "2. Capital Goods", value: 0.380, unit: "kgCO2e/$", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat3:  { label: "3. Fuel- and Energy-Related Activities", value: 0.050, unit: "kgCO2e/$", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat4:  { label: "4. Upstream Transportation & Distribution", value: 0.200, unit: "kgCO2e/$ (freight services)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat5:  { label: "5. Waste Generated in Operations", value: 0.150, unit: "kgCO2e/$ (waste mgmt services)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat6:  { label: "6. Business Travel", value: 0.250, unit: "kgCO2e/$ (travel services)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat7:  { label: "7. Employee Commuting", value: 0.100, unit: "kgCO2e/$ (commuting proxy)", source: "Internal proxy", version: "1.0", tier: 3 },
    cat8:  { label: "8. Upstream Leased Assets", value: 0.300, unit: "kgCO2e/$ (leased real estate)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat9:  { label: "9. Downstream Transportation & Distribution", value: 0.200, unit: "kgCO2e/$ (freight services)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat10: { label: "10. Processing of Sold Products", value: 0.280, unit: "kgCO2e/$ (processing services)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat11: { label: "11. Use of Sold Products", value: 0.330, unit: "kgCO2e/$ (product use proxy)", source: "Internal proxy", version: "1.0", tier: 3 },
    cat12: { label: "12. End-of-Life Treatment of Sold Products", value: 0.150, unit: "kgCO2e/$ (EoL services)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat13: { label: "13. Downstream Leased Assets", value: 0.300, unit: "kgCO2e/$ (leased real estate)", source: "EPA USEEIO v2.1", version: "2023.1", tier: 3 },
    cat14: { label: "14. Franchises", value: 0.436, unit: "kgCO2e/$ revenue", source: "Internal proxy", version: "1.0", tier: 3 },
    cat15: { label: "15. Investments", value: 0.300, unit: "kgCO2e/$ invested", source: "PCAF generic proxy", version: "2023.1", tier: 3 }
  }
};

export const SCOPE3_CATEGORY_NAMES = {
  cat1: "1. Purchased Goods & Services",
  cat2: "2. Capital Goods",
  cat3: "3. Fuel- and Energy-Related Activities",
  cat4: "4. Upstream Transportation & Distribution",
  cat5: "5. Waste Generated in Operations",
  cat6: "6. Business Travel",
  cat7: "7. Employee Commuting",
  cat8: "8. Upstream Leased Assets",
  cat9: "9. Downstream Transportation & Distribution",
  cat10: "10. Processing of Sold Products",
  cat11: "11. Use of Sold Products",
  cat12: "12. End-of-Life Treatment of Sold Products",
  cat13: "13. Downstream Leased Assets",
  cat14: "14. Franchises",
  cat15: "15. Investments"
};
