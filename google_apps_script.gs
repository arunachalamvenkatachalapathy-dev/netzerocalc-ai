/**
 * NetZeroCalc (e-Credits) — Google Sheets & Drive Serverless Backend
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click Extensions -> Apps Script
 * 3. Replace Code.gs with this file
 * 4. Click Deploy -> New deployment -> Select type: Web app
 * 5. Set "Execute as: Me" and "Who has access: Anyone"
 * 6. Copy the Web App URL and paste it in NetZeroCalc!
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return ContentService.createTextOutput(JSON.stringify({ status: "success", factors: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var factors = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0]) {
      factors.push({
        lookup_key: String(row[0]),
        emission_factor: parseFloat(row[1]) || 0,
        unit: String(row[2] || 'kg'),
        scope: String(row[3] || 'Scope 3'),
        source_notes: String(row[4] || '')
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", factors: factors }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action || 'save_project';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'save_project') {
      var projSheet = ss.getSheetByName('Projects') || ss.insertSheet('Projects');
      if (projSheet.getLastRow() === 0) {
        projSheet.appendRow(['Project Name', 'Company', 'Standard', 'Total Footprint (tCO2e)', 'Timestamp', 'Item Count']);
      }
      projSheet.appendRow([
        contents.projectName || 'Untitled Project',
        contents.companyName || 'Corporate Entity',
        contents.standard || 'ISO 14064-1',
        contents.totalFootprint || 0,
        new Date().toISOString(),
        (contents.bom || []).length
      ]);
      
      var bomSheet = ss.getSheetByName('BOM_Items') || ss.insertSheet('BOM_Items');
      if (bomSheet.getLastRow() === 0) {
        bomSheet.appendRow(['Project Name', 'Item Name', 'Quantity', 'Unit', 'Matched Process', 'EF (kgCO2e/unit)', 'Footprint (tCO2e)', 'Scope', 'Status']);
      }
      
      var items = contents.bom || [];
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        bomSheet.appendRow([
          contents.projectName || 'Untitled Project',
          it.name,
          it.qty,
          it.unit,
          it.process,
          it.ef,
          ((it.qty * it.ef) / 1000).toFixed(3),
          it.scope || 'Scope 3',
          it.status || 'Auto-Matched'
        ]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Saved to Google Sheet successfully!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
