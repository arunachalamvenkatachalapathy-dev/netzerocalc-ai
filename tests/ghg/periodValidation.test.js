import { describe, it, expect } from 'bun:test';
import { 
  validatePeriod, 
  createReportingPeriod, 
  updateReportingPeriod, 
  deleteReportingPeriod, 
  setBaseYearPeriod, 
  lockReportingPeriod, 
  unlockReportingPeriod 
} from '../../src/services/ghg/periodService.js';

describe('Reporting Period Management Service', () => {
  it('creates calendar and fiscal year arbitrary periods with validation', () => {
    const existing = [];
    const p1 = createReportingPeriod('org_1', {
      label: 'FY 2024-25',
      reportingYear: 2024,
      startDate: '2024-04-01',
      endDate: '2025-03-31',
      isBaseYear: true
    }, existing);

    expect(p1.length).toBe(1);
    expect(p1[0].label).toBe('FY 2024-25');
    expect(p1[0].isBaseYear).toBe(true);
    expect(p1[0].status).toBe('draft');

    // Add a second calendar year period
    const p2 = createReportingPeriod('org_1', {
      label: 'CY 2025',
      reportingYear: 2025,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isBaseYear: false
    }, p1);

    expect(p2.length).toBe(2);
    expect(p2[1].label).toBe('CY 2025');
  });

  it('rejects invalid periods (end date earlier than start date, missing fields)', () => {
    const errs1 = validatePeriod({
      label: 'Bad Period',
      reportingYear: 2024,
      startDate: '2024-12-31',
      endDate: '2024-01-01'
    });
    expect(errs1).toContain('End date cannot be earlier than start date.');

    const errs2 = validatePeriod({
      label: '',
      reportingYear: 2024,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    });
    expect(errs2).toContain('Reporting period label is required.');
  });

  it('preserves existing PCF BOM array and supports BOM cloning', () => {
    const demoBom = [{ id: 'bom_1', name: 'Aluminium Ingot', qty: 1000, ef: 14.2 }];
    const periods = createReportingPeriod('org_1', {
      label: 'FY 2024',
      reportingYear: 2024,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }, [], demoBom);

    expect(periods[0].bom.length).toBe(1);
    expect(periods[0].bom[0].name).toBe('Aluminium Ingot');
  });

  it('updates base year designation cleanly across periods', () => {
    let periods = [
      { id: 'p1', reportingYear: 2023, startDate: '2023-01-01', endDate: '2023-12-31', isBaseYear: true, label: 'FY2023', bom: [] },
      { id: 'p2', reportingYear: 2024, startDate: '2024-01-01', endDate: '2024-12-31', isBaseYear: false, label: 'FY2024', bom: [] }
    ];

    periods = setBaseYearPeriod('p2', periods);
    expect(periods.find(p => p.id === 'p1').isBaseYear).toBe(false);
    expect(periods.find(p => p.id === 'p2').isBaseYear).toBe(true);
  });

  it('locks and unlocks reporting periods', () => {
    let periods = [
      { id: 'p1', reportingYear: 2023, startDate: '2023-01-01', endDate: '2023-12-31', status: 'draft', label: 'FY2023', bom: [] }
    ];

    periods = lockReportingPeriod('p1', periods);
    expect(periods[0].status).toBe('locked');

    // Attempting to update a locked period without unlocking should throw
    expect(() => updateReportingPeriod('p1', { label: 'Changed' }, periods)).toThrow();

    periods = unlockReportingPeriod('p1', periods);
    expect(periods[0].status).toBe('draft');
  });

  it('prevents deleting the only period', () => {
    const periods = [
      { id: 'p1', reportingYear: 2023, startDate: '2023-01-01', endDate: '2023-12-31', label: 'FY2023', bom: [] }
    ];
    expect(() => deleteReportingPeriod('p1', periods)).toThrow('Cannot delete the only reporting period');
  });
});
