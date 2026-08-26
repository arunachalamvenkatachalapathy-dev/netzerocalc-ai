const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const jsLogic = fs.readFileSync('excelLogic.js', 'utf8');

html = html.replace('// --- Core Logic & Data Sync ---', '// --- Core Logic & Data Sync ---\n' + jsLogic);

const buttonHtml = `
                <button onclick="openExcelModal()" class="px-3 py-1.5 border border-emerald-300 bg-emerald-50 rounded-lg font-semibold text-xs text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">grid_on</span>
                  GHG Master Sheet
                </button>
`;

html = html.replace('<!-- Import JSON Button (Mocked) -->', buttonHtml + '                <!-- Import JSON Button (Mocked) -->');

fs.writeFileSync('index.html', html);
console.log("Successfully injected Excel integration code.");
