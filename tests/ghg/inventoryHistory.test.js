import { describe, test, expect } from 'bun:test';
import { diffInventory, withLocalHistory, displayHistoryValue } from '../../src/services/history/inventoryHistory.js';
const p = (bom, year=2024) => ({periods:[{year,bom}]});
describe('Inventory history', () => {
 test('records add and exact values',()=>{const [e]=diffInventory(p([]),p([{id:1,name:'Diesel',qty:10}]));expect(e.action).toBe('added');expect(e.before_item).toBeNull();expect(e.after_item.qty).toBe(10);});
 test('records edited fields only and preserves zero',()=>{const [e]=diffInventory(p([{id:1,qty:10,approved:false}]),p([{id:1,qty:0,approved:true}]));expect(e.changed_fields).toEqual(['approved','qty']);expect(e.before_item.qty).toBe(10);expect(e.after_item.qty).toBe(0);expect(e.action).toBe('edited');});
 test('records deletion with full prior snapshot',()=>{expect(diffInventory(p([{id:1,name:'A',qty:2}]),p([]))[0].action).toBe('deleted');});
 test('ignores unrelated changes and same rows',()=>{expect(diffInventory({...p([{id:1,qty:2}]),name:'Old'},{...p([{id:1,qty:2}]),name:'New'})).toEqual([]);});
 test('separates identical item IDs in different years',()=>{expect(diffInventory({periods:[{year:2023,bom:[{id:1,qty:2}]},{year:2024,bom:[{id:1,qty:3}]}]},{periods:[{year:2023,bom:[{id:1,qty:2}]},{year:2024,bom:[{id:1,qty:4}]}]})[0].period_year).toBe(2024);});
 test('handles period removal and guest persistence',()=>{const result=withLocalHistory({...p([{id:1,qty:2}]),itemHistory:[{id:'prior'}]},p([]));expect(result.itemHistory.length).toBe(2);expect(result.itemHistory[0].actor_label).toBe('Guest (this browser)');expect(displayHistoryValue(false)).toBe('false');expect(displayHistoryValue(0)).toBe('0');});
});
