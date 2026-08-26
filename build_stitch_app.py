import re
import os

preview_path = r"C:\Users\user\.gemini\antigravity-ide\scratch\e-credits\preview.html"

# Create a complete, gorgeous Stitch UI implementation of CarbonEngine / NetZeroCalc
stitch_html = """<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>CarbonEngine | Audit-Ready ESG Workbench & E-Credits</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "primary": "#0f5238",
            "primary-container": "#2d6a4f",
            "on-primary": "#ffffff",
            "on-primary-container": "#a8e7c5",
            "secondary": "#006399",
            "secondary-container": "#67bafd",
            "secondary-fixed": "#cde5ff",
            "on-secondary-fixed": "#001d32",
            "tertiary": "#5b00c7",
            "tertiary-container": "#742fe5",
            "background": "#faf8ff",
            "surface": "#faf8ff",
            "surface-dim": "#d2d9f4",
            "surface-container": "#eaedff",
            "surface-container-low": "#f2f3ff",
            "surface-container-lowest": "#ffffff",
            "surface-container-high": "#e2e7ff",
            "on-surface": "#131b2e",
            "on-surface-variant": "#404943",
            "outline": "#707973",
            "outline-variant": "#bfc9c1",
            "error": "#ba1a1a",
            "error-container": "#ffdad6",
            "on-error-container": "#93000a"
          },
          fontFamily: {
            "sans": ["Plus Jakarta Sans", "sans-serif"],
            "mono": ["JetBrains Mono", "monospace"],
            "display-lg": ["Plus Jakarta Sans", "sans-serif"],
            "title-sm": ["Plus Jakarta Sans", "sans-serif"],
            "label-caps": ["Plus Jakarta Sans", "sans-serif"],
            "body-base": ["Plus Jakarta Sans", "sans-serif"]
          }
        }
      }
    }
  </script>

  <style>
    body { background-color: #FAF9F5; font-family: 'Plus Jakarta Sans', sans-serif; }
    .sci-border { border: 1px solid #E2E8F0; }
    .sci-shadow { box-shadow: 0 1px 3px rgba(15,23,42,0.05); }
    .font-mono-data { font-family: 'JetBrains Mono', monospace; }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #bfc9c1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #707973; }

    .drawer-content {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.3s ease-out;
    }
    .drawer-content.open { grid-template-rows: 1fr; }
    .drawer-inner { overflow: hidden; }

    .modal-overlay {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(19, 27, 46, 0.4); backdrop-filter: blur(4px);
      display: none; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-overlay.open { display: flex; }
  </style>
</head>

<body class="text-on-surface flex min-h-screen overflow-hidden bg-surface">

  <!-- Left SideNavBar (Stitch Design Spec) -->
  <nav class="hidden md:flex flex-col h-screen w-[320px] lg:w-[340px] sticky left-0 top-0 overflow-y-auto bg-surface-container-lowest border-r border-outline-variant py-6 px-4 shrink-0 z-50">
    <div class="mb-6 px-3 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl sci-border">
        <span class="material-symbols-outlined text-primary text-2xl" style="font-variation-settings: 'FILL' 1;">eco</span>
      </div>
      <div>
        <h1 class="font-display-lg text-xl font-black text-primary tracking-tight leading-none">CarbonEngine</h1>
        <p class="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mt-1">Audit-Ready Workspace</p>
      </div>
    </div>

    <!-- CTA Button -->
    <button onclick="openImportModal()" class="mb-6 w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-bold text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow">
      <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">add_circle</span>
      New BOM Analysis
    </button>

    <!-- Navigation Tabs -->
    <div class="flex-1 flex flex-col gap-1.5">
      <button onclick="switchView('workbench')" id="nav-workbench" class="nav-link active flex items-center gap-3 px-4 py-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-semibold text-sm transition-all text-left w-full">
        <span class="material-symbols-outlined text-xl">analytics</span>
        Workbench & Mapping
      </button>
      <button onclick="switchView('projects')" id="nav-projects" class="nav-link flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high font-medium text-sm rounded-xl transition-all text-left w-full">
        <span class="material-symbols-outlined text-xl">folder_shared</span>
        Projects & Audits
      </button>
      <button onclick="switchView('simulator')" id="nav-simulator" class="nav-link flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high font-medium text-sm rounded-xl transition-all text-left w-full">
        <span class="material-symbols-outlined text-xl">tune</span>
        What-If Simulator
      </button>
      <button onclick="switchView('compliance')" id="nav-compliance" class="nav-link flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high font-medium text-sm rounded-xl transition-all text-left w-full">
        <span class="material-symbols-outlined text-xl">verified_user</span>
        CBAM & ISO Compliance
      </button>
      <button onclick="openBig4Modal()" class="nav-link flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high font-medium text-sm rounded-xl transition-all text-left w-full">
        <span class="material-symbols-outlined text-xl">history_edu</span>
        Big 4 Audit Report
      </button>
    </div>

    <!-- Footer Controls & Settings -->
    <div class="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-1">
      <button onclick="downloadTemplate()" class="flex items-center gap-3 px-4 py-2.5 text-xs text-primary font-bold hover:bg-primary/5 rounded-xl transition-colors w-full text-left">
        <span class="material-symbols-outlined text-lg">download</span>
        Download GHG Template (.xlsx)
      </button>
      <div class="px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/50 mt-2">
        <div class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Target Database</div>
        <select id="dbSelect" onchange="updateProjectSettings()" class="w-full text-xs font-semibold bg-white border border-outline-variant rounded-lg p-1.5 text-on-surface focus:ring-1 focus:ring-primary">
          <option value="India_GHG_Factors" selected>🇮🇳 India GHG Factors v6</option>
          <option value="USLCI">🇺🇸 USLCI (US National)</option>
          <option value="ELCD">🇪🇺 ELCD (European Core)</option>
          <option value="Agribalyse">🌱 Agribalyse (Agri-food)</option>
        </select>
      </div>
    </div>
  </nav>

  <!-- Main Content Workbench Area -->
  <main class="flex-1 flex flex-col h-screen overflow-hidden w-full">
    
    <!-- Top Bar Header (Stitch Design Spec) -->
    <header class="flex justify-between items-center h-16 px-6 lg:px-8 w-full bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40 shrink-0">
      <div class="flex items-center gap-4">
        <div class="md:hidden font-extrabold text-xl text-primary">CarbonEngine</div>
        <nav class="hidden md:flex gap-6">
          <button onclick="switchView('workbench')" class="text-primary border-b-2 border-primary pb-1 font-bold text-xs uppercase tracking-wider">Dashboard & Workbench</button>
          <button onclick="switchView('simulator')" class="text-on-surface-variant hover:text-on-surface pb-1 font-semibold text-xs uppercase tracking-wider transition-colors">Scenario Metrics</button>
          <button onclick="openBig4Modal()" class="text-on-surface-variant hover:text-on-surface pb-1 font-semibold text-xs uppercase tracking-wider transition-colors">ISO 14064 Assurance</button>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden lg:block relative w-64">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">search</span>
          <input id="searchInput" oninput="filterTable()" class="w-full bg-surface-container-low border border-outline-variant py-1.5 pl-9 pr-4 rounded-lg font-medium text-xs focus:ring-1 focus:ring-primary outline-none" placeholder="Search BOM materials..." type="text"/>
        </div>
        <button onclick="openBig4Modal()" class="hidden md:flex bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-primary-container transition-colors shadow-sm items-center gap-1.5">
          <span class="material-symbols-outlined text-sm">verified</span>
          Generate Credits & Certificate
        </button>
      </div>
    </header>

    <!-- Scrollable Content Canvas -->
    <div class="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6">
      
      <!-- VIEW 1: WORKBENCH & MAPPING ENGINE -->
      <div id="view-workbench" class="flex flex-col gap-6">
        
        <!-- Stats KPI Ribbon -->
        <section class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-surface-container-lowest sci-border rounded-xl p-5 sci-shadow">
            <h3 class="font-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Total Carbon Footprint</h3>
            <div class="flex items-end gap-2">
              <span id="kpi-total-co2" class="text-3xl font-extrabold text-on-surface font-mono-data">0.00</span>
              <span class="text-xs font-bold text-on-surface-variant mb-1">tCO₂e</span>
            </div>
          </div>

          <div class="bg-surface-container-lowest sci-border rounded-xl p-5 sci-shadow border-l-4 border-l-secondary">
            <h3 class="font-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Items Pending Review</h3>
            <div class="flex items-end gap-2">
              <span id="kpi-pending-count" class="text-3xl font-extrabold text-secondary font-mono-data">0</span>
              <span class="text-xs font-bold text-secondary mb-1">Action Req.</span>
            </div>
          </div>

          <div class="bg-surface-container-lowest sci-border rounded-xl p-5 sci-shadow border-l-4 border-l-primary">
            <h3 class="font-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Estimated E-Credit Value</h3>
            <div class="flex items-end gap-2">
              <span id="kpi-credit-value" class="text-3xl font-extrabold text-primary font-mono-data">$0</span>
              <span class="text-xs font-bold text-primary mb-1">@ $35/tCO2e</span>
            </div>
          </div>

          <div class="bg-surface-container-lowest sci-border rounded-xl p-5 sci-shadow">
            <h3 class="font-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Audit Progress</h3>
            <div class="flex items-end gap-2 mb-2">
              <span id="kpi-progress-pct" class="text-3xl font-extrabold text-on-surface font-mono-data">0%</span>
            </div>
            <div class="w-full bg-surface-dim h-2 rounded-full overflow-hidden">
              <div id="kpi-progress-bar" class="bg-primary h-full transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </section>

        <!-- Workbench Layout (Sidebar Filters + Data Table) -->
        <div class="flex flex-col lg:flex-row gap-6">
          
          <!-- Match Parameters Filter Sidebar -->
          <aside class="w-full lg:w-64 shrink-0 flex flex-col gap-4">
            <div class="bg-surface-container-lowest sci-border rounded-xl p-5 sci-shadow">
              <h2 class="font-bold text-sm text-on-surface mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-lg text-primary">tune</span>
                Match Parameters
              </h2>
              
              <!-- Region Context -->
              <div class="mb-5">
                <label class="block font-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Geography Context</label>
                <select id="geoSelect" onchange="updateProjectSettings()" class="w-full text-xs font-semibold bg-white border border-outline-variant rounded-lg p-2 text-on-surface">
                  <option value="IN" selected>India (IN)</option>
                  <option value="US">United States (US)</option>
                  <option value="EU">Europe (EU)</option>
                  <option value="GLO">Global (GLO)</option>
                </select>
              </div>

              <!-- Min Confidence Score Slider -->
              <div class="mb-5">
                <div class="flex justify-between items-center mb-2">
                  <label class="font-bold text-[11px] text-on-surface-variant uppercase tracking-wider">Min Confidence</label>
                  <span id="scoreVal" class="text-xs font-bold text-primary font-mono-data">75%</span>
                </div>
                <input id="scoreSlider" oninput="document.getElementById('scoreVal').innerText = this.value + '%'; filterTable();" type="range" min="50" max="95" value="75" class="w-full accent-primary h-1.5 bg-surface-dim rounded-lg cursor-pointer">
              </div>

              <!-- Risk Filter Chips -->
              <div>
                <label class="block font-bold text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">Risk Filter</label>
                <div class="flex flex-wrap gap-1.5">
                  <button onclick="setRiskFilter('ALL', this)" class="risk-btn active px-2.5 py-1 rounded-lg border border-primary text-primary font-bold text-[11px] bg-primary/10">ALL</button>
                  <button onclick="setRiskFilter('HIGH', this)" class="risk-btn px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-[11px] hover:bg-surface-container-low">HIGH</button>
                  <button onclick="setRiskFilter('MEDIUM', this)" class="risk-btn px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-[11px] hover:bg-surface-container-low">MEDIUM</button>
                  <button onclick="setRiskFilter('LOW', this)" class="risk-btn px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-[11px] hover:bg-surface-container-low">LOW</button>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main BOM Data Table -->
          <div class="flex-1 min-w-0 bg-surface-container-lowest sci-border rounded-xl sci-shadow overflow-hidden flex flex-col">
            <div class="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8FAFC]">
              <div>
                <h2 class="font-bold text-sm text-on-surface">BOM-to-LCI Mapping Engine</h2>
                <p id="table-subtitle" class="text-xs text-on-surface-variant mt-0.5">Loaded 5 materials from active project queue.</p>
              </div>
              <div class="flex gap-2">
                <button onclick="approveAllLowRisk()" class="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">done_all</span>
                  Approve All Low Risk
                </button>
                <button onclick="openImportModal()" class="px-3 py-1.5 border border-outline-variant rounded-lg font-semibold text-xs text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">upload_file</span>
                  Import BOM
                </button>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse whitespace-nowrap">
                <thead class="bg-[#F8FAFC] border-b border-outline-variant">
                  <tr>
                    <th class="w-8 px-4 py-3"></th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant">Source BOM Item</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant text-right">Qty/Unit</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant">Matched LCI Process</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant text-center">DQR</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant text-right">Similarity</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant">Risk</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant text-right">Footprint</th>
                    <th class="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="bomTableBody" class="divide-y divide-outline-variant/40 font-medium text-xs">
                  <!-- JS dynamically renders rows & expandable DQR drawers here -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 2: WHAT-IF SIMULATOR -->
      <div id="view-simulator" class="hidden flex-col gap-6">
        <div class="bg-surface-container-lowest sci-border rounded-xl p-6 sci-shadow">
          <h2 class="font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">tune</span>
            What-If Decarbonization & Renewable Energy Simulator
          </h2>
          <p class="text-xs text-on-surface-variant mb-6">Simulate material substitutions, green power procurement, and calculate carbon credit yields.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="flex flex-col gap-5 bg-surface-container-low p-5 rounded-xl border border-outline-variant/40">
              <div>
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span>Recycled Material Substitution</span>
                  <span id="simRecVal" class="text-primary font-mono-data">50%</span>
                </div>
                <input id="simRecSlider" oninput="updateSim()" type="range" min="0" max="100" value="50" class="w-full accent-primary h-2 bg-surface-dim rounded-lg cursor-pointer">
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span>Renewable Energy (Solar/Wind PPA)</span>
                  <span id="simRenVal" class="text-secondary font-mono-data">80%</span>
                </div>
                <input id="simRenSlider" oninput="updateSim()" type="range" min="0" max="100" value="80" class="w-full accent-secondary h-2 bg-surface-dim rounded-lg cursor-pointer">
              </div>
            </div>

            <div class="flex flex-col gap-4 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant">
              <div class="flex justify-between items-center text-xs pb-3 border-b border-outline-variant/40">
                <span class="text-on-surface-variant font-medium">Baseline Footprint</span>
                <span id="simBaseline" class="font-bold text-sm font-mono-data">0.00 tCO₂e</span>
              </div>
              <div class="flex justify-between items-center text-xs pb-3 border-b border-outline-variant/40">
                <span class="text-on-surface-variant font-medium">Simulated Avoided Emissions</span>
                <span id="simAvoided" class="font-bold text-sm text-primary font-mono-data">0.00 tCO₂e</span>
              </div>
              <div class="flex justify-between items-center text-xs pt-1">
                <span class="text-on-surface-variant font-bold">Estimated E-Credit Valuation (@ $35/t)</span>
                <span id="simValuation" class="font-extrabold text-base text-tertiary font-mono-data">$0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>

  <!-- Big 4 Audit Report Modal -->
  <div id="big4Modal" class="modal-overlay">
    <div class="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto sci-shadow relative border border-outline-variant">
      <button onclick="closeBig4Modal()" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface font-bold text-xl">✕</button>
      
      <div id="auditReportContent" class="space-y-6 text-on-surface">
        <div class="flex justify-between items-start border-b border-outline-variant pb-4">
          <div>
            <div class="text-[10px] font-extrabold text-primary uppercase tracking-widest">GLOBAL SUSTAINABILITY ASSURANCE PRACTICE</div>
            <h1 class="text-xl font-black text-on-surface mt-1">INDEPENDENT PRACTITIONER'S ASSURANCE REPORT</h1>
            <p class="text-xs text-on-surface-variant font-medium">ISAE 3410 & ISO 14064-3 Compliance Statement</p>
          </div>
          <span class="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-extrabold font-mono-data">
            PASSED ASSURANCE AUDIT
          </span>
        </div>

        <div class="text-xs space-y-3 text-on-surface-variant leading-relaxed">
          <p>We have performed a limited assurance engagement on the Carbon Footprint & Scope 3 inventory calculations for <strong class="text-on-surface">EV Battery Assembly Line (India)</strong> using <strong class="text-on-surface">India GHG Factors v6</strong>.</p>
          <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 font-medium">
            <strong>Conclusion:</strong> Based on the audit procedures performed, nothing has come to our attention that causes us to believe that the inventory calculation is not prepared in accordance with the GHG Protocol Corporate Standard and ISO 14064-1:2018.
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          <button onclick="window.print()" class="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary-container">Print / Save PDF Report</button>
          <button onclick="closeBig4Modal()" class="px-4 py-2 border border-outline-variant rounded-lg font-bold text-xs">Close</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Initial sample BOM items matching Stitch design specs
    let sampleBOM = [
      { id: 1, name: "Aluminum Sheet, 5052-H32", qty: 1450, unit: "kg", process: "aluminium alloy production, AlMg3 | cutoff, S - RER", ef: 14.2, sim: 0.98, ter: 1, ger: 2, tir: 1, risk: "LOW", status: "Auto-Matched", approved: true },
      { id: 2, name: "Custom Polyurethane Foam Insert", qty: 320, unit: "pcs", process: "polyurethane production, flexible foam | cutoff, S - GLO", ef: 4.8, sim: 0.42, ter: 4, ger: 3, tir: 2, risk: "HIGH", status: "Manual Review", approved: false },
      { id: 3, name: "Copper Wire, 12 AWG", qty: 50, unit: "kg", process: "copper wire drawing | cutoff, S - GLO", ef: 6.5, sim: 0.94, ter: 1, ger: 1, tir: 1, risk: "LOW", status: "Auto-Matched", approved: true },
      { id: 4, name: "Grid Electricity (Maharashtra Substation)", qty: 12000, unit: "kWh", process: "Electricity Grid CEA India 2024", ef: 0.716, sim: 0.99, ter: 1, ger: 1, tir: 1, risk: "LOW", status: "Auto-Matched", approved: true },
      { id: 5, name: "Structural Steel Enclosure Bracket", qty: 850, unit: "kg", process: "steel production, converter, unalloyed | cutoff, S - GLO", ef: 1.85, sim: 0.88, ter: 2, ger: 2, tir: 1, risk: "MEDIUM", status: "Auto-Matched", approved: false }
    ];

    let currentRiskFilter = "ALL";

    function renderTable() {
      const tbody = document.getElementById("bomTableBody");
      tbody.innerHTML = "";

      let filtered = sampleBOM.filter(item => {
        if (currentRiskFilter !== "ALL" && item.risk !== currentRiskFilter) return false;
        return true;
      });

      filtered.forEach(item => {
        let co2e = ((item.qty * item.ef) / 1000).toFixed(3);
        let riskClass = item.risk === "HIGH" ? "bg-error-container text-on-error-container border-error/20" :
                        item.risk === "MEDIUM" ? "bg-amber-100 text-amber-900 border-amber-300" :
                        "bg-primary/10 text-primary border-primary/20";

        let tr = document.createElement("tr");
        tr.className = "hover:bg-surface-container-low transition-colors cursor-pointer";
        tr.onclick = () => toggleDrawer(item.id);

        tr.innerHTML = `
          <td class="px-4 py-3 text-outline-variant"><span class="material-symbols-outlined text-base">chevron_right</span></td>
          <td class="px-4 py-3 font-semibold text-on-surface">${item.name}</td>
          <td class="px-4 py-3 font-mono-data text-right text-on-surface-variant">${item.qty.toLocaleString()} ${item.unit}</td>
          <td class="px-4 py-3">
            <div class="font-medium text-on-surface truncate max-w-[280px]">${item.process}</div>
            <div class="text-[10px] text-on-surface-variant">India GHG Factors v6 • EF: ${item.ef} kgCO2e/${item.unit}</div>
          </td>
          <td class="px-4 py-3 text-center">
            <div class="flex gap-1 justify-center">
              <span class="dqr-pill dqr-${item.ter}">${item.ter}</span>
              <span class="dqr-pill dqr-${item.ger}">${item.ger}</span>
              <span class="dqr-pill dqr-${item.tir}">${item.tir}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-right font-mono-data font-bold ${item.sim < 0.6 ? 'text-error' : 'text-primary'}">${(item.sim * 100).toFixed(0)}%</td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskClass}">${item.risk}</span>
          </td>
          <td class="px-4 py-3 text-right font-mono-data font-bold text-on-surface">${co2e} t</td>
          <td class="px-4 py-3 text-right" onclick="event.stopPropagation()">
            ${item.approved ? 
              `<span class="text-primary font-bold text-[11px] flex items-center justify-end gap-1"><span class="material-symbols-outlined text-sm">check_circle</span> Approved</span>` :
              `<button onclick="approveRow(${item.id})" class="px-2.5 py-1 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-container">Approve</button>`
            }
          </td>
        `;

        tbody.appendChild(tr);

        // Drawer row
        let drawerTr = document.createElement("tr");
        drawerTr.id = `drawer-${item.id}`;
        drawerTr.className = "bg-surface-container-low/40 hidden";
        drawerTr.innerHTML = `
          <td colspan="9" class="p-4 pl-12 border-b border-outline-variant/40">
            <div class="flex gap-6 items-start text-xs">
              <div class="w-64 shrink-0 bg-white p-3 rounded-lg border border-outline-variant">
                <div class="font-bold text-on-surface mb-2 uppercase text-[10px] tracking-wider">Data Quality Rating (DQR)</div>
                <div class="space-y-1.5 text-[11px]">
                  <div class="flex justify-between"><span>Technological (TeR):</span> <span class="font-bold">${item.ter}/5</span></div>
                  <div class="flex justify-between"><span>Geographical (GeR):</span> <span class="font-bold">${item.ger}/5</span></div>
                  <div class="flex justify-between"><span>Temporal (TiR):</span> <span class="font-bold">${item.tir}/5</span></div>
                </div>
              </div>
              <div class="flex-1 bg-white p-3 rounded-lg border border-outline-variant">
                <div class="font-bold text-on-surface mb-1">Automated Audit Reasoning</div>
                <p class="text-on-surface-variant text-[11px]">Matched via high-confidence vector embedding algorithm against verified LCI factors in India GHG Factors v6 database.</p>
              </div>
            </div>
          </td>
        `;
        tbody.appendChild(drawerTr);
      });

      updateKPIs();
    }

    function toggleDrawer(id) {
      let d = document.getElementById(`drawer-${id}`);
      if (d) d.classList.toggle("hidden");
    }

    function approveRow(id) {
      let item = sampleBOM.find(i => i.id === id);
      if (item) {
        item.approved = true;
        renderTable();
      }
    }

    function approveAllLowRisk() {
      sampleBOM.forEach(i => { if (i.risk === "LOW") i.approved = true; });
      renderTable();
    }

    function setRiskFilter(risk, btn) {
      currentRiskFilter = risk;
      document.querySelectorAll(".risk-btn").forEach(b => {
        b.className = "risk-btn px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-semibold text-[11px] hover:bg-surface-container-low";
      });
      btn.className = "risk-btn active px-2.5 py-1 rounded-lg border border-primary text-primary font-bold text-[11px] bg-primary/10";
      renderTable();
    }

    function updateKPIs() {
      let totalCo2 = sampleBOM.reduce((sum, i) => sum + ((i.qty * i.ef) / 1000), 0);
      let pending = sampleBOM.filter(i => !i.approved).length;
      let approvedCount = sampleBOM.filter(i => i.approved).length;
      let pct = Math.round((approvedCount / sampleBOM.length) * 100);
      let creditVal = Math.round(totalCo2 * 35);

      document.getElementById("kpi-total-co2").innerText = totalCo2.toFixed(3);
      document.getElementById("kpi-pending-count").innerText = pending;
      document.getElementById("kpi-credit-value").innerText = "$" + creditVal.toLocaleString();
      document.getElementById("kpi-progress-pct").innerText = pct + "%";
      document.getElementById("kpi-progress-bar").style.width = pct + "%";
      document.getElementById("simBaseline").innerText = totalCo2.toFixed(3) + " tCO₂e";
      updateSim();
    }

    function updateSim() {
      let baseCo2 = parseFloat(document.getElementById("kpi-total-co2").innerText) || 0;
      let rec = parseInt(document.getElementById("simRecSlider").value);
      let ren = parseInt(document.getElementById("simRenSlider").value);
      
      document.getElementById("simRecVal").innerText = rec + "%";
      document.getElementById("simRenVal").innerText = ren + "%";

      let avoided = baseCo2 * ((rec * 0.4 + ren * 0.45) / 100);
      let val = Math.round(avoided * 35);

      document.getElementById("simAvoided").innerText = avoided.toFixed(3) + " tCO₂e";
      document.getElementById("simValuation").innerText = "$" + val.toLocaleString();
    }

    function switchView(view) {
      document.querySelectorAll("[id^='view-']").forEach(v => v.classList.add("hidden"));
      let target = document.getElementById(`view-${view}`);
      if (target) target.classList.remove("hidden");

      document.querySelectorAll(".nav-link").forEach(l => {
        l.className = "nav-link flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high font-medium text-sm rounded-xl transition-all text-left w-full";
      });
      let activeNav = document.getElementById(`nav-${view}`);
      if (activeNav) {
        activeNav.className = "nav-link active flex items-center gap-3 px-4 py-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-semibold text-sm transition-all text-left w-full";
      }
    }

    function openBig4Modal() { document.getElementById("big4Modal").classList.add("open"); }
    function closeBig4Modal() { document.getElementById("big4Modal").classList.remove("open"); }
    function downloadTemplate() { window.location.href = "GHG_Calculator_RECTIFIED_v6.xlsx"; }
    function openImportModal() { alert("Upload CSV or XLSX file to add new BOM items."); }

    renderTable();
  </script>
</body>
</html>
"""

with open(preview_path, "w", encoding="utf-8") as f:
    f.write(stitch_html)

print("Successfully replaced preview.html with Stitch CarbonEngine Workbench UI!")
