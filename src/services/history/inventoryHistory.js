// Compare item snapshots across reporting periods. Do not fabricate pre-release history.
export function diffInventory(before = {}, after = {}) {
  const index = (p) => new Map((p.periods || []).flatMap(per => (per.bom || []).map((item, i) => [`${per.year}:${item.id ?? `row-${i}`}`, { year: per.year, item }])));
  const oldRows = index(before), newRows = index(after), changes = [];
  for (const key of new Set([...oldRows.keys(), ...newRows.keys()])) {
    const old = oldRows.get(key), next = newRows.get(key);
    const a = old?.item ?? null, b = next?.item ?? null;
    const fields = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])].sort();
    const changedFields = fields.filter(f => JSON.stringify(a?.[f] ?? null) !== JSON.stringify(b?.[f] ?? null));
    if (!changedFields.length && a && b) continue;
    changes.push({ period_year: next?.year ?? old.year, item_id: String(b?.id ?? a?.id ?? key), item_name: b?.name ?? a?.name ?? b?.item ?? a?.item ?? 'Inventory item', action: !a ? 'added' : !b ? 'deleted' : 'edited', before_item: a, after_item: b, changed_fields: changedFields });
  }
  return changes;
}
export function withLocalHistory(before, after, actor = 'Guest (this browser)') {
  const changes = diffInventory(before, after);
  if (!changes.length) return after;
  const timestamp = new Date().toISOString();
  return { ...after, itemHistory: [...changes.map((c, i) => ({ ...c, id: `${timestamp}-${i}-${Math.random().toString(36).slice(2)}`, created_at: timestamp, actor_label: actor, source: 'browser' })), ...(before.itemHistory || [])] };
}
export function displayHistoryValue(value) {
  if (value === undefined || value === null) return '(not set)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
