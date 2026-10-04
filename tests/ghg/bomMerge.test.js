import { describe, it, expect } from 'bun:test';
import { mergeBomItems, withBomQuantity } from '../../src/services/ghg/bomMerge.js';
const row = (name, qty, extra = {}) => ({id:name, name, qty, unit:'kg', ef:2, scope:'Scope 3', ...extra});
describe('additive inventory imports', () => {
 it('imports fresh rows', () => expect(mergeBomItems([], [row('Steel',10),row('Copper',5)]).map(r=>r.qty)).toEqual([10,5]));
 it('re-import adds quantity without duplicates or mutation', () => {
 const a=[row('Steel',10),row('Copper',5)];const before=JSON.stringify(a);
 const b=mergeBomItems(a,a);expect(b).toHaveLength(2);expect(b.map(r=>r.qty)).toEqual([20,10]);expect(JSON.stringify(a)).toBe(before);
 });
 it('preserves unrelated rows and metadata, merges trimmed case variants',()=>{
 const a=[row('Steel',10,{notes:'keep',approved:false}),row('Copper',5)];const b=mergeBomItems(a,[row(' STEEL ',3),row('Aluminum',7)]);
 expect(b).toHaveLength(3);expect(b[0]).toEqual({...a[0],qty:13});expect(b[1]).toEqual(a[1]);
 });
 it('aggregates duplicates within a file and keeps IDs unique',()=>{const b=mergeBomItems([],[row('Steel',1),row('steel',2),row('Copper',0,{id:'Steel'})]);expect(b[0].qty).toBe(3);expect(new Set(b.map(r=>r.id)).size).toBe(2);expect(b[1].qty).toBe(0);});
 it('does not mix units, factors, scopes, categories or facilities',()=>{
 const a=row('Steel',1);const b=mergeBomItems([a],[row('Steel',1,{unit:'t'}),row('Steel',1,{ef:3}),row('Steel',1,{scope:'Scope 1'}),row('Steel',1,{scope3Category:'Cat 2'}),row('Steel',1,{facilityId:'other'})]);expect(b).toHaveLength(6);
 });
 it('refreshes Excel cached emissions on addition and inline quantity edits',()=>{const a=row('Steel',10,{result_tco2e:0.02});expect(mergeBomItems([a],[row('Steel',5)])[0].result_tco2e).toBe(0.03);expect(withBomQuantity(a,20).result_tco2e).toBe(0.04);});
});
it('matches quick-add and spreadsheet Scope 1 category spellings', () => {
 const b=mergeBomItems([row('Diesel',5,{scope:'Scope 1',scope3Category:'N/A'})],[row(' diesel ',3,{scope:'Scope 1',scope3Category:'N/A (Scope 1 Direct)'})]);
 expect(b).toHaveLength(1);expect(b[0].qty).toBe(8);
});
it('retains a zero factor and quantity without inventing defaults',()=>{expect(mergeBomItems([],[row('Renewable',0,{ef:0})])[0]).toMatchObject({qty:0,ef:0});});
