import { describe, it, expect } from 'bun:test';
import { 
  isFacilityActiveInPeriod, 
  getActiveFacilitiesForPeriod, 
  createFacility, 
  validateFacility,
  updateFacility,
  deleteFacility
} from '../../src/services/ghg/facilityService.js';

describe('Facility Registry & Active-Date Logic', () => {
  const period2024 = {
    id: 'per_2024',
    reportingYear: 2024,
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  };

  it('identifies an ongoing facility (activeTo = null) as active when started prior to period', () => {
    const facility = {
      id: 'fac_1',
      name: 'Chennai HQ',
      activeFrom: '2020-01-01',
      activeTo: null
    };
    expect(isFacilityActiveInPeriod(facility, period2024)).toBe(true);
  });

  it('identifies a decommissioned facility (activeTo before period start) as inactive', () => {
    const facility = {
      id: 'fac_old',
      name: 'Decommissioned Warehouse',
      activeFrom: '2018-01-01',
      activeTo: '2023-12-31'
    };
    expect(isFacilityActiveInPeriod(facility, period2024)).toBe(false);
  });

  it('identifies a future facility (activeFrom after period end) as inactive', () => {
    const facility = {
      id: 'fac_future',
      name: 'Upcoming Solar Plant',
      activeFrom: '2025-01-01',
      activeTo: null
    };
    expect(isFacilityActiveInPeriod(facility, period2024)).toBe(false);
  });

  it('handles exact boundary date matches correctly (active on exact start/end day)', () => {
    const facilityEndsOnStart = {
      id: 'fac_edge1',
      name: 'Closed on New Year Day',
      activeFrom: '2020-01-01',
      activeTo: '2024-01-01'
    };
    expect(isFacilityActiveInPeriod(facilityEndsOnStart, period2024)).toBe(true);

    const facilityStartsOnEnd = {
      id: 'fac_edge2',
      name: 'Commissioned on Last Day',
      activeFrom: '2024-12-31',
      activeTo: null
    };
    expect(isFacilityActiveInPeriod(facilityStartsOnEnd, period2024)).toBe(true);
  });

  it('filters active facilities list correctly', () => {
    const list = [
      { id: 'f1', name: 'Active 1', activeFrom: '2021-01-01', activeTo: null },
      { id: 'f2', name: 'Inactive Past', activeFrom: '2019-01-01', activeTo: '2022-12-31' },
      { id: 'f3', name: 'Active 2', activeFrom: '2024-06-01', activeTo: '2024-08-31' },
      { id: 'f4', name: 'Inactive Future', activeFrom: '2025-03-01', activeTo: null },
    ];
    const active = getActiveFacilitiesForPeriod(list, period2024);
    expect(active.map(f => f.id)).toEqual(['f1', 'f3']);
  });

  it('validates facility creation and rejects invalid inputs', () => {
    // Missing name
    expect(validateFacility({ name: '', country: 'IN', gridRegion: 'IN_CEA_NATIONAL', activeFrom: '2024-01-01' }).length).toBeGreaterThan(0);
    // Missing country
    expect(validateFacility({ name: 'Plant A', country: '', gridRegion: 'IN_CEA_NATIONAL', activeFrom: '2024-01-01' }).length).toBeGreaterThan(0);
    // Invalid activeFrom date format
    expect(validateFacility({ name: 'Plant A', country: 'IN', gridRegion: 'IN_CEA_NATIONAL', activeFrom: '01-01-2024' }).length).toBeGreaterThan(0);
    // activeTo earlier than activeFrom
    expect(validateFacility({ name: 'Plant A', country: 'IN', gridRegion: 'IN_CEA_NATIONAL', activeFrom: '2024-05-01', activeTo: '2024-01-01' }).length).toBeGreaterThan(0);
  });

  it('creates, updates, and deletes facilities cleanly', () => {
    const newFac = createFacility('org_1', {
      name: 'Bengaluru R&D Tech Center',
      code: 'BLR-01',
      country: 'IN',
      region: 'Karnataka',
      gridRegion: 'IN_SOUTHERN',
      activeFrom: '2022-04-01',
      notes: 'Testing R&D facility'
    });
    expect(newFac.id).toBeDefined();
    expect(newFac.country).toBe('IN');

    const updated = updateFacility(newFac.id, { name: 'Bengaluru Tech Park' }, [newFac]);
    expect(updated[0].name).toBe('Bengaluru Tech Park');

    const remaining = deleteFacility(newFac.id, updated);
    expect(remaining.length).toBe(0);
  });
});
