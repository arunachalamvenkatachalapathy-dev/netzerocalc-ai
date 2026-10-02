// NetZeroCalc public API and MCP server (Streamable HTTP, stateless, JSON responses).
// Auth: "Authorization: Bearer nzc_..." personal token created in the app (Settings > API & MCP).
// The service role is used only to resolve the token; every query is filtered by that token's user_id.
import { createClient } from "npm:@supabase/supabase-js@2";

const FACTORS: Factor[] = [{"id":"in_grid_cea_2024","name":"Grid Electricity (CEA India Baseline v19 2024)","category":"Energy & Grids","region":"IN","scope":"Scope 2","ef":0.716,"unit":"kWh","source":"India CEA (Central Electricity Authority)","sourceYear":2024,"sourceUrl":"https://cea.nic.in/cdm-co2-baseline-database/","status":"published"},{"id":"in_diesel_dg","name":"Diesel Fuel (Commercial DG Power Generators)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":2.6558,"unit":"Liters","source":"India GHG Platform","sourceYear":2024,"sourceUrl":"http://www.indiaghgplatform.org/","status":"published"},{"id":"in_cng_fleet","name":"Compressed Natural Gas (CNG Vehicle Fleet)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":2.686,"unit":"kg","source":"India GHG Platform","sourceYear":2024,"sourceUrl":"http://www.indiaghgplatform.org/","status":"published"},{"id":"in_coal_industrial","name":"Sub-Bituminous Coal (Industrial Boiler)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":2.42,"unit":"kg","source":"MoEFCC India","sourceYear":2024,"sourceUrl":"https://moef.gov.in/","status":"illustrative"},{"id":"in_petrol_gasoline","name":"Motor Gasoline / Petrol (Passenger Car)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":2.31,"unit":"Liters","source":"India GHG Platform","sourceYear":2024,"sourceUrl":"http://www.indiaghgplatform.org/","status":"published"},{"id":"in_lpg_thermal","name":"Liquefied Petroleum Gas (LPG Commercial)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":2.983,"unit":"kg","source":"India GHG Platform","sourceYear":2024,"sourceUrl":"http://www.indiaghgplatform.org/","status":"published"},{"id":"in_solar_ppa","name":"Solar Power PPA (Lifecycle Embodied Emissions)","category":"Energy & Grids","region":"IN","scope":"Scope 3","ef":0.048,"unit":"kWh","source":"IPCC AR6 Median / NREL","sourceYear":2022,"sourceUrl":"https://www.ipcc.ch/report/ar6/wg3/","status":"published"},{"id":"in_wind_ppa","name":"Wind Power PPA (Lifecycle Embodied Emissions)","category":"Energy & Grids","region":"IN","scope":"Scope 3","ef":0.011,"unit":"kWh","source":"IPCC AR6 Median / NREL","sourceYear":2022,"sourceUrl":"https://www.ipcc.ch/report/ar6/wg3/","status":"published"},{"id":"in_natural_gas_scm","name":"Natural Gas (India SCM / Pipeline Gas)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":1.8913,"unit":"scm","source":"India GHG Platform / MoEFCC","sourceYear":2024,"sourceUrl":"http://www.indiaghgplatform.org/","status":"published"},{"id":"in_biomass_solid","name":"Solid Biomass (Wood/Agri Residue)","category":"Fuels & Thermal","region":"IN","scope":"Scope 1","ef":0.05,"unit":"kg","source":"IPCC / India Bioenergy","sourceYear":2006,"sourceUrl":"https://www.ipcc-nggip.iges.or.jp/public/2006gl/","status":"illustrative"},{"id":"glo_sea_freight","name":"Sea Freight (Container Ship, Average)","category":"Transport & Freight","region":"GLO","scope":"Scope 3","ef":0.016,"unit":"tonne-km","source":"Smart Freight Centre / GLEC","sourceYear":2023,"sourceUrl":"https://www.smartfreightcentre.org/en/our-programs/global-logistics-emissions-council/","status":"published"},{"id":"glo_air_freight","name":"Air Freight (Long Haul Cargo)","category":"Transport & Freight","region":"GLO","scope":"Scope 3","ef":1.13,"unit":"tonne-km","source":"Smart Freight Centre / GLEC","sourceYear":2023,"sourceUrl":"https://www.smartfreightcentre.org/en/our-programs/global-logistics-emissions-council/","status":"published"},{"id":"defra_hgv_freight","name":"HGV Diesel Freight Truck (>17t Rigid)","category":"Transport & Freight","region":"UK / EU","scope":"Scope 3","ef":0.118,"unit":"tonne-km","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"defra_van_diesel","name":"Light Commercial Van (Class III Diesel)","category":"Transport & Freight","region":"UK / EU","scope":"Scope 3","ef":0.245,"unit":"km","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"defra_flight_longhaul","name":"Passenger Business Flight (Long Haul Premium)","category":"Transport & Freight","region":"GLO","scope":"Scope 3","ef":0.215,"unit":"passenger-km","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"defra_hotel_stay","name":"Hotel Night Accommodation (India/Asia Average)","category":"Transport & Freight","region":"GLO","scope":"Scope 3","ef":34.2,"unit":"room-night","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"defra_natural_gas","name":"Natural Gas (Grid Pipeline Gas)","category":"Fuels & Thermal","region":"UK / EU","scope":"Scope 1","ef":2.021,"unit":"m3","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"defra_water_supply","name":"Municipal Water Supply Treatment","category":"Packaging & Waste","region":"UK / EU","scope":"Scope 3","ef":0.149,"unit":"m3","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"defra_waste_landfill","name":"Commercial General Waste (Landfill)","category":"Packaging & Waste","region":"UK / EU","scope":"Scope 3","ef":467.5,"unit":"tonne","source":"UK DEFRA / DESNZ 2024","sourceYear":2024,"sourceUrl":"https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting","status":"published"},{"id":"usepa_egrid_avg","name":"US Grid Electricity (eGRID National Average)","category":"Energy & Grids","region":"US","scope":"Scope 2","ef":0.385,"unit":"kWh","source":"US EPA eGRID 2024","sourceYear":2024,"sourceUrl":"https://www.epa.gov/egrid","status":"published"},{"id":"usepa_diesel","name":"Diesel Fuel No. 2 (Industrial Boilers & Trucks)","category":"Fuels & Thermal","region":"US","scope":"Scope 1","ef":2.696,"unit":"Liters","source":"US EPA GHG Hub 2024","sourceYear":2024,"sourceUrl":"https://www.epa.gov/climateleadership/ghg-emission-factors-hub","status":"published"},{"id":"usepa_gasoline","name":"Motor Gasoline (E10 Blend)","category":"Fuels & Thermal","region":"US","scope":"Scope 1","ef":2.328,"unit":"Liters","source":"US EPA GHG Hub 2024","sourceYear":2024,"sourceUrl":"https://www.epa.gov/climateleadership/ghg-emission-factors-hub","status":"published"},{"id":"ecoinvent_alum_primary","name":"Primary Aluminum Ingot (Smelter Average)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":14.2,"unit":"kg","source":"International Aluminium Institute / World Aluminium (global average)","sourceYear":2022,"sourceUrl":"https://international-aluminium.org/statistics/greenhouse-gas-emissions-aluminium-sector/","status":"illustrative"},{"id":"ecoinvent_alum_secondary","name":"Secondary Recycled Scrap Aluminum","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":1.8,"unit":"kg","source":"World Aluminium Model","sourceYear":2022,"sourceUrl":"https://international-aluminium.org/","status":"illustrative"},{"id":"ecoinvent_steel_hotrolled","name":"Hot-Rolled Structural Steel (BF-BOF Route)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":1.85,"unit":"kg","source":"World Steel Association","sourceYear":2022,"sourceUrl":"https://worldsteel.org/climate-action/","status":"illustrative"},{"id":"ecoinvent_steel_scrap_eaf","name":"Recycled Steel Rebar (EAF Electric Arc Route)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":0.45,"unit":"kg","source":"World Steel Association","sourceYear":2022,"sourceUrl":"https://worldsteel.org/climate-action/","status":"illustrative"},{"id":"ecoinvent_copper_wire","name":"Refined Copper Wire Drawing","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":6.5,"unit":"kg","source":"International Copper Assoc","sourceYear":2022,"sourceUrl":"https://internationalcopper.org/","status":"illustrative"},{"id":"ecoinvent_polyethylene_hdpe","name":"High-Density Polyethylene (HDPE Granules)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":1.95,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"ecoinvent_polypropylene","name":"Polypropylene (PP Resin Granules)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":1.88,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"ecoinvent_cardboard_box","name":"Corrugated Cardboard Packaging Box","category":"Packaging & Waste","region":"GLO","scope":"Scope 3","ef":0.92,"unit":"kg","source":"FEFCO Corrugated LCA","sourceYear":2021,"sourceUrl":"https://www.fefco.org/lca","status":"illustrative"},{"id":"ecoinvent_glass_container","name":"Container Glass Bottles (Clear)","category":"Packaging & Waste","region":"GLO","scope":"Scope 3","ef":0.85,"unit":"kg","source":"European Container Glass","sourceYear":2022,"sourceUrl":"https://feve.org/","status":"illustrative"},{"id":"ecoinvent_cement_portland","name":"Ordinary Portland Cement (OPC)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":0.82,"unit":"kg","source":"GCCA Cement LCA 2023","sourceYear":2023,"sourceUrl":"https://gccassociation.org/sustainability-innovation/","status":"illustrative"},{"id":"ecoinvent_concrete_ready","name":"Ready-Mix Concrete (C30/37 Grade)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":240,"unit":"m3","source":"GCCA Cement LCA 2023","sourceYear":2023,"sourceUrl":"https://gccassociation.org/sustainability-innovation/","status":"illustrative"},{"id":"mat_pet_resin","name":"PET Resin (Bottle Grade)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":2.15,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"mat_pvc_resin","name":"PVC Resin (Suspension)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":2,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"mat_abs_resin","name":"ABS Resin","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":3.1,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"mat_polystyrene_gpps","name":"Polystyrene (General Purpose)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":3.4,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"mat_nylon6","name":"Nylon 6 (Polyamide 6)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":9.1,"unit":"kg","source":"PlasticsEurope 2023","sourceYear":2023,"sourceUrl":"https://plasticseurope.org/sustainability/circularity/life-cycle-thinking/eco-profiles-set/","status":"illustrative"},{"id":"mat_stainless_304","name":"Stainless Steel 304 (Cold-Rolled)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":6.15,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_galvanized_steel","name":"Galvanized Steel Sheet","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":2.76,"unit":"kg","source":"World Steel Association","sourceYear":2022,"sourceUrl":"https://worldsteel.org/climate-action/","status":"illustrative"},{"id":"mat_zinc_ingot","name":"Zinc Ingot (Special High Grade)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":3.09,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_brass","name":"Brass (Cu-Zn)","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":3.4,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_paper_virgin","name":"Paper (Virgin, Uncoated)","category":"Packaging & Waste","region":"GLO","scope":"Scope 3","ef":1.1,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_timber_softwood","name":"Sawn Softwood Timber","category":"Packaging & Waste","region":"GLO","scope":"Scope 3","ef":0.31,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_flat_glass","name":"Flat Glass (Float)","category":"Packaging & Waste","region":"GLO","scope":"Scope 3","ef":1.28,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_clay_brick","name":"Fired Clay Brick","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":0.24,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_ceramic_tile","name":"Ceramic Tile","category":"Metals & Mining","region":"GLO","scope":"Scope 3","ef":0.78,"unit":"kg","source":"ICE Database v3 (University of Bath)","sourceYear":2019,"sourceUrl":"https://circularecology.com/embodied-carbon-footprint-database.html","status":"illustrative"},{"id":"mat_cotton_fabric","name":"Cotton Fabric (Woven)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":8,"unit":"kg","source":"Textile Exchange / Higg MSI","sourceYear":2022,"sourceUrl":"https://textileexchange.org/","status":"illustrative"},{"id":"mat_polyester_fabric","name":"Polyester Fabric (Woven)","category":"Chemicals & Synthetics","region":"GLO","scope":"Scope 3","ef":9.5,"unit":"kg","source":"Textile Exchange / Higg MSI","sourceYear":2022,"sourceUrl":"https://textileexchange.org/","status":"illustrative"}];

interface Factor { id: string; name: string; category: string; region: string; scope: string; ef: number; unit: string; source: string; sourceYear: number | null; sourceUrl: string | null; status: string }

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const H = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, mcp-session-id, mcp-protocol-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: H });

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function authUser(req: Request): Promise<string | null> {
  const m = (req.headers.get("authorization") ?? "").match(/^Bearer\s+(nzc_[A-Za-z0-9_-]{20,})$/);
  if (!m) return null;
  const hash = await sha256(m[1]);
  const { data } = await admin.from("api_tokens").select("id,user_id").eq("token_hash", hash).maybeSingle();
  if (!data) return null;
  admin.from("api_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => {});
  return data.user_id;
}

// deno-lint-ignore no-explicit-any
type Json = any;

function periodTotals(period: Json) {
  const t = { scope1: 0, scope2: 0, scope3: 0, total: 0, items: 0, unapproved: 0 };
  for (const it of period?.bom ?? []) {
    const tco2e = ((Number(it.qty) || 0) * (Number(it.ef) || 0)) / 1000;
    if (it.scope === "Scope 1") t.scope1 += tco2e; else if (it.scope === "Scope 2") t.scope2 += tco2e; else t.scope3 += tco2e;
    t.total += tco2e; t.items++;
    if (!it.approved) t.unapproved++;
  }
  const r = (n: number) => Number(n.toFixed(3));
  return { scope1_tco2e: r(t.scope1), scope2_tco2e: r(t.scope2), scope3_tco2e: r(t.scope3), total_tco2e: r(t.total), line_items: t.items, unapproved_items: t.unapproved };
}

async function listProjects(uid: string) {
  const { data, error } = await admin.from("projects").select("id,name,updated_at").eq("user_id", uid).order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

async function getProject(uid: string, id: string) {
  const { data, error } = await admin.from("projects").select("id,name,data").eq("user_id", uid).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("project not found");
  return data;
}

async function projectSummary(uid: string, id: string) {
  const p = await getProject(uid, id);
  const periods = (p.data.periods ?? []).map((per: Json) => ({ year: per.year, ...periodTotals(per) }));
  return { id: p.id, name: p.name, periods, note: "Screening-level estimate. tCO2e = quantity x emission factor / 1000 per BOM line. Not third-party verified." };
}

function searchFactors(q: string, region?: string, limit = 10) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return FACTORS
    .filter((f) => !region || f.region.toLowerCase().includes(region.toLowerCase()))
    .map((f) => {
      const hay = `${f.name} ${f.category} ${f.source}`.toLowerCase();
      return { f, score: words.filter((w) => hay.includes(w)).length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 25))
    .map((x) => ({ ...x.f, kgco2e_per_unit: x.f.ef, illustrative: x.f.status === "illustrative" }));
}

async function addBomItems(uid: string, id: string, items: Json[], year?: number) {
  const p = await getProject(uid, id);
  const data = p.data;
  const periods = data.periods ?? [];
  const period = year ? periods.find((x: Json) => x.year === year) : periods[periods.length - 1];
  if (!period) throw new Error("reporting period not found");
  if (!Array.isArray(items) || !items.length || items.length > 100) throw new Error("items must be 1-100 entries");
  const added = items.map((it, i) => {
    const f = it.factor_id ? FACTORS.find((x) => x.id === it.factor_id) : undefined;
    if (it.factor_id && !f) throw new Error(`unknown factor_id ${it.factor_id}`);
    const qty = Number(it.qty);
    const ef = f ? f.ef : Number(it.ef);
    if (!(qty >= 0) || !(ef >= 0)) throw new Error(`item ${i}: qty and an emission factor (factor_id or ef) are required`);
    return {
      id: Date.now() + i, name: String(it.name ?? f?.name ?? "Item").slice(0, 200), qty, unit: String(it.unit ?? f?.unit ?? "unit"),
      process: f?.name ?? "Custom factor", ef, scope: f?.scope ?? String(it.scope ?? "Scope 3"),
      scope3Category: (f?.scope ?? it.scope) === "Scope 3" ? "Cat 1: Purchased Goods & Services" : "N/A",
      gwpBasis: "IPCC AR6", ter: 3, ger: 3, tir: 3, risk: "HIGH", status: "Added via API (unreviewed)", approved: false,
    };
  });
  period.bom = [...(period.bom ?? []), ...added];
  const { error } = await admin.from("projects").update({ data }).eq("user_id", uid).eq("id", id);
  if (error) throw new Error(error.message);
  return { added: added.length, period_year: period.year, totals: periodTotals(period) };
}

const TOOLS = [
  { name: "list_projects", description: "List the user's NetZeroCalc projects (id, name, updated_at).", inputSchema: { type: "object", properties: {} } },
  { name: "get_project_summary", description: "Scope 1/2/3 and total tCO2e per reporting period for a project.", inputSchema: { type: "object", properties: { project_id: { type: "string" } }, required: ["project_id"] } },
  { name: "search_emission_factors", description: "Search the built-in global + India emission factor library. Each result has publisher, year, link and an illustrative flag.", inputSchema: { type: "object", properties: { query: { type: "string" }, region: { type: "string", description: "Optional: IN, UK, US, GLO" }, limit: { type: "number" } }, required: ["query"] } },
  { name: "add_bom_items", description: "Append BOM lines to a project period. Lines are marked unapproved and high risk until a person reviews them in the app. Give factor_id (from search_emission_factors) or a custom ef in kgCO2e per unit.", inputSchema: { type: "object", properties: { project_id: { type: "string" }, year: { type: "number" }, items: { type: "array", items: { type: "object", properties: { name: { type: "string" }, qty: { type: "number" }, unit: { type: "string" }, factor_id: { type: "string" }, ef: { type: "number" }, scope: { type: "string" } }, required: ["qty"] } } }, required: ["project_id", "items"] } },
];

async function callTool(uid: string, name: string, a: Json) {
  switch (name) {
    case "list_projects": return await listProjects(uid);
    case "get_project_summary": return await projectSummary(uid, String(a.project_id));
    case "search_emission_factors": return searchFactors(String(a.query ?? ""), a.region, a.limit);
    case "add_bom_items": return await addBomItems(uid, String(a.project_id), a.items, a.year);
    default: throw new Error(`unknown tool ${name}`);
  }
}

async function handleRpc(uid: string, msg: Json) {
  const { id, method, params } = msg;
  const ok = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const err = (code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });
  if (method === "initialize") return ok({ protocolVersion: params?.protocolVersion ?? "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "netzerocalc", version: "0.1.0" } });
  if (method === "ping") return ok({});
  if (method === "tools/list") return ok({ tools: TOOLS });
  if (method === "tools/call") {
    try {
      const out = await callTool(uid, params?.name, params?.arguments ?? {});
      return ok({ content: [{ type: "text", text: JSON.stringify(out, null, 2) }] });
    } catch (e) {
      return ok({ isError: true, content: [{ type: "text", text: (e as Error).message }] });
    }
  }
  if (id === undefined) return null; // notification
  return err(-32601, `method not found: ${method}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: H });
  const uid = await authUser(req);
  if (!uid) return reply({ error: "missing or invalid API token. Create one in NetZeroCalc: Settings > API & MCP." }, 401);
  const path = new URL(req.url).pathname.replace(/^\/(functions\/v1\/)?api/, "").replace(/\/$/, "");
  try {
    if (req.method === "POST" && (path === "" || path === "/mcp")) {
      const body = await req.json();
      if (Array.isArray(body)) {
        const out = (await Promise.all(body.map((m) => handleRpc(uid, m)))).filter(Boolean);
        return out.length ? reply(out) : new Response(null, { status: 202, headers: H });
      }
      const out = await handleRpc(uid, body);
      return out ? reply(out) : new Response(null, { status: 202, headers: H });
    }
    if (req.method === "GET") {
      const u = new URL(req.url);
      if (path === "/projects") return reply(await listProjects(uid));
      const m = path.match(/^\/projects\/([^/]+)\/summary$/);
      if (m) return reply(await projectSummary(uid, decodeURIComponent(m[1])));
      if (path === "/factors") return reply(searchFactors(u.searchParams.get("q") ?? "", u.searchParams.get("region") ?? undefined, Number(u.searchParams.get("limit")) || 10));
    }
    return reply({ error: "not found" }, 404);
  } catch (e) {
    return reply({ error: (e as Error).message }, 400);
  }
});
