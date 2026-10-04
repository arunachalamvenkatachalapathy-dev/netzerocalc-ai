// Only combine the same activity and factor context. Different units, scopes,
// facilities or emission factors must remain separate to avoid invalid totals.
const text = value => String(value ?? '').trim().toLowerCase();
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const category = item => text(item.scope).startsWith('scope 1') || text(item.scope).startsWith('scope 2') ? '' : text(item.scope3Category || 'Cat 1: Purchased Goods & Services');
const key = item => JSON.stringify([
  text(item.name || item.item), text(item.unit), text(item.scope),
  category(item), text(item.facilityId), number(item.ef)
]);

export function withBomQuantity(item, qty) {
  const updated = { ...item, qty: number(qty) };
  if (item.result_tco2e != null) updated.result_tco2e = updated.qty * number(item.ef) / 1000;
  return updated;
}

export function mergeBomItems(existing = [], incoming = []) {
  const rows = [];
  const byKey = new Map();
  const ids = new Set();
  for (const item of [...existing, ...incoming]) {
    const identity = key(item);
    const index = text(item.name || item.item) ? byKey.get(identity) : undefined;
    if (index !== undefined) {
      // Keep the original ID, factor, approval, notes and attribution.
      rows[index] = withBomQuantity(rows[index], number(rows[index].qty) + number(item.qty));
    } else {
      let id = item.id;
      if (id == null || ids.has(String(id))) id = globalThis.crypto.randomUUID();
      ids.add(String(id));
      byKey.set(identity, rows.length);
      rows.push({ ...item, id, qty: number(item.qty) });
    }
  }
  return rows;
}
