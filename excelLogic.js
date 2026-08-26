
    // --- Spreadsheet / Excel CSV Integration Logic ---
    function openExcelModal() {
      populateExcelTable();
      document.getElementById("excelModal").classList.add("open");
    }

    function closeExcelModal() {
      document.getElementById("excelModal").classList.remove("open");
    }

    function populateExcelTable() {
      const tbody = document.getElementById("excelTableBody");
      tbody.innerHTML = "";
      
      materialDB.forEach((item, index) => {
        let tr = document.createElement("tr");
        tr.className = "hover:bg-surface-container-lowest transition-colors";
        tr.innerHTML = `
          <td class="p-2 border-b border-outline-variant/30">${escapeHtml(item.scope)}</td>
          <td class="p-2 border-b border-outline-variant/30">${escapeHtml(item.category)}</td>
          <td class="p-2 border-b border-outline-variant/30 font-bold">${escapeHtml(item.process)}</td>
          <td class="p-2 border-b border-outline-variant/30">${escapeHtml(item.unit)}</td>
          <td class="p-2 border-b border-outline-variant/30">${item.ef}</td>
          <td class="p-2 border-b border-outline-variant/30 bg-emerald-50/50">
            <input type="number" id="excel-qty-${index}" min="0" step="any" placeholder="0" class="w-24 p-1 text-xs border border-emerald-200 rounded outline-none focus:ring-1 focus:ring-emerald-500 bg-white">
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function syncExcelToBom() {
      let added = 0;
      materialDB.forEach((item, index) => {
        let qtyInput = document.getElementById(`excel-qty-${index}`);
        if (qtyInput) {
          let qty = parseFloat(qtyInput.value);
          if (!isNaN(qty) && qty > 0) {
            // Add to BOM
            sampleBOM.push({
              id: Date.now() + Math.random(),
              name: `Imported from Master Sheet: ${item.process}`,
              qty: qty,
              unit: item.unit,
              process: item.process,
              ef: item.ef,
              sim: 1.0, // Perfect match since it's from the sheet
              ter: 1, ger: 1, tir: 1,
              risk: "LOW",
              scope: item.scope,
              status: "Auto-Matched",
              approved: false
            });
            added++;
            qtyInput.value = ""; // reset
          }
        }
      });
      
      if (added > 0) {
        showSmsToast(`Successfully imported ${added} items from Master Sheet!`);
        renderTable();
        saveState();
        closeExcelModal();
      } else {
        closeExcelModal();
      }
    }
