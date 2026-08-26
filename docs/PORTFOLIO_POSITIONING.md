# NetZeroCalc: Portfolio Positioning & Technical Interview Guide

**Prepared for:** Arunachalam Venkatachalapathy  
**Project:** [NetZeroCalc (e-credits)](https://github.com/arunachalamvenkatachalapathy-dev/e-credits)  
**Role Positioning:** ESG Analyst / LCA Data Engineer / Sustainability Tech Specialist  

---

## 📌 Executive Pitch (30-Second Elevator Summary)

> *"I built **NetZeroCalc**, an open-source web application that solves the semantic friction between manufacturing Bills of Materials (BOM) and Life Cycle Inventory (LCI) background databases. It enables sustainability practitioners and engineers to map physical components to emission factors (DEFRA 2024, CEA India Grid, EU CBAM benchmarks), evaluate data quality using a 5-indicator Pedigree Matrix (DQR), model decarbonization levers in real time, and export directly to SEBI BRSR Core PCF schemas and openLCA JSON-LD process bridges."*

---

## 💼 Resume Bullet Points (Ready for Copy-Paste)

- **Engineered an open-source BOM-to-LCI semantic mapping workbench (NetZeroCalc)** in React 19 to automate cradle-to-gate Product Carbon Footprint (PCF) calculations aligned with ISO 14040/14044 and the GHG Protocol Product Standard.
- **Implemented a 5-dimension Data Quality Rating (DQR) engine** based on the ILCD/ecoinvent Pedigree Matrix (Reliability, Completeness, Temporal, Geographical, Technological) with weighted project uncertainty scoring.
- **Built compliant data exchange bridges** generating structured SEBI BRSR Core Principle 6 PCF reports and ILCD-compliant `JSON-LD` process packages for native ingestion into openLCA.
- **Integrated multi-jurisdiction open emission datasets** including UK DEFRA 2024, India Central Electricity Authority (CEA v19/v20), and official EU CBAM default benchmarks (Implementing Regulations 2021/447 & 2024/873).
- **Developed real-time decarbonization simulation tooling** allowing product teams to model material substitution, recycled feedstock ratios, and renewable power transitions with instant carbon intensity delta tracking.

---

## 🎙️ Technical Interview Questions & Model Answers

### Q1: "Why build a custom BOM-to-LCI mapper when tools like openLCA or SimaPro exist?"
**Answer:**
> *"Full-suite LCA tools like openLCA and SimaPro are extraordinary for comprehensive matrix-based LCIA research and academic studies, but they have steep learning curves, require complex local Java desktop environments, and lack intuitive, web-native BOM spreadsheet interfaces for rapid prototyping. NetZeroCalc is designed as a lightweight, transparent screening bridge: product engineers can import a BOM CSV, match it against open emission factors with full provenance, assess data quality ratings, and then export the finalized process directly into openLCA via JSON-LD for deeper downstream characterization."*

### Q2: "How does the Data Quality Rating (DQR) Pedigree Matrix work in NetZeroCalc?"
**Answer:**
> *"We implement the standard 5-indicator Pedigree Matrix derived from the ILCD / ecoinvent guidelines: Reliability, Completeness, Temporal Representativeness, Geographical Match, and Technological Consistency. Each dimension is scored from 1 (verified primary data) to 5 (rough proxy). The system calculates an arithmetic mean per BOM line item, formats it into an ILCD tuple vector like `(1;2;1;1;2)`, and computes a weighted average project-level DQR weighted by each line item's tCO2e contribution to highlight where supply chain primary data collection is most critical."*

### Q3: "How does NetZeroCalc ensure compliance with SEBI BRSR Core requirements?"
**Answer:**
> *"SEBI BRSR Core Principle 6 (Essential Indicators 7 & 8) mandates disclosure of Scope 1, Scope 2, and Scope 3 product carbon footprints and GHG intensity ratios per unit of output. NetZeroCalc structure allows users to define the functional unit and total production volume, aggregates Scope 1/2/3 cradle-to-gate boundaries, categorizes Scope 3 items into the 15 GHG Protocol categories, and outputs both a machine-readable JSON schema and audit-ready CSV matrix for statutory pre-audit filing."*
