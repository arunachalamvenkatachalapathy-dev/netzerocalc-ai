/**
 * BRSR Core & Product Carbon Footprint (PCF) Export Service
 * Aligned with SEBI BRSR Core Principle 6 Guidance and GHG Protocol Product Standard.
 */

export function generateBrsrCorePcfData(project) {
  const activePeriod = project?.periods?.find(p => p.id === project.activePeriodId) || project?.periods?.[0] || {
    periodName: 'FY2024',
    bom: project?.bom || []
  };

  const bom = activePeriod.bom || [];

  const scope1Items = bom.filter(i => i.scope === 'Scope 1');
  const scope2Items = bom.filter(i => i.scope === 'Scope 2');
  const scope3Items = bom.filter(i => (i.scope || 'Scope 3') === 'Scope 3');

  const calcTotal = (items) => items.reduce((sum, i) => sum + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);

  const scope1Total = calcTotal(scope1Items);
  const scope2Total = calcTotal(scope2Items);
  const scope3Total = calcTotal(scope3Items);
  const grossFootprint = scope1Total + scope2Total + scope3Total;

  // Assume 1000 production units if not explicitly configured
  const totalProductionUnits = project.productionVolume || 1000;
  const unitOfMeasure = project.productionUnit || 'Metric Tonnes (MT) of Finished Product';
  const intensityPerUnit = totalProductionUnits > 0 ? (grossFootprint / totalProductionUnits) : 0;

  const brsrPayload = {
    metadata: {
      standard: "SEBI BRSR Core Principle 6 - Essential Indicator 7 & 8",
      framework: "GHG Protocol Product Life Cycle Accounting and Reporting Standard / ISO 14067",
      entityName: project.companyName || "Corporate Entity",
      productName: project.projectName || "Product Carbon Footprint Inventory",
      reportingPeriod: activePeriod.periodName || "FY2024",
      functionalUnit: `1 ${unitOfMeasure}`,
      systemBoundary: "Cradle-to-Gate (Raw Materials Extraction through Finished Product Gate)",
      generatedAt: new Date().toISOString(),
      disclaimer: "INTERNAL SCREENING ONLY. Prepared for management review and BRSR Core pre-audit filing preparation. Third-party assurance required for formal statutory filing."
    },
    productionMetrics: {
      totalProductionVolume: totalProductionUnits,
      productionUnit: unitOfMeasure,
      productCarbonIntensity_tCO2e_per_unit: Number(intensityPerUnit.toFixed(4)),
      productCarbonIntensity_kgCO2e_per_unit: Number((intensityPerUnit * 1000).toFixed(2))
    },
    inventorySummary: {
      scope1_directEmissions_tCO2e: Number(scope1Total.toFixed(4)),
      scope2_indirectElectricity_tCO2e: Number(scope2Total.toFixed(4)),
      scope3_valueChainEmissions_tCO2e: Number(scope3Total.toFixed(4)),
      grossCarbonFootprint_tCO2e: Number(grossFootprint.toFixed(4))
    },
    scope3CategoryBreakdown: Array.from({ length: 15 }, (_, i) => {
      const catNum = i + 1;
      const catItems = scope3Items.filter(item => (item.scope3Category || 1) === catNum);
      const catTotal = calcTotal(catItems);
      return {
        categoryNumber: catNum,
        categoryName: getScope3CategoryName(catNum),
        emissions_tCO2e: Number(catTotal.toFixed(4)),
        percentageOfScope3: scope3Total > 0 ? Number(((catTotal / scope3Total) * 100).toFixed(2)) : 0
      };
    }).filter(c => c.emissions_tCO2e > 0),
    lineItemActivityLedger: bom.map((item, index) => ({
      serialNo: index + 1,
      itemDescription: item.item,
      lifecycleStage: item.stage || "Raw Material Acquisition",
      scope: item.scope || "Scope 3",
      scope3Category: item.scope === 'Scope 3' ? (item.scope3Category || 1) : null,
      activityQuantity: item.qty,
      activityUnit: item.unit,
      emissionFactor: item.ef,
      emissionFactorUnit: item.efUnit || "kg CO2e / unit",
      emissionFactorSource: item.efSource || "Open LCI Database (DEFRA / CEA / CBAM)",
      totalEmissions_tCO2e: Number((item.result_tco2e ?? ((item.qty * item.ef) / 1000)).toFixed(4)),
      dqrScore: item.dqrScore || 2.2
    }))
  };

  return brsrPayload;
}

export function downloadBrsrCorePcfJson(project) {
  const data = generateBrsrCorePcfData(project);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (project.projectName || 'Project').replace(/[^a-z0-9]/gi, '_');
  a.download = `${safeName}_BRSR_Core_PCF_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadBrsrCorePcfCsv(project) {
  const data = generateBrsrCorePcfData(project);
  
  const headers = [
    "Serial No",
    "Item Description",
    "Lifecycle Stage",
    "Scope",
    "Scope 3 Category",
    "Activity Quantity",
    "Unit",
    "Emission Factor (kg CO2e/unit)",
    "Factor Source",
    "Emissions (tCO2e)",
    "DQR Score"
  ];

  const rows = data.lineItemActivityLedger.map(item => [
    item.serialNo,
    `"${(item.itemDescription || '').replace(/"/g, '""')}"`,
    `"${item.lifecycleStage}"`,
    item.scope,
    item.scope3Category || 'N/A',
    item.activityQuantity,
    item.activityUnit,
    item.emissionFactor,
    `"${item.emissionFactorSource}"`,
    item.totalEmissions_tCO2e,
    item.dqrScore
  ]);

  const csvContent = [
    `# SEBI BRSR Core Principle 6 Product Carbon Footprint Report`,
    `# Entity: ${data.metadata.entityName}`,
    `# Product: ${data.metadata.productName}`,
    `# Reporting Period: ${data.metadata.reportingPeriod}`,
    `# Gross Product Carbon Footprint: ${data.inventorySummary.grossCarbonFootprint_tCO2e} tCO2e`,
    `# Product Carbon Intensity: ${data.productionMetrics.productCarbonIntensity_tCO2e_per_unit} tCO2e / unit`,
    `# System Boundary: ${data.metadata.systemBoundary}`,
    `# Disclaimer: ${data.metadata.disclaimer}`,
    ``,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (project.projectName || 'Project').replace(/[^a-z0-9]/gi, '_');
  a.download = `${safeName}_BRSR_Core_PCF_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getScope3CategoryName(catNum) {
  const names = [
    "Purchased Goods & Services",
    "Capital Goods",
    "Fuel- & Energy-Related Activities",
    "Upstream Transportation & Distribution",
    "Waste Generated in Operations",
    "Business Travel",
    "Employee Commuting",
    "Upstream Leased Assets",
    "Downstream Transportation & Distribution",
    "Processing of Sold Products",
    "Use of Sold Products",
    "End-of-Life Treatment of Sold Products",
    "Downstream Leased Assets",
    "Franchises",
    "Investments"
  ];
  return names[catNum - 1] || `Category ${catNum}`;
}
