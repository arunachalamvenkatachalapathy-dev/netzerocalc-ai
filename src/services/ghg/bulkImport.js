const clean = v => String(v ?? '').trim();
const aliases = {name:/^(name|item|material|activity|item description|description)$/i,qty:/^(qty|quantity|amount|quantity \(input\))$/i,unit:/^(unit|uom)$/i,ef:/^(ef|emission factor.*|kgco2e per unit)$/i,scope:/^scope$/i,category:/^(scope.?3 category|category)$/i,facility:/^(facility|facility id|site)$/i,source:/^(source|source url|citation)$/i};
export function detectColumns(header) {return Object.fromEntries(Object.entries(aliases).map(([k,re])=>[k,header.findIndex(c=>re.test(clean(c)))]));}
export function detectHeader(matrix){return Math.max(0,matrix.findIndex(row=>Array.isArray(row)&&row.some(c=>aliases.name.test(clean(c)))&&row.some(c=>aliases.qty.test(clean(c)))));}
export function parseBulkRows(matrix,headerIndex,mapping,defaultScope='') {
 const rows=[],errors=[];let blank=0;
 if(['name','qty','unit','ef'].some(k=>!Number.isInteger(mapping[k])||mapping[k]<0))return {rows,errors:[{row:headerIndex+1,reason:'Map Name, Quantity, Unit and EF before importing.'}],blank};
 for(let n=headerIndex+1;n<matrix.length;n++){
  const r=matrix[n]||[];if(r.every(v=>!clean(v))){blank++;continue;}
  const value=k=>mapping[k]>=0?clean(r[mapping[k]]):'';const name=value('name'),qty=Number(value('qty').replace(/,/g,'')),ef=Number(value('ef').replace(/,/g,'')),unit=value('unit'),scope=value('scope')||defaultScope;
  const reasons=[];if(!name)reasons.push('Name missing');if(!value('qty')||!Number.isFinite(qty)||qty<0)reasons.push('Quantity must be a non-negative number');if(!value('ef')||!Number.isFinite(ef)||ef<0)reasons.push('EF must be a non-negative number');if(!unit)reasons.push('Unit missing');if(!['Scope 1','Scope 2','Scope 3'].includes(scope))reasons.push('Choose Scope 1, Scope 2 or Scope 3');
  if(reasons.length){errors.push({row:n+1,name,reason:reasons.join('; ')});continue;}
  rows.push({id:crypto.randomUUID(),name,qty,unit,ef,scope,scope3Category:value('category')||undefined,facilityId:value('facility')||undefined,source:value('source')||undefined,process:'User-supplied factor - verify units/boundary',approved:false,risk:'HIGH',sim:0,ter:5,ger:5,tir:5,status:'Imported - Needs Review',importRow:n+1});
 }
 return {rows,errors,blank};
}
export async function fingerprintRows(rows){const text=JSON.stringify(rows.map(({id,importRow,...r})=>r));const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');}
