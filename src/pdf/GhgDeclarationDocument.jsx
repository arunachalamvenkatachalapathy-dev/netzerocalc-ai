import React from 'react';
import { 
  Document, Page, View, Text, StyleSheet, Svg, Rect 
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
    backgroundColor: '#ffffff'
  },
  // Header / Footer
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    fontSize: 7,
    color: '#64748b'
  },
  pageFooter: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    fontSize: 7,
    color: '#64748b'
  },

  // Cover Page Elements
  coverHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  badgePill: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold'
  },
  docTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.3
  },
  docSubtitle: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 14
  },
  disclaimerBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 0.75,
    borderColor: '#fde68a',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16
  },
  disclaimerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#92400e',
    marginBottom: 2
  },
  disclaimerText: {
    fontSize: 7.5,
    color: '#78350f',
    lineHeight: 1.35
  },

  // Grand Total Headline Card
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 14,
    color: '#ffffff',
    marginBottom: 16
  },
  heroLabel: {
    fontSize: 8,
    color: '#34d399',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4
  },
  heroValue: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff'
  },
  heroUnit: {
    fontSize: 12,
    color: '#34d399',
    fontFamily: 'Helvetica-Bold',
    marginLeft: 4
  },
  heroDeltaBadge: {
    backgroundColor: '#064e3b',
    color: '#6ee7b7',
    borderWidth: 0.5,
    borderColor: '#059669',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    alignSelf: 'flex-start',
    marginTop: 2
  },
  heroSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#334155'
  },
  heroSubItem: {
    fontSize: 7.5,
    color: '#cbd5e1'
  },

  // Meta Grid Box
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16
  },
  metaItem: {
    width: '50%',
    marginBottom: 6
  },
  metaLabel: {
    fontSize: 7,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase'
  },
  metaVal: {
    fontSize: 8.5,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
    marginTop: 1
  },

  // Section Typography
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginTop: 8,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.75,
    borderBottomColor: '#cbd5e1'
  },
  paragraph: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4,
    marginBottom: 8
  },

  // Tables
  table: {
    width: '100%',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: '#334155',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  tableRowEven: {
    backgroundColor: '#fcfdfd'
  },
  tableCell: {
    fontSize: 7.5,
    color: '#1e293b'
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a'
  },
  tableCellNumber: {
    textAlign: 'right'
  },

  // Attestation Box
  signBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginTop: 10
  }
});

export default function GhgDeclarationDocument({
  currentBOM = [],
  userProfile = { name: '', role: 'Internal Analyst', organization: 'ACME Corp' },
  activeProject,
  activePeriod,
  periods = [],
  baseYearPeriod,
  accountingStandard = 'ISO 14064-1 & GHG Protocol',
  appliedScenario = null,
  declarationSerial
}) {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const serial = declarationSerial || `DECL-GHG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Footprint computations
  const totalFootprint = currentBOM.reduce((acc, i) => {
    if (i.result_tco2e !== undefined && i.result_tco2e !== null) return acc + Number(i.result_tco2e);
    return acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000);
  }, 0);

  const scope1Total = currentBOM.filter(i => i.scope === 'Scope 1').reduce((acc, i) => {
    return acc + (i.result_tco2e ?? ((Number(i.qty) * Number(i.ef)) / 1000));
  }, 0);

  const scope2LocationTotal = currentBOM.filter(i => i.scope === 'Scope 2').reduce((acc, i) => {
    return acc + (i.result_tco2e ?? ((Number(i.qty) * Number(i.ef)) / 1000));
  }, 0);

  const scope2MarketTotal = currentBOM.filter(i => i.scope === 'Scope 2').reduce((acc, i) => {
    const ef = (i.marketEf !== undefined && i.marketEf !== null) ? Number(i.marketEf) : Number(i.ef);
    return acc + ((Number(i.qty) * ef) / 1000);
  }, 0);

  const scope3Total = currentBOM.filter(i => (i.scope || 'Scope 3') === 'Scope 3').reduce((acc, i) => {
    return acc + (i.result_tco2e ?? ((Number(i.qty) * Number(i.ef)) / 1000));
  }, 0);

  // Base Year Calculations
  const baseYearTotal = baseYearPeriod && baseYearPeriod.bom
    ? baseYearPeriod.bom.reduce((acc, i) => {
        if (i.result_tco2e !== undefined && i.result_tco2e !== null) return acc + Number(i.result_tco2e);
        return acc + (((Number(i.qty) || 0) * (Number(i.ef) || 0)) / 1000);
      }, 0)
    : 0;

  const yoyDeltaPct = baseYearTotal > 0 ? (((totalFootprint - baseYearTotal) / baseYearTotal) * 100) : 0;

  // Scope 3 breakdown by category
  const scope3CategoryMap = {};
  currentBOM.filter(i => (i.scope || 'Scope 3') === 'Scope 3').forEach(item => {
    const cat = item.scope3Category || 'Cat 1: Purchased Goods & Services';
    const val = item.result_tco2e !== undefined && item.result_tco2e !== null 
      ? Number(item.result_tco2e) 
      : ((Number(item.qty) || 0) * (Number(item.ef) || 0)) / 1000;
    scope3CategoryMap[cat] = (scope3CategoryMap[cat] || 0) + val;
  });

  const scope3Categories = Object.entries(scope3CategoryMap)
    .map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(3)),
      pctOfScope3: scope3Total > 0 ? ((value / scope3Total) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.value - a.value);

  // Multi-Period Trend data
  const trendPeriods = [...periods].sort((a, b) => a.year - b.year);

  // Change Log entries (last 6 entries)
  const changeLogs = (activeProject?.changeLog && Array.isArray(activeProject.changeLog))
    ? activeProject.changeLog.slice(0, 6)
    : [];

  return (
    <Document 
      title={`GHG_Declaration_${activeProject?.projectName || 'E-Credits'}_FY${activePeriod?.year || 2024}`}
      author={userProfile?.name || 'E-Credits Internal Analyst'}
      subject="Corporate GHG Inventory Internal Declaration (ISO 14064-1)"
    >
      
      {/* ========================================================================= */}
      {/* PAGE 1: COVER & EXECUTIVE SUMMARY */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        
        {/* Top Badge */}
        <View style={styles.coverHeaderBadge}>
          <Text style={styles.badgePill}>ISO 14064-1 & GHG PROTOCOL DISCLOSURE</Text>
        </View>

        {/* Title */}
        <Text style={styles.docTitle}>Pre-Audit Internal GHG Inventory Declaration</Text>
        <Text style={styles.docSubtitle}>
          Quantified Greenhouse Gas Emissions Statement for {activeProject?.projectName || 'Corporate Carbon Inventory'}
        </Text>

        {/* Prominent Legal Disclaimer Banner */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>REGULATORY ADVISORY & COMPLIANCE POSTURE:</Text>
          <Text style={styles.disclaimerText}>
            This document represents an internal self-declaration of quantified greenhouse gas emissions prepared for management planning, target tracking, and audit preparation. It is based on internal activity data and emission factors from India GHG Factors v6. It does not constitute a third-party assurance statement or formal verification under ISO 14064-3.
          </Text>
        </View>

        {/* Grand Total Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Consolidated Corporate Footprint (Location-Based)</Text>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{totalFootprint.toFixed(3)}</Text>
            <Text style={styles.heroUnit}>tCO2e</Text>
          </View>
          
          {!activePeriod?.isBaseYear && baseYearTotal > 0 && (
            <View style={styles.heroDeltaBadge}>
              <Text>
                {yoyDeltaPct <= 0 ? '(-)' : '(+)'} {Math.abs(yoyDeltaPct).toFixed(1)}% vs. Base Year (FY{baseYearPeriod?.year || 2023}) | {yoyDeltaPct <= 0 ? 'Net Emissions Reduction' : 'Net Emissions Increase'}
              </Text>
            </View>
          )}

          <View style={styles.heroSubRow}>
            <Text style={styles.heroSubItem}>Scope 1 Direct: {scope1Total.toFixed(3)} t</Text>
            <Text style={styles.heroSubItem}>Scope 2 Location: {scope2LocationTotal.toFixed(3)} t</Text>
            <Text style={styles.heroSubItem}>Scope 3 Value Chain: {scope3Total.toFixed(3)} t</Text>
          </View>
        </View>

        {/* Executive Meta Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Reporting Entity / Company</Text>
            <Text style={styles.metaVal}>{activeProject?.companyName || 'Corporate Entity'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Reporting Period (Fiscal Year)</Text>
            <Text style={styles.metaVal}>FY{activePeriod?.year || 2024} {activePeriod?.isBaseYear ? '(Base Year)' : ''}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Accounting Standard</Text>
            <Text style={styles.metaVal}>{accountingStandard}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Designated Base Year</Text>
            <Text style={styles.metaVal}>FY{baseYearPeriod?.year || 2023} ({baseYearTotal.toFixed(3)} tCO2e)</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Declaration Serial Number</Text>
            <Text style={styles.metaVal}>{serial}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Document Generation Date</Text>
            <Text style={styles.metaVal}>{generatedDate}</Text>
          </View>
        </View>

        {/* Preparer Box */}
        <View style={{ backgroundColor: '#f8fafc', padding: 8, borderRadius: 4, borderWidth: 0.5, borderColor: '#e2e8f0' }}>
          <Text style={{ fontSize: 7, color: '#64748b', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }}>Report Preparer</Text>
          <Text style={{ fontSize: 8, color: '#0f172a', fontFamily: 'Helvetica-Bold', marginTop: 1 }}>
            {userProfile?.name ? `${userProfile.name} | ${userProfile.role || 'Internal Analyst'} (${userProfile.organization || activeProject?.companyName})` : 'Internal Analyst (Self-Reported)'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text>{serial} | E-Credits BOM-to-LCI GHG Inventory</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>

      {/* ========================================================================= */}
      {/* PAGE 2: BOUNDARY, METHODOLOGY & SCOPE TOTALS */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.pageHeader} fixed>
          <Text>{activeProject?.companyName || 'Corporate Entity'} — GHG Declaration FY{activePeriod?.year || 2024}</Text>
          <Text>ISO 14064-1 Statement</Text>
        </View>

        <Text style={styles.sectionTitle}>1. Operational Boundary & Quantification Methodology</Text>
        <Text style={styles.paragraph}>
          This quantified carbon inventory has been compiled in conformance with ISO 14064-1:2018 and the GHG Protocol Corporate Accounting and Reporting Standard. The consolidation approach is based on operational control across all owned and operated manufacturing installations, logistics hubs, and corporate facilities.
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Consolidation Perimeter</Text>
            <Text style={styles.metaVal}>{activeProject?.coverBoundary?.consolidationApproach || 'Operational Control (100%)'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Materiality Cut-off Threshold</Text>
            <Text style={styles.metaVal}>{activeProject?.coverBoundary?.materialityThreshold || '5.0% Cumulative'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>GWP Metric Horizon</Text>
            <Text style={styles.metaVal}>{activeProject?.coverBoundary?.gwpVintage || 'IPCC AR6 (100-year GWP horizon)'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>LCI Factor Source Database</Text>
            <Text style={styles.metaVal}>India GHG Factors v6 & CEA Grid Mix 2024</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. Scope 1, 2, and 3 Consolidated Summary</Text>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Emission Scope</Text>
            <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Accounting Boundary Description</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>Footprint (tCO2e)</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>% of Total</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellBold, { width: '25%' }]}>Scope 1 (Direct)</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>Fuel combustion, diesel generators, process gases</Text>
            <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%' }]}>{scope1Total.toFixed(3)}</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{totalFootprint > 0 ? ((scope1Total / totalFootprint) * 100).toFixed(1) : '0.0'}%</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCell, styles.tableCellBold, { width: '25%' }]}>Scope 2 (Location-Based)</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>Purchased grid electricity (CEA Grid Average)</Text>
            <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%' }]}>{scope2LocationTotal.toFixed(3)}</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{totalFootprint > 0 ? ((scope2LocationTotal / totalFootprint) * 100).toFixed(1) : '0.0'}%</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellBold, { width: '25%' }]}>Scope 2 (Market-Based)</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>Dual reporting reflecting REC/PPA contracts</Text>
            <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%' }]}>{scope2MarketTotal.toFixed(3)}</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>Dual Metric</Text>
          </View>

          <View style={[styles.tableRow, styles.tableRowEven]}>
            <Text style={[styles.tableCell, styles.tableCellBold, { width: '25%' }]}>Scope 3 (Value Chain)</Text>
            <Text style={[styles.tableCell, { width: '35%' }]}>Upstream purchased goods & logistics</Text>
            <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%' }]}>{scope3Total.toFixed(3)}</Text>
            <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{totalFootprint > 0 ? ((scope3Total / totalFootprint) * 100).toFixed(1) : '0.0'}%</Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
            <Text style={[styles.tableCell, styles.tableCellBold, { width: '60%' }]}>TOTAL CORPORATE INVENTORY (Location-Based)</Text>
            <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%', color: '#047857' }]}>{totalFootprint.toFixed(3)} t</Text>
            <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%' }]}>100.0%</Text>
          </View>
        </View>

        {/* Multi-Period Trend Table */}
        {trendPeriods.length > 1 && (
          <View>
            <Text style={styles.sectionTitle}>3. Multi-Period Historical Carbon Trend</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Period</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>Scope 1 (t)</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>Scope 2 (t)</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>Scope 3 (t)</Text>
                <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>Total (tCO2e)</Text>
              </View>
              {trendPeriods.map((p, idx) => {
                const pBom = p.bom || [];
                const s1 = pBom.filter(i => i.scope === 'Scope 1').reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);
                const s2 = pBom.filter(i => i.scope === 'Scope 2').reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);
                const s3 = pBom.filter(i => (i.scope || 'Scope 3') === 'Scope 3').reduce((acc, i) => acc + (i.result_tco2e ?? ((i.qty * i.ef) / 1000)), 0);
                const tot = s1 + s2 + s3;

                return (
                  <View key={p.year} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                    <Text style={[styles.tableCell, styles.tableCellBold, { width: '20%' }]}>
                      FY{p.year} {p.isBaseYear ? '(Base)' : ''}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{s1.toFixed(3)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{s2.toFixed(3)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{s3.toFixed(3)}</Text>
                    <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%', color: '#0f172a' }]}>
                      {tot.toFixed(3)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text>{serial} | E-Credits BOM-to-LCI GHG Inventory</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>

      {/* ========================================================================= */}
      {/* PAGE 3: SCOPE 3 CATEGORY DISTRIBUTION */}
      {/* ========================================================================= */}
      {scope3Categories.length > 0 && (
        <Page size="A4" style={styles.page}>
          
          {/* Header */}
          <View style={styles.pageHeader} fixed>
            <Text>{activeProject?.companyName || 'Corporate Entity'} | Scope 3 Breakdown</Text>
            <Text>GHG Protocol Value Chain Standard</Text>
          </View>

          <Text style={styles.sectionTitle}>4. Scope 3 Category Breakdown (Categories 1-15)</Text>
          <Text style={styles.paragraph}>
            Scope 3 indirect emissions represent value chain activities upstream and downstream of operational facilities. The distribution below outlines quantified contributions aligned with the 15 categories defined under the GHG Protocol Scope 3 Standard and EU CSRD / CBAM requirements.
          </Text>

          {/* Scope 3 Category Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '55%' }]}>Scope 3 Standard Category</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '25%' }]}>Emissions (tCO2e)</Text>
              <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '20%' }]}>% of Scope 3</Text>
            </View>

            {scope3Categories.map((cat, idx) => (
              <View key={cat.name} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '55%' }]}>{cat.name}</Text>
                <Text style={[styles.tableCell, styles.tableCellNumber, { width: '25%' }]}>{cat.value.toFixed(3)}</Text>
                <Text style={[styles.tableCell, styles.tableCellNumber, { width: '20%' }]}>{cat.pctOfScope3}%</Text>
              </View>
            ))}

            <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
              <Text style={[styles.tableCell, styles.tableCellBold, { width: '55%' }]}>TOTAL SCOPE 3 VALUE CHAIN FOOTPRINT</Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '25%', color: '#047857' }]}>
                {scope3Total.toFixed(3)} t
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '20%' }]}>100.0%</Text>
            </View>
          </View>

          {/* Scope 3 SVG Bar Representation */}
          <View style={{ marginTop: 10, padding: 10, backgroundColor: '#f8fafc', borderRadius: 6, borderWidth: 0.5, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 8 }}>
              Visual Scope 3 Distribution Proportion
            </Text>
            {scope3Categories.slice(0, 6).map((cat) => {
              const barWidth = Math.max(4, Math.min(220, (cat.value / (scope3Total || 1)) * 220));
              return (
                <View key={cat.name} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ width: 140, fontSize: 7, color: '#475569' }}>{cat.name.slice(0, 24)}...</Text>
                  <View style={{ width: 230, height: 8, backgroundColor: '#e2e8f0', borderRadius: 2, marginRight: 6 }}>
                    <View style={{ width: barWidth, height: 8, backgroundColor: '#059669', borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{cat.pctOfScope3}%</Text>
                </View>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.pageFooter} fixed>
            <Text>{serial} | E-Credits BOM-to-LCI GHG Inventory</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>

        </Page>
      )}

      {/* ========================================================================= */}
      {/* PAGES 4+: COMPREHENSIVE LINE-ITEM INVENTORY */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.pageHeader} fixed>
          <Text>{activeProject?.companyName || 'Corporate Entity'} | Activity Inventory</Text>
          <Text>FY{activePeriod?.year || 2024} Activity Ledger</Text>
        </View>

        <Text style={styles.sectionTitle}>5. Activity Data & Emission Factor Ledger</Text>
        <Text style={styles.paragraph}>
          The complete line-item inventory table below enumerates all operational activities, measured activity quantities, emission factor ratings, and resulting tCO2e outputs across Scopes 1, 2, and 3.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Scope</Text>
            <Text style={[styles.tableHeaderCell, { width: '28%' }]}>Activity / Item Name</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '18%' }]}>Activity Data</Text>
            <Text style={[styles.tableHeaderCell, { width: '22%' }]}>LCI Factor Process</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '10%' }]}>EF</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellNumber, { width: '10%' }]}>tCO2e</Text>
          </View>

          {currentBOM.map((item, idx) => {
            const co2e = (item.result_tco2e !== undefined && item.result_tco2e !== null) 
              ? Number(item.result_tco2e).toFixed(3) 
              : (((Number(item.qty) || 0) * (Number(item.ef) || 0)) / 1000).toFixed(3);

            return (
              <View key={item.id || idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '12%' }]}>{item.scope || 'Scope 3'}</Text>
                <Text style={[styles.tableCell, { width: '28%' }]}>{item.name}</Text>
                <Text style={[styles.tableCell, styles.tableCellNumber, { width: '18%' }]}>{item.qty} {item.unit}</Text>
                <Text style={[styles.tableCell, { width: '22%' }]}>{item.process || 'Generic Factor'}</Text>
                <Text style={[styles.tableCell, styles.tableCellNumber, { width: '10%' }]}>{item.ef}</Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.tableCellNumber, { width: '10%', color: '#065f46' }]}>{co2e}</Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text>{serial} | E-Credits BOM-to-LCI GHG Inventory</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>

      {/* ========================================================================= */}
      {/* LAST PAGE: SCENARIOS, AUDIT TRAIL & SIGN-OFF */}
      {/* ========================================================================= */}
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.pageHeader} fixed>
          <Text>{activeProject?.companyName || 'Corporate Entity'} | Audit Trail & Verification</Text>
          <Text>ISO 14064-3 Evidentiary Record</Text>
        </View>

        {/* Decarbonization Scenario Section */}
        <Text style={styles.sectionTitle}>6. ISO 14064-2 Decarbonization Project Simulation</Text>
        {appliedScenario ? (
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Applied Scenario Name</Text>
              <Text style={styles.metaVal}>{appliedScenario.name || 'Decarbonization Lever Simulation'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Baseline Footprint</Text>
              <Text style={styles.metaVal}>{appliedScenario.baselineTotal?.toFixed(3)} tCO2e</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Avoided Carbon Emissions</Text>
              <Text style={[styles.metaVal, { color: '#047857' }]}>+{appliedScenario.avoidedTotal?.toFixed(3)} tCO2e</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Net Target Footprint</Text>
              <Text style={styles.metaVal}>{appliedScenario.netFootprint?.toFixed(3)} tCO2e</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.paragraph}>
            No active project mitigation scenario applied. Current inventory reflects Business-As-Usual (BAU) baseline operations.
          </Text>
        )}

        {/* Evidentiary Change Log Table */}
        <Text style={styles.sectionTitle}>7. Evidentiary Change Log & Audit History</Text>
        {changeLogs.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '22%' }]}>Timestamp</Text>
              <Text style={[styles.tableHeaderCell, { width: '22%' }]}>Action Category</Text>
              <Text style={[styles.tableHeaderCell, { width: '38%' }]}>Summary Details</Text>
              <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Author</Text>
            </View>

            {changeLogs.map((log, idx) => (
              <View key={log.id || idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                <Text style={[styles.tableCell, { width: '22%' }]}>
                  {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, { width: '22%' }]}>
                  {log.action?.replace(/_/g, ' ')}
                </Text>
                <Text style={[styles.tableCell, { width: '38%' }]}>{log.summary}</Text>
                <Text style={[styles.tableCell, { width: '18%' }]}>{log.author || 'Internal Analyst'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.paragraph}>No external audit modifications recorded for this reporting period.</Text>
        )}

        {/* Preparer Sign-Off Box */}
        <Text style={styles.sectionTitle}>8. Internal Declaration Attestation</Text>
        <View style={styles.signBox}>
          <Text style={{ fontSize: 7.5, color: '#334155', lineHeight: 1.35, marginBottom: 8 }}>
            "I hereby attest that the emission factors and activity quantities compiled in this document represent the verified internal accounting records of the reporting installation for the stated period."
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#cbd5e1' }}>
            <View>
              <Text style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase' }}>Authorized Preparer</Text>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 1 }}>
                {userProfile?.name || 'Internal GHG Analyst'}
              </Text>
              <Text style={{ fontSize: 7, color: '#64748b' }}>{userProfile?.role || 'ESG Accounting Preparer'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 7, color: '#64748b', textTransform: 'uppercase' }}>Declaration Serial & Status</Text>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 1 }}>
                {serial}
              </Text>
              <Text style={{ fontSize: 7, color: '#059669', fontFamily: 'Helvetica-Bold' }}>SELF-REPORTED / UNVERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text>{serial} | E-Credits BOM-to-LCI GHG Inventory</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>

    </Document>
  );
}
