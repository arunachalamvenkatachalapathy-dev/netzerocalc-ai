import {it,expect} from 'bun:test';
import data from '../../src/data/publicFactors.js';
it('blocks known expired and unresolved public factors',()=>{const ad=data.filter(f=>f.id.startsWith('ademe_'));expect(ad.filter(f=>f.expired).length).toBe(5616);expect(ad.filter(f=>f.validityKnown===false).length).toBe(91);expect(ad.filter(f=>f.validUntil==='déc-17').every(f=>f.expired&&f.validUntilIso==='2017-12-31')).toBe(true);});
