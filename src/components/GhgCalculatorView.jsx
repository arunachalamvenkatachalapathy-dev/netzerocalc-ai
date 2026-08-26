import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import LuckyExcel from 'luckyexcel';
import { 
  Monitor, Smartphone, ArrowRight, AlertCircle, Table, 
  Maximize2, Minimize2, RotateCcw, Save, CheckCircle2, FileSpreadsheet, RefreshCw
} from 'lucide-react';

const EDITS_STORAGE_KEY = 'netzerocalc_excel_cell_edits';

export default function GhgCalculatorView({ onSave, onCancel }) {
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [saveStatus, setSaveStatus] = useState('');
  const workbookRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Clear any legacy broken sheet dumps from localStorage
  useEffect(() => {
    localStorage.removeItem('netzerocalc_excel_sheets');
  }, []);

  // Viewport resize watcher for mobile fallback
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load template and apply saved cell edits
  const loadWorkbookData = useCallback(() => {
    setLoading(true);
    setErrorMsg('');

    const templatePath = `${import.meta.env.BASE_URL}GHG_Calculator_RECTIFIED_v6.xlsx`;

    fetch(templatePath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch template from ${templatePath}`);
        return res.arrayBuffer();
      })
      .then(buffer => {
        const file = new File([buffer], "GHG_Calculator_RECTIFIED_v6.xlsx", { 
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });
        
        LuckyExcel.transformExcelToLucky(
          file,
          (exportJson) => {
            if (!exportJson || !exportJson.sheets || exportJson.sheets.length === 0) {
              setErrorMsg("Failed to parse spreadsheet sheets.");
              setLoading(false);
              return;
            }

            const sheets = exportJson.sheets;

            // Apply saved cell edits on top of pristine template
            const rawSavedEdits = localStorage.getItem(EDITS_STORAGE_KEY);
            if (rawSavedEdits) {
              try {
                const savedEdits = JSON.parse(rawSavedEdits);
                sheets.forEach(sheet => {
                  const sheetEdits = savedEdits[sheet.name];
                  if (sheetEdits && sheet.data) {
                    Object.entries(sheetEdits).forEach(([key, val]) => {
                      const [r, c] = key.split('_').map(Number);
                      if (sheet.data[r] && sheet.data[r][c]) {
                        sheet.data[r][c].v = val;
                        sheet.data[r][c].m = String(val);
                      }
                    });
                  }
                });
              } catch (err) {
                console.warn("Could not apply saved cell edits", err);
              }
            }
            
            setSheetData(sheets);
            setLoading(false);
          },
          (err) => {
            console.error('LuckyExcel transform error', err);
            setErrorMsg("Excel engine transform error. Click Reset to reload.");
            setLoading(false);
          }
        );
      })
      .catch(err => {
        console.error("Failed to fetch excel file", err);
        setErrorMsg(`Failed to load Excel template (${err.message}).`);
        setLoading(false);
      });
  }, []);

  // Initial load
  useEffect(() => {
    if (isMobile) return;
    loadWorkbookData();
  }, [isMobile, loadWorkbookData]);

  // Handle explicit Reset / Refresh button
  const handleResetTemplate = () => {
    if (window.confirm("Are you sure you want to reset the Excel workbook to its default template? Any custom edits in this spreadsheet will be reset.")) {
      localStorage.removeItem(EDITS_STORAGE_KEY);
      localStorage.removeItem('netzerocalc_excel_sheets');
      loadWorkbookData();
      setSaveStatus('Template reset');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Helper to get cell value
  const getCellValue = (sheet, r, c) => {
    if (!sheet.data || !sheet.data[r] || !sheet.data[r][c]) return null;
    const cell = sheet.data[r][c];
    return cell.v !== undefined ? cell.v : cell.m;
  };

  // Handle saving and extracting data to BOM
  const handleSave = () => {
    if (!workbookRef.current) return;
    
    const sheets = workbookRef.current.getAllSheets();

    // Persist cell edits map to localStorage
    try {
      const editsMap = {};
      sheets.forEach(sheet => {
        if (sheet.data) {
          const sheetEdits = {};
          for (let r = 0; r < sheet.data.length; r++) {
            const row = sheet.data[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
              const cell = row[c];
              if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
                sheetEdits[`${r}_${c}`] = cell.v;
              }
            }
          }
          editsMap[sheet.name] = sheetEdits;
        }
      });
      localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(editsMap));
    } catch (e) {
      console.warn("Failed to serialize cell edits", e);
    }

    const coverSheet = sheets.find(s => s.name === 'Cover_Boundary');
    const calcSheet = sheets.find(s => s.name === 'GHG_Master_Calculator') || sheets[0];
    
    if (!calcSheet) {
       console.error("Could not find GHG calculation sheet");
       return;
    }

    const coverBoundary = {
       consolidationApproach: 'Operational Control',
       reportingPeriod: 'FY2024',
       baseYear: '2023',
       gwpVintage: 'IPCC AR6',
       materialityThreshold: '5%'
    };

    if (coverSheet && coverSheet.data) {
        for (let r = 0; r < coverSheet.data.length; r++) {
            const row = coverSheet.data[r];
            if (!row) continue;
            for (let c = 0; c < row.length; c++) {
                const cell = row[c];
                if (!cell) continue;
                const text = String(cell.m || cell.v || '').toLowerCase();
                if (text.includes('consolidation approach')) coverBoundary.consolidationApproach = String(getCellValue(coverSheet, r, c + 1) || coverBoundary.consolidationApproach);
                if (text.includes('reporting period')) coverBoundary.reportingPeriod = String(getCellValue(coverSheet, r, c + 1) || coverBoundary.reportingPeriod);
                if (text.includes('base year')) coverBoundary.baseYear = String(getCellValue(coverSheet, r, c + 1) || coverBoundary.baseYear);
                if (text.includes('gwp vintage') || text.includes('gwp values used')) coverBoundary.gwpVintage = String(getCellValue(coverSheet, r, c + 1) || coverBoundary.gwpVintage);
                if (text.includes('materiality threshold')) coverBoundary.materialityThreshold = String(getCellValue(coverSheet, r, c + 1) || coverBoundary.materialityThreshold);
            }
        }
    }

    const bomItems = [];
    if (calcSheet && calcSheet.data) {
      let currentScope = 'Scope 1';
      let currentSubCategory = 'Stationary Combustion';

      for (let r = 0; r < calcSheet.data.length; r++) {
        const row = calcSheet.data[r];
        if (!row) continue;
        
        const colA = String(row[0]?.m || row[0]?.v || '').trim();
        if (!colA) continue;
        const colALower = colA.toLowerCase();

        // Scope headers
        if (colALower.includes('scope 1')) {
          currentScope = 'Scope 1';
          continue;
        } else if (colALower.includes('scope 2')) {
          currentScope = 'Scope 2';
          continue;
        } else if (colALower.includes('scope 3')) {
          currentScope = 'Scope 3';
          continue;
        }

        // Skip table headers
        if (colALower.includes('category / item') || colALower.includes('process / item') || colALower.includes('quantity (input)') || colALower.includes('emission factor')) {
          continue;
        }

        // Stop on Grand Total / Total Inventory footer rows
        if (colALower.includes('grand total') || colALower.includes('total inventory') || colALower.includes('total co2e')) {
          break;
        }

        const rawQty = row[1]?.v !== undefined ? row[1]?.v : row[1]?.m;
        const rawUnit = row[2]?.m || row[2]?.v;
        const rawEf = row[3]?.v !== undefined ? row[3]?.v : row[3]?.m;
        const rawUnitEf = row[4]?.m || row[4]?.v;
        const rawResult = row[5]?.v !== undefined ? row[5]?.v : row[5]?.m;

        // Subheaders
        if ((rawQty === undefined || rawQty === null || String(rawQty).trim() === '') && 
            (rawEf === undefined || rawEf === null || String(rawEf).trim() === '')) {
          currentSubCategory = colA;
          continue;
        }

        const qty = Number(rawQty) || 0;
        const unit = String(rawUnit || 'units').trim();
        const ef = Number(rawEf) || 0;
        const unitEf = String(rawUnitEf || 'kg CO2e/unit').trim();
        const result_tco2e = !isNaN(Number(rawResult)) && Number(rawResult) > 0 
          ? Number(rawResult) 
          : (qty * ef) / 1000;

        const formula = String(row[6]?.m || row[6]?.v || `(${qty} * ${ef}) / 1000`).trim();
        const notes = String(row[7]?.m || row[7]?.v || '').trim();

        let scope3Cat = 'Cat 1: Purchased Goods & Services';
        if (currentScope === 'Scope 1') {
          scope3Cat = 'N/A (Scope 1 Direct)';
        } else if (currentScope === 'Scope 2') {
          scope3Cat = 'N/A (Scope 2 Location-Based)';
        } else if (currentSubCategory) {
          scope3Cat = currentSubCategory;
        }

        bomItems.push({
          id: `excel_row_${r + 1}`,
          name: colA,
          item: colA,
          qty,
          unit,
          process: colA,
          ef,
          efUnit: unitEf,
          result_tco2e: Number(result_tco2e.toFixed(4)),
          formula,
          notes,
          scope: currentScope,
          scope3Category: scope3Cat,
          approved: true,
          dqrScore: 2.0,
          status: 'Excel Synced',
          source: 'GHG Master Sheet'
        });
      }
    }

    const activeItems = bomItems.filter(i => i.qty > 0);
    const itemsToSave = activeItems.length > 0 ? activeItems : bomItems;

    if (onSave) {
      onSave(itemsToSave, coverBoundary);
    }
  };

  // Mobile Fallback Screen
  if (isMobile) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center mx-auto">
          <Monitor className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Mobile Screen Detected
          </div>
          <h2 className="text-xl font-black text-slate-900">Desktop / Tablet Screen Required</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            The GHG Master Calculator is an interactive spreadsheet engine featuring live multi-column cell formulas and VLOOKUP lookups. For optimal precision, please open this tool on a desktop or tablet screen.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" /> Mobile-Optimized Alternative:
          </div>
          <p className="text-[11px] text-slate-600">
            You can enter Scope 1-3 line items, search emission factors, and view all decarbonization metrics using the touch-friendly <strong>BOM Workbench</strong>.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Table className="w-4 h-4" />
          <span>Return to BOM Workbench</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Container styling depending on isFullscreen
  const containerClasses = isFullscreen
    ? "fixed inset-0 z-50 w-screen h-screen flex flex-col bg-slate-900 overflow-hidden"
    : "h-[calc(100vh-140px)] min-h-[600px] flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl";

  return (
    <div className={containerClasses}>
      {/* Excel Sheet Toolbar Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 text-white flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-white">GHG Master Calculator (Interactive FortuneSheet Engine)</h2>
              {saveStatus && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded animate-in fade-in">
                  {saveStatus}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Edits auto-save. Click "Save to BOM" to sync inventory into active workspace.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Full Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          {/* Refresh / Reset Template Button */}
          <button 
            onClick={handleResetTemplate}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            title="Reset sheet to fresh template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Excel</span>
          </button>

          {/* Cancel */}
          <button 
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {/* Save to BOM Button */}
          <button 
            onClick={handleSave}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to BOM</span>
          </button>
        </div>
      </div>
      
      {/* Spreadsheet Canvas Container with Explicit Dimensions */}
      <div className="flex-1 w-full h-full relative min-h-[500px] overflow-hidden bg-slate-900">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400 z-10">
            <div className="text-center space-y-3">
              <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="text-xs font-medium text-slate-300">Loading GHG Master Calculator...</div>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-rose-400 text-xs p-6 text-center space-y-3 z-10">
            <div>
              <p className="font-bold mb-2">{errorMsg}</p>
              <button
                onClick={loadWorkbookData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 inline-flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
              </button>
            </div>
          </div>
        ) : sheetData ? (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
            <Workbook 
              ref={workbookRef} 
              data={sheetData} 
              onChange={(data) => {
                if (!workbookRef.current) return;
                
                // Debounced cell edits persistence
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = setTimeout(() => {
                  if (workbookRef.current) {
                    try {
                      const allSheets = workbookRef.current.getAllSheets();
                      const editsMap = {};
                      allSheets.forEach(sheet => {
                        if (sheet.data) {
                          const sheetEdits = {};
                          for (let r = 0; r < sheet.data.length; r++) {
                            const row = sheet.data[r];
                            if (!row) continue;
                            for (let c = 0; c < row.length; c++) {
                              const cell = row[c];
                              if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
                                sheetEdits[`${r}_${c}`] = cell.v;
                              }
                            }
                          }
                          editsMap[sheet.name] = sheetEdits;
                        }
                      });
                      localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(editsMap));
                      setSaveStatus('Auto-saved');
                      setTimeout(() => setSaveStatus(''), 2000);
                    } catch (err) {
                      console.warn("Auto-save failed", err);
                    }
                  }
                }, 400);

                // Live formula calculation for result_tco2e (Column F)
                setTimeout(() => {
                    if (!workbookRef.current) return;
                    const calcSheet = data.find(s => s.name === 'GHG_Master_Calculator') || data[0];
                    if (calcSheet && calcSheet.data) {
                      for (let r = 0; r < calcSheet.data.length; r++) {
                        const row = calcSheet.data[r];
                        if (!row || !row[0]) continue;
                        
                        const colA = String(row[0].m || row[0].v || '').trim();
                        if (colA.toUpperCase().includes('GRAND TOTAL')) continue;

                        const qtyRaw = row[1] ? (row[1].v !== undefined ? row[1].v : row[1].m) : null;
                        const efRaw = row[3] ? (row[3].v !== undefined ? row[3].v : row[3].m) : null;
                        const resultRaw = row[5] ? (row[5].v !== undefined ? row[5].v : row[5].m) : null;

                        const qty = Number(qtyRaw);
                        const ef = Number(efRaw);
                        const currentResult = Number(resultRaw) || 0;

                        if (!isNaN(qty) && !isNaN(ef) && row[5]) {
                           const expectedResult = (qty * ef) / 1000;
                           if (Math.abs(currentResult - expectedResult) > 0.0001) {
                               workbookRef.current.setCellFormat(r, 5, 'v', expectedResult);
                               workbookRef.current.setCellFormat(r, 5, 'm', expectedResult.toFixed(4));
                               
                               if (row[6]) {
                                  workbookRef.current.setCellFormat(r, 6, 'v', `(${qty} x ${ef}) / 1000`);
                                  workbookRef.current.setCellFormat(r, 6, 'm', `(${qty} x ${ef}) / 1000`);
                               }
                           }
                        }
                      }
                    }
                }, 150);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
