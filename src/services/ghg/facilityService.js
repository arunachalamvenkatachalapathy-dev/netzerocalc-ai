/**
 * Facility Registry Service
 * Handles facility lifecycle, boundary validation, and active-date filtering
 * Reference: NetZeroCalc_Antigravity_Implementation_Spec.xlsx (Phase 1 & Input Dictionary)
 */

/**
 * Validates facility input data. Returns array of error messages (empty if valid).
 */
export function validateFacility(data, existingFacilities = [], currentFacilityId = null) {
  const errors = [];

  if (!data.name || !data.name.trim()) {
    errors.push('Facility name is required.');
  } else {
    const trimmed = data.name.trim().toLowerCase();
    const isDuplicate = existingFacilities.some(f => 
      f.id !== currentFacilityId && f.name.trim().toLowerCase() === trimmed
    );
    if (isDuplicate) {
      errors.push('A facility with this name already exists in the organization.');
    }
  }

  if (!data.country || !data.country.trim()) {
    errors.push('Country is required.');
  }

  if (!data.gridRegion || !data.gridRegion.trim()) {
    errors.push('Grid region is required for electricity accounting.');
  }

  if (!data.activeFrom || !data.activeFrom.trim()) {
    errors.push('Operational start date (Active From) is required.');
  } else if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.activeFrom.trim())) {
    errors.push('Active From date must be in YYYY-MM-DD format.');
  }

  if (data.activeTo && data.activeTo.trim()) {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(data.activeTo.trim())) {
      errors.push('Active To date must be in YYYY-MM-DD format.');
    } else if (data.activeFrom && data.activeTo.trim() < data.activeFrom.trim()) {
      errors.push('Active To date cannot be earlier than Active From date.');
    }
  }

  return errors;
}

/**
 * Determines whether a facility was operational during a given reporting period.
 * Rule: Active only when its operational dates overlap the period date range.
 * (activeFrom <= period.endDate) AND (activeTo is null/empty OR activeTo >= period.startDate)
 */
export function isFacilityActiveInPeriod(facility, period) {
  if (!facility || !period) return false;
  
  const pStart = (period.startDate || '').trim();
  const pEnd = (period.endDate || '').trim();
  const fStart = (facility.activeFrom || '').trim();
  const fEnd = (facility.activeTo || '').trim();

  // If period has no proper dates, fallback to reportingYear string comparison
  if (!pStart || !pEnd) {
    const year = String(period.reportingYear || period.year || '2024');
    const fStartYear = fStart ? fStart.substring(0, 4) : '1900';
    const fEndYear = fEnd ? fEnd.substring(0, 4) : '9999';
    return fStartYear <= year && fEndYear >= year;
  }

  // Facility started after period ended -> Inactive
  if (fStart && fStart > pEnd) {
    return false;
  }

  // Facility ceased before period started -> Inactive
  if (fEnd && fEnd < pStart) {
    return false;
  }

  return true;
}

/**
 * Filters a list of facilities to return only those active in the specified period.
 */
export function getActiveFacilitiesForPeriod(facilities = [], period) {
  if (!Array.isArray(facilities)) return [];
  return facilities.filter(f => isFacilityActiveInPeriod(f, period));
}

/**
 * Creates a new Facility record with validation
 */
export function createFacility(organizationId, data, existingFacilities = []) {
  const errors = validateFacility(data, existingFacilities);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  const now = new Date().toISOString();
  return {
    id: 'fac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    organizationId: organizationId || 'org_default',
    name: data.name.trim(),
    code: (data.code || '').trim(),
    country: (data.country || 'IN').trim().toUpperCase(),
    region: (data.region || '').trim(),
    gridRegion: (data.gridRegion || 'IN_CEA_NATIONAL').trim(),
    activeFrom: data.activeFrom.trim(),
    activeTo: data.activeTo && data.activeTo.trim() ? data.activeTo.trim() : null,
    metadata: {
      notes: (data.notes || '').trim(),
      primaryActivity: (data.primaryActivity || '').trim(),
      floorAreaM2: Number(data.floorAreaM2) || null,
      employeeCount: Number(data.employeeCount) || null,
      ...(data.metadata || {})
    },
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Updates an existing facility record
 */
export function updateFacility(facilityId, updates, facilities = []) {
  const existing = facilities.find(f => f.id === facilityId);
  if (!existing) {
    throw new Error(`Facility ${facilityId} not found.`);
  }

  const merged = { ...existing, ...updates };
  const errors = validateFacility(merged, facilities, facilityId);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return facilities.map(f => {
    if (f.id === facilityId) {
      return {
        ...merged,
        name: merged.name.trim(),
        country: merged.country.trim().toUpperCase(),
        gridRegion: merged.gridRegion.trim(),
        activeFrom: merged.activeFrom.trim(),
        activeTo: merged.activeTo && merged.activeTo.trim() ? merged.activeTo.trim() : null,
        updatedAt: new Date().toISOString()
      };
    }
    return f;
  });
}

/**
 * Deletes a facility from the registry
 */
export function deleteFacility(facilityId, facilities = []) {
  return facilities.filter(f => f.id !== facilityId);
}
