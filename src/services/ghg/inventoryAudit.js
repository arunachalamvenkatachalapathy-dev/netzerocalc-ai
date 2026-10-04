export const emissions = item => {
  const explicit = item.result_tco2e;
  return explicit != null && Number.isFinite(Number(explicit)) ? Number(explicit) : (Number(item.qty) || 0) * (Number(item.ef) || 0) / 1000;
};
export function selectExportPeriod(project, selectedYear) {
  const periods = project?.periods || [];
  return periods.find(p => Number(p.year) === Number(selectedYear ?? project?.activePeriodYear))
    || periods.find(p => p.id === project?.activePeriodId)
    || periods[periods.length - 1] || { year: null, bom: project?.bom || [] };
}
export function scope3Number(value) {
  const match = String(value ?? '').match(/^(?:cat(?:egory)?\s*)?(\d{1,2})(?:\b|:)/i);
  const n = Number(match?.[1]); return n >= 1 && n <= 15 ? n : null;
}
export function auditInventory(items = []) {
  return items.flatMap(item => {
    const issues = [];
    const add = (code, detail) => issues.push({ itemId: item.id, item: item.name || item.item || 'Unnamed item', code, detail });
    if (!String(item.name || item.item || '').trim()) add('name', 'Item name missing');
    if (!Number.isFinite(Number(item.qty)) || Number(item.qty) < 0) add('quantity', 'Quantity must be a non-negative number');
    if (!Number.isFinite(Number(item.ef)) || Number(item.ef) < 0) add('factor', 'Emission factor must be a non-negative number');
    if (!item.unit) add('unit', 'Activity unit missing');
    if (!item.sourceUrl && !item.efSource && !item.source) add('source', 'Factor source not recorded');
    if (!item.approved) add('approval', 'Not reviewed internally');
    if (!item.scope) add('scope', 'Scope not assigned');
    if (item.scope === 'Scope 3' && !scope3Number(item.scope3Category)) add('category', 'Scope 3 category not assigned');
    if (String(item.status || '').includes('DEMO')) add('demo', 'Demo data, not measured activity');
    return issues;
  });
}
export function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
export function parseWorkspaceBackup(value) {
  const projects = value?.format === 'netzerocalc-workspace-backup' ? value.projects : null;
  if (!Array.isArray(projects) || !projects.length || projects.length > 100) throw new Error('Choose a NetZeroCalc workspace backup with 1-100 projects.');
  for (const p of projects) {
    if (!p?.id || !Array.isArray(p.periods) || !p.periods.length) throw new Error('Backup project or reporting periods missing.');
    for (const period of p.periods) {
      if (!Number.isFinite(Number(period.year)) || !Array.isArray(period.bom)) throw new Error('Invalid period or inventory.');
      if (period.bom.some(i => !i || typeof i !== 'object' || !Number.isFinite(Number(i.qty)) || !Number.isFinite(Number(i.ef)))) throw new Error('Invalid inventory values in backup.');
    }
  }
  return projects;
}
