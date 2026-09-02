/**
 * Reporting Period Management Service
 * Supports arbitrary date bounds (calendar year, fiscal year, custom),
 * status locking, base-year designation, and PCF BOM continuity.
 * Reference: NetZeroCalc_Antigravity_Implementation_Spec.xlsx (Phase 1 & Input Dictionary)
 */

import { PERIOD_STATUSES } from './types.js';

/**
 * Validates reporting period inputs. Returns array of error messages.
 */
export function validatePeriod(data, existingPeriods = [], currentPeriodId = null) {
  const errors = [];

  if (!data.label || !data.label.trim()) {
    errors.push('Reporting period label is required.');
  } else {
    const trimmed = data.label.trim().toLowerCase();
    const isDuplicate = existingPeriods.some(p => 
      p.id !== currentPeriodId && p.label.trim().toLowerCase() === trimmed
    );
    if (isDuplicate) {
      errors.push('A reporting period with this label already exists.');
    }
  }

  const year = parseInt(data.reportingYear);
  if (isNaN(year) || year < 1990 || year > 2100) {
    errors.push('Reporting year must be a valid 4-digit calendar year (1990-2100).');
  }

  if (!data.startDate || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.startDate.trim())) {
    errors.push('Start date is required in YYYY-MM-DD format.');
  }

  if (!data.endDate || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.endDate.trim())) {
    errors.push('End date is required in YYYY-MM-DD format.');
  }

  if (data.startDate && data.endDate && data.startDate.trim() > data.endDate.trim()) {
    errors.push('End date cannot be earlier than start date.');
  }

  if (data.status && !PERIOD_STATUSES.includes(data.status)) {
    errors.push(`Invalid status. Must be one of: ${PERIOD_STATUSES.join(', ')}`);
  }

  return errors;
}

/**
 * Creates a new Reporting Period with validation and backward-compatible BOM attachment
 */
export function createReportingPeriod(organizationId, data, existingPeriods = [], copyBom = []) {
  const errors = validatePeriod(data, existingPeriods);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const now = new Date().toISOString();
  const year = parseInt(data.reportingYear);
  const isBase = Boolean(data.isBaseYear);

  const newPeriod = {
    id: 'per_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    organizationId: organizationId || 'org_default',
    label: data.label.trim(),
    reportingYear: year,
    year: year, // for backward-compatibility with existing PCF code
    startDate: data.startDate.trim(),
    endDate: data.endDate.trim(),
    isBaseYear: isBase,
    status: data.status || 'draft',
    // Retain BOM array for PCF workbench continuity
    bom: copyBom ? JSON.parse(JSON.stringify(copyBom)) : [],
    createdAt: now,
    updatedAt: now
  };

  let updatedPeriods = [...existingPeriods, newPeriod];
  if (isBase) {
    updatedPeriods = updatedPeriods.map(p => ({
      ...p,
      isBaseYear: p.id === newPeriod.id
    }));
  }

  // Sort chronologically by start date, then reporting year
  return updatedPeriods.sort((a, b) => {
    if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
    return (a.reportingYear || a.year) - (b.reportingYear || b.year);
  });
}

/**
 * Updates an existing reporting period
 */
export function updateReportingPeriod(periodId, updates, existingPeriods = []) {
  const existing = existingPeriods.find(p => p.id === periodId);
  if (!existing) {
    throw new Error(`Period ${periodId} not found.`);
  }

  if (existing.status === 'locked' && updates.status === undefined) {
    throw new Error('This reporting period is locked and cannot be edited without unlocking first.');
  }

  const merged = { ...existing, ...updates };
  const errors = validatePeriod(merged, existingPeriods, periodId);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const isBase = Boolean(merged.isBaseYear);

  return existingPeriods.map(p => {
    if (p.id === periodId) {
      const year = parseInt(merged.reportingYear);
      return {
        ...merged,
        label: merged.label.trim(),
        reportingYear: year,
        year: year,
        startDate: merged.startDate.trim(),
        endDate: merged.endDate.trim(),
        isBaseYear: isBase,
        status: merged.status || p.status || 'draft',
        updatedAt: new Date().toISOString()
      };
    }
    // If setting this one as base year, unset others
    if (isBase && p.id !== periodId) {
      return { ...p, isBaseYear: false };
    }
    return p;
  }).sort((a, b) => {
    if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
    return (a.reportingYear || a.year) - (b.reportingYear || b.year);
  });
}

/**
 * Deletes a reporting period (safeguard: at least 1 period must remain)
 */
export function deleteReportingPeriod(periodId, existingPeriods = []) {
  if (existingPeriods.length <= 1) {
    throw new Error('Cannot delete the only reporting period in the workspace.');
  }
  const filtered = existingPeriods.filter(p => p.id !== periodId);
  
  // If the deleted period was the base year, designate the earliest remaining period
  if (!filtered.some(p => p.isBaseYear) && filtered.length > 0) {
    filtered[0].isBaseYear = true;
  }
  return filtered;
}

/**
 * Sets a specific period as the base year
 */
export function setBaseYearPeriod(periodId, existingPeriods = []) {
  return existingPeriods.map(p => ({
    ...p,
    isBaseYear: p.id === periodId
  }));
}

/**
 * Locks a period to prevent accidental edits to calculated data
 */
export function lockReportingPeriod(periodId, existingPeriods = []) {
  return existingPeriods.map(p => {
    if (p.id === periodId) {
      return { ...p, status: 'locked', updatedAt: new Date().toISOString() };
    }
    return p;
  });
}

/**
 * Unlocks a locked period back to draft
 */
export function unlockReportingPeriod(periodId, existingPeriods = []) {
  return existingPeriods.map(p => {
    if (p.id === periodId) {
      return { ...p, status: 'draft', updatedAt: new Date().toISOString() };
    }
    return p;
  });
}
