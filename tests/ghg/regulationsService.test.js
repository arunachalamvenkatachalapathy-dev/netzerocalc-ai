import { describe, test, expect } from 'bun:test';
import {
  REGULATIONS_2026_DATABASE,
  REGULATION_STATUSES,
  REGULATION_REGIONS
} from '../../src/data/regulations2026Data.js';
import {
  fetchRegulations,
  filterRegulationsLocally,
  getRegulationStats
} from '../../src/services/regulationService.js';

describe('Global ESG & Sustainability Regulations 2026 Engine (Part 1)', () => {

  test('loads authoritative global regulations database with at least 20 jurisdictions', () => {
    expect(Array.isArray(REGULATIONS_2026_DATABASE)).toBe(true);
    expect(REGULATIONS_2026_DATABASE.length).toBeGreaterThanOrEqual(20);
    console.log(`Verified ${REGULATIONS_2026_DATABASE.length} authoritative global regulations loaded.`);
  });

  test('enforces complete schema metadata for all regulations', () => {
    REGULATIONS_2026_DATABASE.forEach(reg => {
      expect(reg.id).toBeTruthy();
      expect(reg.country).toBeTruthy();
      expect(reg.flag).toBeTruthy();
      expect(reg.region).toBeTruthy();
      expect(reg.regulation).toBeTruthy();
      expect(reg.shortForm).toBeTruthy();
      expect(reg.status).toBeTruthy();
      expect(['in-force', 'upcoming', 'developing', 'not-in-force']).toContain(reg.statusCode);
      expect(reg.year).toBeTruthy();
      expect(reg.sourceName).toBeTruthy();
      expect(reg.sourceUrl).toMatch(/^https?:\/\//);
      expect(reg.authority).toBeTruthy();
      expect(reg.scopeSummary).toBeTruthy();
      expect(reg.materiality).toBeTruthy();
      expect(reg.assurance).toBeTruthy();
      expect(reg.ghgScopesRequired).toBeTruthy();
    });
  });

  test('contains core international benchmarks: CSRD, BRSR, SEC, ISSB, CBAM, CSDDD', () => {
    const shortForms = REGULATIONS_2026_DATABASE.map(r => r.shortForm);
    expect(shortForms.some(s => s.includes('CSRD'))).toBe(true);
    expect(shortForms.some(s => s.includes('BRSR'))).toBe(true);
    expect(shortForms.some(s => s.includes('SEC'))).toBe(true);
    expect(shortForms.some(s => s.includes('ISSB'))).toBe(true);
    expect(shortForms.some(s => s.includes('CBAM'))).toBe(true);
    expect(shortForms.some(s => s.includes('CSDDD'))).toBe(true);
  });

  test('computes aggregated statistics accurately across all status codes', () => {
    const stats = getRegulationStats(REGULATIONS_2026_DATABASE);
    expect(stats.total).toBe(REGULATIONS_2026_DATABASE.length);
    expect(stats.inForce).toBeGreaterThan(0);
    expect(stats.upcoming).toBeGreaterThan(0);
    expect(stats.developing).toBeGreaterThan(0);
    expect(stats.notInForce).toBeGreaterThanOrEqual(1); // Texas
    expect(stats.total).toBe(stats.inForce + stats.upcoming + stats.developing + stats.notInForce);
  });

  test('filters regulations by status code cleanly', () => {
    const inForceList = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { status: 'in-force' });
    expect(inForceList.length).toBeGreaterThan(0);
    inForceList.forEach(r => expect(r.statusCode).toBe('in-force'));

    const upcomingList = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { status: 'upcoming' });
    expect(upcomingList.length).toBeGreaterThan(0);
    upcomingList.forEach(r => expect(r.statusCode).toBe('upcoming'));

    const notInForceList = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { status: 'not-in-force' });
    expect(notInForceList.length).toBe(1);
    expect(notInForceList[0].country).toContain('Texas');
  });

  test('filters regulations by geographic region', () => {
    const europeList = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { region: 'Europe' });
    expect(europeList.length).toBeGreaterThanOrEqual(5);
    europeList.forEach(r => expect(r.region).toBe('Europe'));

    const apacList = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { region: 'Asia Pacific' });
    expect(apacList.length).toBeGreaterThanOrEqual(5);
    apacList.forEach(r => expect(r.region).toBe('Asia Pacific'));
  });

  test('performs multi-field full-text search across country, acronym, and legal title', () => {
    // Search by country
    const indiaSearch = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { search: 'India' });
    expect(indiaSearch.length).toBeGreaterThanOrEqual(1);
    expect(indiaSearch[0].shortForm).toContain('BRSR');

    // Search by acronym
    const csrdSearch = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { search: 'CSRD' });
    expect(csrdSearch.length).toBeGreaterThanOrEqual(1);
    expect(csrdSearch.some(r => r.country === 'European Union')).toBe(true);

    // Search by authority
    const sebiSearch = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { search: 'SEBI' });
    expect(sebiSearch.length).toBe(1);
    expect(sebiSearch[0].country).toBe('India');

    // Non-existent search returns empty array
    const emptySearch = filterRegulationsLocally(REGULATIONS_2026_DATABASE, { search: 'nonexistentquery123xyz' });
    expect(emptySearch.length).toBe(0);
  });

  test('handles combined filters (status + region + search) deterministically', () => {
    const combined = filterRegulationsLocally(REGULATIONS_2026_DATABASE, {
      status: 'in-force',
      region: 'Europe',
      search: 'Corporate'
    });
    expect(combined.length).toBeGreaterThanOrEqual(1);
    expect(combined[0].shortForm).toBe('CSRD');
    expect(combined[0].statusCode).toBe('in-force');
  });

  test('fetchRegulations service returns data gracefully', async () => {
    const results = await fetchRegulations({ status: 'in-force' });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => expect(r.statusCode).toBe('in-force'));
  });
});
