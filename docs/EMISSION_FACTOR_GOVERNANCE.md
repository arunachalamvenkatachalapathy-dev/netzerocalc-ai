# NetZeroCalc-AI — Emission Factor Governance & Methodology Specification

**Document Version:** 1.0.0  
**Status:** Approved & Implemented (Phase 2)  
**Applicable Standards:** GHG Protocol Corporate Standard (Chapter 5: Tracking Emissions Over Time), GHG Protocol Scope 3 Standard, ISO 14064-1:2018, SBTi Corporate Net-Zero Standard V2.0 (June 2026)  
**Primary Engine:** `src/services/ghg/factorRegistry.js`  
**Unit Conversion Engine:** `src/services/ghg/unitService.js`

---

## 1. Executive Summary & Core Principles

The **Emission Factor Registry & Governance Engine** serves as the single authoritative source of carbon accounting conversion factors for NetZeroCalc-AI. It replaces informal lookup tables with an auditable, version-controlled library supporting site-specific overrides, strict immutability, and deterministic factor resolution.

### Core Governance Principles
1. **Factor Immutability:** Once an emission factor is applied to a calculation in a locked or assured reporting period, it **must never be mutated in-place**. If an emission factor requires correction or a newer vintage is published, the system spawns a new version (`version: n + 1`). Historical calculations continue referencing the exact historical factor ID and vintage.
2. **Authoritative Provenance (No Fabricated Defaults):** Every production factor requires documented provenance: source authority, publication year, dataset version, primary reference document or URL, and methodological tier. Factors lacking primary verification are explicitly flagged as `provisional` or `unverified`.
3. **Transparent Lineage & Auditable Overrides:** Any user or site-specific replacement of a default factor is recorded as an auditable **Factor Override** that preserves the original factor ID, original value, replacement value, replacement unit, mandatory justification reason, and evidence citation.
4. **Dimension-Safe Compatibility:** Conversion between activity data units and factor denominator units enforces physical dimension safety. Cross-dimensional conversions (e.g., volume to mass) are blocked unless accompanied by explicit physical properties (e.g., fuel density).

---

## 2. Emission Factor Schema Definition

Every factor managed by the registry adheres to the following interface:

```typescript
interface EmissionFactor {
  id: string;                      // Unique identifier (e.g., 'ef_cea_grid_national_2024')
  name: string;                    // Human-readable title
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category: string;                // e.g., 'Stationary Combustion', 'Purchased Electricity'
  activityType: string;            // e.g., 'Fuel Combustion', 'Grid Electricity'
  factorValue: number;             // Numeric conversion factor (non-negative)
  numeratorUnit: string;           // Standard: 'kgCO2e' (or 'tCO2e')
  denominatorUnit: string;         // Standard activity unit: 'kWh', 'L', 'kg', 'm3', 'tkm'
  co2eUnit: string;                // Output metric: 'kgCO2e'
  gases?: {                        // Disaggregated greenhouse gas inventory where available
    co2?: number;
    ch4?: number;
    n2o?: number;
    pfc?: number;
    hfc?: number;
    sf6?: number;
    nf3?: number;
    notes?: string;
  };
  geography: string;               // ISO 2-letter country code or 'GLOBAL'
  country: string;                 // e.g., 'India', 'United Kingdom', 'Global'
  region?: string | null;          // State/Province (e.g., 'Southern Region', 'Maharashtra')
  gridRegion?: string | null;      // Grid interconnect (e.g., 'IN_CEA_NATIONAL', 'IN_SOUTHERN')
  source: string;                  // Publishing entity (e.g., 'Central Electricity Authority (CEA)')
  sourceOrganization: string;      // Organization (e.g., 'Ministry of Power, Government of India')
  sourceReference: string;         // Primary citation URL or publication title
  sourceVersion: string;           // Dataset vintage (e.g., 'v19.0', '2024.1')
  publicationYear: number;         // Year published (e.g., 2023, 2024)
  validFrom: string;               // ISO YYYY-MM-DD start date of applicability
  validTo?: string | null;         // ISO YYYY-MM-DD end date (null if ongoing)
  gwpBasis: 'IPCC AR6' | 'IPCC AR5' | 'IPCC AR4';
  methodology: string;             // Methodological basis (e.g., 'Weighted Operating Margin / Build Margin')
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  uncertainty?: string | number;   // e.g., '±5%'
  status: 'verified' | 'provisional' | 'unverified';
  isDefault: boolean;              // True if part of official baseline library
  isCustom: boolean;               // True if created by tenant/user
  version: number;                 // Integer version (1, 2, 3...)
  supersedes?: string | null;      // Previous factor ID if this is a revision
  supersededBy?: string | null;    // Subsequent factor ID if this has been superseded
  metadata?: Record<string, any>;  // Physical constants (density, calorific values, CN codes)
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Seeded Authoritative Baselines

The baseline library in `factorRegistry.js` contains verified open-access reference datasets:

### 3.1 India Electricity Grid Factors (CEA Baseline Database v19.0)
*Source:* Central Electricity Authority (CEA), Ministry of Power, Government of India. *CO2 Baseline Database for the Indian Power Sector, User Guide Version 19.0 (Dec 2023)*. Tier 2, IPCC AR6 GWP basis.
- **National Grid Average (Weighted Operating/Build Margin):** `0.7160 kgCO2e/kWh` (`IN_CEA_NATIONAL`)
- **Southern Regional Grid (TN, KA, AP, TS, KL):** `0.6980 kgCO2e/kWh` (`IN_SOUTHERN`)
- **Western Regional Grid (MH, GJ, MP, CG, Goa):** `0.7420 kgCO2e/kWh` (`IN_WESTERN`)
- **Northern Regional Grid (DL, HR, PB, UP, RJ, UK, HP, JK):** `0.7050 kgCO2e/kWh` (`IN_NORTHERN`)
- **Eastern Regional Grid (WB, OD, JH, BR):** `0.7550 kgCO2e/kWh` (`IN_EASTERN`)
- **North-Eastern Regional Grid (AS, ML, MN, MZ, NL, TR, AR):** `0.4850 kgCO2e/kWh` (`IN_NORTH_EASTERN`)

### 3.2 India Thermal & Mobile Fuels (India GHG Program & MoEFCC)
*Source:* WRI India / TERI / CII India GHG Program v6 & MoEFCC Standard Factors. Includes documented EPA CH4/N2O stoichiometric combustion uplift. Tier 2, IPCC AR6 GWP basis.
- **Diesel Fuel (Stationary Boilers & DG Sets):** `2.6558 kgCO2e/L` (Base CO2: 2.6400, Uplift: 0.0158)
- **Petrol / Motor Gasoline (Mobile):** `2.2836 kgCO2e/L` (Base CO2: 2.2700, Uplift: 0.0136)
- **Indian Coal (Non-Coking, Industrial Boilers):** `1.9919 kgCO2e/kg` (Base CO2: 1.9800, Uplift: 0.0119)
- **Furnace Oil:** `3.1186 kgCO2e/L` (Base CO2: 3.1000, Uplift: 0.0186)
- **Natural Gas:** `1.8913 kgCO2e/m3` (Base CO2: 1.8800, Uplift: 0.0113)
- **Commercial LPG:** `2.9979 kgCO2e/kg` (Base CO2: 2.9800, Uplift: 0.0179)
- **Compressed Natural Gas (CNG):** `2.6860 kgCO2e/kg` (Base CO2: 2.6700, Uplift: 0.0160)

### 3.3 UK DEFRA / DESNZ 2024 Conversion Factors
*Source:* UK Department for Energy Security and Net Zero (DESNZ) / DEFRA 2024.1.
- **UK National Grid Electricity:** `0.20705 kgCO2e/kWh`
- **Passenger Car (Average Diesel, Distance):** `0.1684 kgCO2e/km`
- **Passenger Car (Average Petrol, Distance):** `0.1648 kgCO2e/km`
- **Freight Transport (Rigid HGV 7.5t-17t):** `0.1983 kgCO2e/tkm`
- **Air Travel (Domestic Flight with Radiative Forcing):** `0.2458 kgCO2e/p-km`
- **Hotel Stay (India Benchmark):** `42.5000 kgCO2e/room-night`
- **Municipal Mains Water Supply:** `0.1490 kgCO2e/m3`
- **Municipal Water Treatment:** `0.2720 kgCO2e/m3`

### 3.4 EU CBAM Default Benchmark Values (Regulation (EU) 2021/447 & 2024/873)
*Source:* European Commission Directorate-General for Taxation and Customs Union.
- **Primary Aluminium Ingot (CN 7601):** `14.2000 kgCO2e/kg`
- **Crude Steel (BF-BOF Primary Route):** `2.1500 kgCO2e/kg`
- **Crude Steel (EAF Scrap/Secondary Route):** `0.4500 kgCO2e/kg`
- **Cement Clinker (Grey Clinker CN 2523):** `0.8500 kgCO2e/kg`
- **Anhydrous Ammonia (CN 2814):** `2.4000 kgCO2e/kg`

---

## 4. Deterministic Factor Resolution Hierarchy

When an activity line is evaluated, the `resolveEmissionFactor` engine resolves the applicable factor deterministically according to this strict hierarchy:

$$\begin{aligned}
\text{Step 1} &\longrightarrow \textbf{Audit Overrides (Site-Specific > Enterprise-Wide)} \\
\text{Step 2} &\longrightarrow \textbf{Activity Type \& Scope Filtering} \\
\text{Step 3} &\longrightarrow \textbf{GWP Basis Alignment (IPCC AR6 vs AR5)} \\
\text{Step 4} &\longrightarrow \textbf{Geographic Precedence: Facility Site} \succ \textbf{Grid Region} \succ \textbf{Country} \succ \textbf{Global Fallback} \\
\text{Step 5} &\longrightarrow \textbf{Temporal Applicability Window Check} \\
\text{Step 6} &\longrightarrow \textbf{Physical Unit Dimension Compatibility Check}
\end{aligned}$$

### Diagnostic Failure Mode
If no factor matches the activity, geography, and reporting window, or if physical units are incompatible, the resolver **fails immediately with an explicit audit exception**. The engine never silently falls back to an unrelated factor or guesses an arbitrary number.

---

## 5. Unit Dimensionality & Physical Conversions

The `unitService.js` module classifies units into fundamental physical dimensions:
- **Mass:** `kg` (base: 1.0), `g`, `tonne` (1000.0 kg), `lb`, `oz`
- **Volume:** `L` (base: 1.0), `m3` (1000.0 L), `scm`, `gallon`, `barrel`
- **Energy:** `kWh` (base: 1.0), `MWh` (1000.0 kWh), `GWh`, `MJ`, `GJ`, `BTU`, `therm`
- **Distance:** `km` (base: 1.0), `mi`
- **Freight Transport Activity:** `tkm` (base: 1.0), `ton-mile`
- **Passenger Transport Activity:** `p-km` (base: 1.0), `passenger-mile`
- **Spend / Currency:** `INR`, `USD`, `EUR`, `GBP`
- **Discrete Counts:** `unit`, `pcs`, `night`

### Cross-Dimensional Safeguard
Conversions across different physical dimensions (e.g., Liters of fuel to kilograms) require explicit physical constants:
$$\text{Mass (kg)} = \text{Volume (L)} \times \text{Density} \left(\frac{\text{kg}}{\text{L}}\right)$$
Attempting to convert without density triggers an `Incompatible physical dimensions` error.

---

## 6. Audit Overrides Governance

When an operational facility utilizes on-site primary data (such as a bilateral power purchase agreement [PPA] or specialized biofuel formulation), the default factor is replaced via a **Factor Override**:

```typescript
interface FactorOverride {
  id: string;
  organizationId: string;
  facilityId: string | null;           // null = enterprise-wide, string = site-specific
  originalFactorId: string;
  replacementFactorValue: number;
  replacementUnit: string;
  reason: string;                     // Mandatory auditor justification
  source: string;                     // Supplier or regulatory authority
  sourceReference: string;            // Contract ID, lab test serial, or PPA filing
  evidence?: string | null;
  createdBy: string;
  createdAt: string;
}
```

Overrides never delete or overwrite the baseline factor. Both values remain visible in audit logs and compliance exports.
