/**
 * Open Emission Factor Reference Databases & Citations
 * Aggregates open-access datasets with transparent provenance, geographic bounds, and licensing metadata.
 */

export const OPEN_FACTOR_DATABASES = [
  {
    id: "defra_2024",
    name: "UK Government GHG Conversion Factors (DEFRA 2024)",
    organization: "UK Department for Environment, Food & Rural Affairs / DESNZ",
    year: 2024,
    coverage: "Global & UK Activity Benchmarks (Fuels, Electricity, Business Travel, Freighting)",
    license: "Open Government Licence v3.0 (Free to use, adapt, and distribute with attribution)",
    methodology: "IPCC AR5 100-year GWP & UK Environmental Reporting Guidelines",
    officialUrl: "https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting",
    scopeCoverage: ["Scope 1 (Fuels)", "Scope 2 (UK Grid)", "Scope 3 (Categories 1, 4, 6, 7)"]
  },
  {
    id: "india_cea_v6",
    name: "India GHG Emission Factors Database (v6.0) & CEA Grid Mix (v19/v20)",
    organization: "Central Electricity Authority (CEA), Ministry of Power & CII/WRI India",
    year: 2024,
    coverage: "India Regional Grid Mix, Domestic Industrial Raw Materials, Cement & Thermal Fuels",
    license: "Public Domain / Open Access Government Data",
    methodology: "Central Electricity Authority CO2 Baseline Database for the Indian Power Sector",
    officialUrl: "https://cea.nic.in/cdm-co2-baseline-database/",
    scopeCoverage: ["Scope 1 (Coal & Biomass)", "Scope 2 (India National Grid 0.716 kg CO2/kWh)", "Scope 3 (Cat 1 Raw Materials)"]
  },
  {
    id: "eu_cbam_2024",
    name: "EU CBAM Default Benchmark Values (Implementing Reg 2021/447 & 2024/873)",
    organization: "European Commission Directorate-General for Taxation and Customs Union",
    year: 2024,
    coverage: "Iron & Steel, Aluminium, Cement, Fertilizers, Hydrogen, Electricity",
    license: "Official Journal of the European Union (Public Access)",
    methodology: "EU ETS Transitional Period Benchmarks under Regulation (EU) 2023/956",
    officialUrl: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
    scopeCoverage: ["Scope 1 Direct Specific Emissions", "Scope 2 Indirect Heat/Electricity Benchmarks"]
  },
  {
    id: "byol_ecoinvent",
    name: "Bring-Your-Own-License (BYOL) LCA Integration",
    organization: "Private Licensed Deployments (e.g. ecoinvent Association, Sphera / GaBi, USLCI)",
    year: "User Managed",
    coverage: "18,000+ Multi-regional Cradle-to-Grave Life Cycle Inventory Processes",
    license: "Proprietary Commercial End-User License (Client Managed Instance)",
    methodology: "CML, ReCiPe 2016, EF 3.1, IPCC 2021",
    officialUrl: "https://ecoinvent.org/",
    scopeCoverage: ["Full Cradle-to-Grave LCIA & Elementary Flows"]
  }
];
