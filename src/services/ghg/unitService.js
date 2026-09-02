/**
 * Unit Compatibility & Physical Dimensionality Service
 * Reference: NetZeroCalc Phase 2 Specification & GHG Protocol
 */

export const UNIT_DIMENSIONS = {
  // Mass (Base: kg)
  kg: { dimension: 'mass', toBase: 1.0 },
  kilogram: { dimension: 'mass', toBase: 1.0 },
  kilograms: { dimension: 'mass', toBase: 1.0 },
  g: { dimension: 'mass', toBase: 0.001 },
  gram: { dimension: 'mass', toBase: 0.001 },
  grams: { dimension: 'mass', toBase: 0.001 },
  t: { dimension: 'mass', toBase: 1000.0 },
  tonne: { dimension: 'mass', toBase: 1000.0 },
  tonnes: { dimension: 'mass', toBase: 1000.0 },
  'metric ton': { dimension: 'mass', toBase: 1000.0 },
  'metric tons': { dimension: 'mass', toBase: 1000.0 },
  lb: { dimension: 'mass', toBase: 0.45359237 },
  pound: { dimension: 'mass', toBase: 0.45359237 },
  pounds: { dimension: 'mass', toBase: 0.45359237 },
  oz: { dimension: 'mass', toBase: 0.028349523125 },

  // Volume (Base: Liter)
  L: { dimension: 'volume', toBase: 1.0 },
  l: { dimension: 'volume', toBase: 1.0 },
  liter: { dimension: 'volume', toBase: 1.0 },
  liters: { dimension: 'volume', toBase: 1.0 },
  litre: { dimension: 'volume', toBase: 1.0 },
  litres: { dimension: 'volume', toBase: 1.0 },
  m3: { dimension: 'volume', toBase: 1000.0 },
  'cubic meter': { dimension: 'volume', toBase: 1000.0 },
  'cubic meters': { dimension: 'volume', toBase: 1000.0 },
  'cubic metre': { dimension: 'volume', toBase: 1000.0 },
  'cubic metres': { dimension: 'volume', toBase: 1000.0 },
  scm: { dimension: 'volume', toBase: 1000.0 }, // Standard cubic meter
  gallon: { dimension: 'volume', toBase: 3.78541 }, // US liquid gallon
  gallons: { dimension: 'volume', toBase: 3.78541 },
  barrel: { dimension: 'volume', toBase: 158.987 }, // Oil barrel
  barrels: { dimension: 'volume', toBase: 158.987 },

  // Energy (Base: kWh)
  kWh: { dimension: 'energy', toBase: 1.0 },
  kwh: { dimension: 'energy', toBase: 1.0 },
  MWh: { dimension: 'energy', toBase: 1000.0 },
  mwh: { dimension: 'energy', toBase: 1000.0 },
  GWh: { dimension: 'energy', toBase: 1000000.0 },
  gwh: { dimension: 'energy', toBase: 1000000.0 },
  MJ: { dimension: 'energy', toBase: 0.27777778 },
  mj: { dimension: 'energy', toBase: 0.27777778 },
  GJ: { dimension: 'energy', toBase: 277.77778 },
  gj: { dimension: 'energy', toBase: 277.77778 },
  kJ: { dimension: 'energy', toBase: 0.0002777778 },
  kj: { dimension: 'energy', toBase: 0.0002777778 },
  BTU: { dimension: 'energy', toBase: 0.000293071 },
  therm: { dimension: 'energy', toBase: 29.3001 },

  // Distance (Base: km)
  km: { dimension: 'distance', toBase: 1.0 },
  kilometer: { dimension: 'distance', toBase: 1.0 },
  kilometers: { dimension: 'distance', toBase: 1.0 },
  mi: { dimension: 'distance', toBase: 1.609344 },
  mile: { dimension: 'distance', toBase: 1.609344 },
  miles: { dimension: 'distance', toBase: 1.609344 },

  // Freight Transport Activity (Base: tkm - tonne-kilometer)
  tkm: { dimension: 'freight_transport', toBase: 1.0 },
  'tonne-km': { dimension: 'freight_transport', toBase: 1.0 },
  'ton-km': { dimension: 'freight_transport', toBase: 1.0 },
  'ton-mile': { dimension: 'freight_transport', toBase: 1.459972 },

  // Passenger Transport Activity (Base: p-km - passenger-kilometer)
  'p-km': { dimension: 'passenger_transport', toBase: 1.0 },
  pkm: { dimension: 'passenger_transport', toBase: 1.0 },
  'passenger-km': { dimension: 'passenger_transport', toBase: 1.0 },
  'passenger-mile': { dimension: 'passenger_transport', toBase: 1.609344 },

  // Spend / Currency
  INR: { dimension: 'currency', toBase: 1.0 },
  USD: { dimension: 'currency', toBase: 1.0 },
  EUR: { dimension: 'currency', toBase: 1.0 },
  GBP: { dimension: 'currency', toBase: 1.0 },

  // Discrete Counts
  unit: { dimension: 'count', toBase: 1.0 },
  units: { dimension: 'count', toBase: 1.0 },
  pcs: { dimension: 'count', toBase: 1.0 },
  night: { dimension: 'count', toBase: 1.0 },
  nights: { dimension: 'count', toBase: 1.0 }
};

/**
 * Normalizes unit string representations to canonical abbreviations
 */
export function normalizeUnit(rawUnit) {
  if (!rawUnit || typeof rawUnit !== 'string') return '';
  const trimmed = rawUnit.trim();
  const entry = UNIT_DIMENSIONS[trimmed] || UNIT_DIMENSIONS[trimmed.toLowerCase()];
  if (entry) {
    // Return canonical format for recognized units
    const lower = trimmed.toLowerCase();
    if (['kg', 'kilogram', 'kilograms'].includes(lower)) return 'kg';
    if (['g', 'gram', 'grams'].includes(lower)) return 'g';
    if (['t', 'tonne', 'tonnes', 'metric ton', 'metric tons'].includes(lower)) return 'tonne';
    if (['lb', 'pound', 'pounds'].includes(lower)) return 'lb';
    if (['l', 'liter', 'liters', 'litre', 'litres'].includes(lower)) return 'L';
    if (['m3', 'cubic meter', 'cubic meters', 'cubic metre', 'cubic metres'].includes(lower)) return 'm3';
    if (['kwh'].includes(lower)) return 'kWh';
    if (['mwh'].includes(lower)) return 'MWh';
    if (['gwh'].includes(lower)) return 'GWh';
    if (['km', 'kilometer', 'kilometers'].includes(lower)) return 'km';
    if (['mi', 'mile', 'miles'].includes(lower)) return 'mi';
    if (['tkm', 'tonne-km', 'ton-km'].includes(lower)) return 'tkm';
    if (['pkm', 'p-km', 'passenger-km'].includes(lower)) return 'p-km';
  }
  return trimmed;
}

/**
 * Returns physical dimension category of a unit (e.g. 'mass', 'volume', 'energy')
 */
export function getUnitDimension(unit) {
  if (!unit || typeof unit !== 'string') return null;
  const trimmed = unit.trim();
  const entry = UNIT_DIMENSIONS[trimmed] || UNIT_DIMENSIONS[trimmed.toLowerCase()];
  return entry ? entry.dimension : null;
}

/**
 * Checks whether two units share the same physical dimension and can be converted
 */
export function areUnitsCompatible(unitA, unitB) {
  const dimA = getUnitDimension(unitA);
  const dimB = getUnitDimension(unitB);
  if (!dimA || !dimB) return false;
  return dimA === dimB;
}

/**
 * Converts a quantity from sourceUnit to targetUnit.
 * Rejects cross-dimensional conversions unless an explicit density or physical property is supplied.
 */
export function convertQuantity(quantity, sourceUnit, targetUnit, options = {}) {
  const num = Number(quantity);
  if (isNaN(num)) {
    throw new Error(`Invalid numeric quantity: ${quantity}`);
  }

  const s = sourceUnit?.trim();
  const t = targetUnit?.trim();

  if (!s || !t) {
    throw new Error(`Both source unit and target unit must be specified.`);
  }

  if (s.toLowerCase() === t.toLowerCase()) {
    return { convertedQuantity: num, factor: 1.0, sourceUnit: s, targetUnit: t };
  }

  const sEntry = UNIT_DIMENSIONS[s] || UNIT_DIMENSIONS[s.toLowerCase()];
  const tEntry = UNIT_DIMENSIONS[t] || UNIT_DIMENSIONS[t.toLowerCase()];

  if (!sEntry) {
    throw new Error(`Unrecognized source unit: "${sourceUnit}"`);
  }
  if (!tEntry) {
    throw new Error(`Unrecognized target unit: "${targetUnit}"`);
  }

  // Cross-dimensional handling (e.g. Mass <-> Volume via explicit density)
  if (sEntry.dimension !== tEntry.dimension) {
    if (options.densityKgPerLiter) {
      // Allow Mass <-> Volume if density is explicitly provided
      if (sEntry.dimension === 'volume' && tEntry.dimension === 'mass') {
        // Volume (L) * density (kg/L) = Mass (kg)
        const volumeLiters = num * sEntry.toBase;
        const massKg = volumeLiters * options.densityKgPerLiter;
        const finalQuantity = massKg / tEntry.toBase;
        return {
          convertedQuantity: finalQuantity,
          factor: finalQuantity / num,
          sourceUnit: s,
          targetUnit: t,
          notes: `Converted volume to mass using explicit density ${options.densityKgPerLiter} kg/L.`
        };
      } else if (sEntry.dimension === 'mass' && tEntry.dimension === 'volume') {
        const massKg = num * sEntry.toBase;
        const volumeLiters = massKg / options.densityKgPerLiter;
        const finalQuantity = volumeLiters / tEntry.toBase;
        return {
          convertedQuantity: finalQuantity,
          factor: finalQuantity / num,
          sourceUnit: s,
          targetUnit: t,
          notes: `Converted mass to volume using explicit density ${options.densityKgPerLiter} kg/L.`
        };
      }
    }

    throw new Error(
      `Incompatible physical dimensions: cannot convert "${sourceUnit}" (${sEntry.dimension}) to "${targetUnit}" (${tEntry.dimension}) without explicit physical conversion parameters.`
    );
  }

  // Within the same dimension: convert via standard base ratio
  const baseValue = num * sEntry.toBase;
  const converted = baseValue / tEntry.toBase;
  const factor = sEntry.toBase / tEntry.toBase;

  return {
    convertedQuantity: converted,
    factor,
    sourceUnit: s,
    targetUnit: t
  };
}
