import { REGULATIONS_2026_DATABASE } from '../data/regulations2026Data.js';

const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * Fetch regulations from backend API with automatic fallback to bundled database
 */
export async function fetchRegulations({ status = 'all', region = 'All Regions', search = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (region && region !== 'All Regions') params.append('region', region);
    if (search && search.trim()) params.append('search', search.trim());

    const url = `${API_BASE}/api/regulations${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.info('Backend regulations API not reachable, using bundled regulations database.', err.message);
  }

  // Fallback to local filtering
  return filterRegulationsLocally(REGULATIONS_2026_DATABASE, { status, region, search });
}

/**
 * Filter regulations locally in client memory
 */
export function filterRegulationsLocally(items = REGULATIONS_2026_DATABASE, { status = 'all', region = 'All Regions', search = '' } = {}) {
  return items.filter(item => {
    // 1. Status Filter
    if (status && status !== 'all' && item.statusCode !== status) {
      return false;
    }

    // 2. Region Filter
    if (region && region !== 'All Regions' && item.region !== region) {
      return false;
    }

    // 3. Search Filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      const matchCountry = item.country?.toLowerCase().includes(q);
      const matchReg = item.regulation?.toLowerCase().includes(q);
      const matchShort = item.shortForm?.toLowerCase().includes(q);
      const matchAuth = item.authority?.toLowerCase().includes(q);
      const matchScope = item.scopeSummary?.toLowerCase().includes(q);
      if (!matchCountry && !matchReg && !matchShort && !matchAuth && !matchScope) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get aggregated counts by status
 */
export function getRegulationStats(items = REGULATIONS_2026_DATABASE) {
  const total = items.length;
  const inForce = items.filter(r => r.statusCode === 'in-force').length;
  const upcoming = items.filter(r => r.statusCode === 'upcoming').length;
  const developing = items.filter(r => r.statusCode === 'developing').length;
  const notInForce = items.filter(r => r.statusCode === 'not-in-force').length;

  return {
    total,
    inForce,
    upcoming,
    developing,
    notInForce
  };
}

/**
 * Export regulations array to CSV
 */
export function exportRegulationsToCSV(items) {
  const headers = [
    'Country / Jurisdiction',
    'Regulation Title',
    'Acronym / Short Form',
    'Status',
    'Enforcement Year',
    'Regulating Authority',
    'Materiality Standard',
    'Assurance Requirement',
    'GHG Scopes Covered',
    'Official Source Link'
  ];

  const escapeCSV = (val) => {
    if (val == null) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const rows = items.map(item => [
    escapeCSV(item.country),
    escapeCSV(item.regulation),
    escapeCSV(item.shortForm),
    escapeCSV(item.status),
    escapeCSV(item.year),
    escapeCSV(item.authority),
    escapeCSV(item.materiality),
    escapeCSV(item.assurance),
    escapeCSV(item.ghgScopesRequired),
    escapeCSV(item.sourceUrl)
  ].join(','));

  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ESG_Regulations_Status_2026_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export regulations array to JSON
 */
export function exportRegulationsToJSON(items) {
  const exportPayload = {
    metadata: {
      title: "Global ESG & Sustainability Reporting Regulations Status 2026",
      source: "NetZeroCalc-AI Regulatory Intelligence Engine",
      exportedAt: new Date().toISOString(),
      regulationsCount: items.length
    },
    regulations: items
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ESG_Regulations_2026_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
