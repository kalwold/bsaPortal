
 const CURRENCIES = [
  "USD",
  "EUR",
  "CHF",
  "GBP",
  "JPY",
  "DJF",
  "KES",
  "INR",
  "DKK",
  "SEK",
  "SAR",
  "CAD",
  "AED",
  "AUD",
  "CNY",
  "NOK",
  "KWD",
];
const extractForexData = (data) => {
  const result = [];
  let dataTableStart = -1;
   let noandtitles = [];
    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if(i === 13){
      noandtitles = [firstCell,secondCell]
      console.log("Found title:", noandtitles);
    }
  }
  console.log("=== Extracting Foreground Data ===");

  // Find the data table start
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "S/No") {
      dataTableStart = i + 1;
      console.log("Found data table at row:", dataTableStart);
      break;
    }
  }

  // if (dataTableStart === -1) {
  //   console.log("Could not find data table");
  //   return result;
  // }

  const nodeMap = new Map();
  const topLevelNodes = [];

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];

  // Find column indices
  let currencyStartIndex = -1;
  let othersStartIndex = -1;
  let overallExposureIndex = -1;

  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || "").trim();
    console.log(`Header column ${i}: "${cell}"`);

    if (cell === "USD") {
      currencyStartIndex = i;
      console.log("Found USD at column:", i);
    }
    if (cell === "Others in Single Currency") {
      othersStartIndex = i;
      console.log("Found Others in Single Currency at column:", i);
    }
    if (cell === "Overall Exposure" || cell.includes("Overall")) {
      overallExposureIndex = i;
      console.log("Found Overall Exposure at column:", i);
    }
  }

  // Fallback if headers not found
  if (currencyStartIndex === -1) {
    currencyStartIndex = 2;
    console.log("Using default currency start index:", currencyStartIndex);
  }

  // IMPORTANT: The "Others in Single Currency" columns are at fixed positions
  // In your Excel, they are at indices 19, 20, 21 (columns T, U, V)
  // We need to find them by looking at the header row or using fixed positions
  if (othersStartIndex === -1) {
    // Try to find "Others in Single Currency" by looking at the header
    for (let i = 0; i < headerRow.length; i++) {
      const cell = String(headerRow[i] || "").trim();
      if (cell === "Others in Single Currency") {
        othersStartIndex = i;
        console.log("Found Others in Single Currency at column:", i);
        break;
      }
    }
    // If still not found, use a fixed offset based on your Excel structure
    if (othersStartIndex === -1) {
      // The "Others in Single Currency" columns are typically after the 17 currency columns
      // But they are separated by some empty columns
      // In your Excel, they start at column T (index 19)
      othersStartIndex = 19;
      console.log("Using fixed others start index:", othersStartIndex);
    }
  }

  if (overallExposureIndex === -1) {
    overallExposureIndex = headerRow.length - 1;
    console.log("Using last column as Overall Exposure:", overallExposureIndex);
  }

  console.log("Currency start index:", currencyStartIndex);
  console.log("Others start index:", othersStartIndex);
  console.log("Overall Exposure index:", overallExposureIndex);

  // First pass: Create all nodes with their S/No
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] || "").trim();
    const label = String(row[1] || "").trim();

    // Skip rows without S/No or without label
    if (!sNo || !label) continue;

    // Check if this is a total row
    const isTotalRow =
      label.includes("Total Foreign Assets") ||
      label.includes("Total Foreign Liabilities");

    // Check if this is a section header
    const isSectionHeader =
      !sNo.includes(".") &&
      (label.includes("Foreign Currency Assets") ||
        label.includes("Foreign Currency Liabilities") ||
        label.includes("Foreign Exhange Position") ||
        label.includes("Overall Foreign Exhange Position"));

    // Extract values for ALL columns
    const values = {};

    // 1. Extract 17 currency values - ONLY from currency columns
    // These are at positions currencyStartIndex to currencyStartIndex + 16
    for (let j = 0; j < CURRENCIES.length; j++) {
      const colIndex = currencyStartIndex + j;
      // Skip if this column is the Overall Exposure column
      if (colIndex === overallExposureIndex) {
        values[CURRENCIES[j]] = null;
        continue;
      }
      // Skip if this column is in the "Others" range
      if (colIndex >= othersStartIndex && colIndex < othersStartIndex + 3) {
        values[CURRENCIES[j]] = "0";
        continue;
      }
      if (colIndex < row.length) {
        const value = parseFloat(row[colIndex]).toFixed(2);
        if (!isNaN(value) && value !== 0) {
          values[CURRENCIES[j]] = value;
        } else {
          values[CURRENCIES[j]] = "0";
        }
      } else {
        values[CURRENCIES[j]] = "0";
      }
    }

    // 2. Extract "Others in Single Currency" columns (OTHER1, OTHER2, OTHER3)
    // These are at positions othersStartIndex, othersStartIndex+1, othersStartIndex+2
    const otherColumns = ["OTHER1", "OTHER2", "OTHER3"];
    for (let j = 0; j < otherColumns.length; j++) {
      const colIndex = othersStartIndex + j;
      // Skip if this column is the Overall Exposure column
      if (colIndex === overallExposureIndex) {
        values[otherColumns[j]] = null;
        continue;
      }
      if (colIndex < row.length) {
        const value = parseFloat(row[colIndex]).toFixed(2);
        if (!isNaN(value) && value !== 0) {
          values[otherColumns[j]] = value;
        } else {
          values[otherColumns[j]] = "0";
        }
      } else {
        values[otherColumns[j]] = "0";
      }
    }

    // 3. Extract "Overall Exposure" - ONLY from the Overall Exposure column
    if (overallExposureIndex !== -1 && overallExposureIndex < row.length) {
      const overallValue = parseFloat(row[overallExposureIndex]).toFixed(2);
      if (!isNaN(overallValue) && overallValue !== 0) {
        values.OVERALL_EXPOSURE = overallValue;
      } else {
        values.OVERALL_EXPOSURE = null;
      }
    } else {
      values.OVERALL_EXPOSURE = null;
    }

    // Determine the level based on S/No format
    const parts = sNo.split(".");
    const level = parts.length;

    console.log(`Row ${i}: S/No=${sNo}, Label=${label}, Level=${level}`);

    const entry = {
      id: sNo,
      sNo: sNo,
      label: label,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      children: [],
    };

    nodeMap.set(sNo, entry);
  }

  // Handle total rows without S/No
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] || "").trim();
    const label = String(row[1] || "").trim();

    if (
      !sNo &&
      label &&
      (label.includes("Total Foreign Assets") ||
        label.includes("Total Foreign Liabilities"))
    ) {
      const values = {};

      // 1. Extract 17 currency values
      for (let j = 0; j < CURRENCIES.length; j++) {
        const colIndex = currencyStartIndex + j;
        if (colIndex === overallExposureIndex) {
          values[CURRENCIES[j]] = null;
          continue;
        }
        if (colIndex >= othersStartIndex && colIndex < othersStartIndex + 3) {
          values[CURRENCIES[j]] = "0";
          continue;
        }
        if (colIndex < row.length) {
          const value = parseFloat(row[colIndex]).toFixed(2);

          if (!isNaN(value) && value !== 0) {
            values[CURRENCIES[j]] = value;
          } else {
            values[CURRENCIES[j]] = "0";
          }
        } else {
          values[CURRENCIES[j]] = "0";
        }
      }

      // 2. Extract Others columns
      const otherColumns = ["OTHER1", "OTHER2", "OTHER3"];
      for (let j = 0; j < otherColumns.length; j++) {
        const colIndex = othersStartIndex + j;
        if (colIndex === overallExposureIndex) {
          values[otherColumns[j]] = null;
          continue;
        }
        if (colIndex < row.length) {
          const value = parseFloat(row[colIndex]).toFixed(2);
          if (!isNaN(value) && value !== 0) {
            values[otherColumns[j]] = value;
          } else {
            values[otherColumns[j]] = "0";
          }
        } else {
          values[otherColumns[j]] = "0";
        }
      }

      // 3. Extract Overall Exposure
      if (overallExposureIndex !== -1 && overallExposureIndex < row.length) {
        const overallValue = parseFloat(row[overallExposureIndex]).toFixed(2);
        if (!isNaN(overallValue) && overallValue !== 0) {
          values.OVERALL_EXPOSURE = overallValue;
        } else {
          values.OVERALL_EXPOSURE = null;
        }
      } else {
        values.OVERALL_EXPOSURE = null;
      }

      // const entryId = label.includes('Assets') ? 'total-assets' : 'total-liabilities';
      const entry = {
        id: "",
        sNo: "",
        label: label,
        values: values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: true,
        isSectionHeader: false,
        children: [],
      };

      const parentId = label.includes("Assets") ? "1" : "2";
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(entry);
        console.log(`Added total row "${label}" to parent "${parentId}"`);
      } else {
        nodeMap.set(entry.id, entry);
      }
    }
  }

  // Handle special rows: 8.1 to 8.6 - these only have Overall Exposure
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] || "").trim();
    const label = String(row[1] || "").trim();

    if (sNo && sNo.startsWith("8.") && label) {
      const parts = sNo.split(".");
      if (parts.length === 2) {
        const values = {};

        // All currency values are null
        for (let j = 0; j < CURRENCIES.length; j++) {
          values[CURRENCIES[j]] = null;
        }

        // OTHER1, OTHER2, OTHER3 are null
        values["OTHER1"] = null;
        values["OTHER2"] = null;
        values["OTHER3"] = null;

        // Get the Overall Exposure value
        if (overallExposureIndex !== -1 && overallExposureIndex < row.length) {
          const overallValue = parseFloat(row[overallExposureIndex]).toFixed(2);
          if (!isNaN(overallValue) && overallValue !== 0) {
            values.OVERALL_EXPOSURE = overallValue;
          } else {
            values.OVERALL_EXPOSURE = null;
          }
        } else {
          values.OVERALL_EXPOSURE = null;
        }

        const entry = {
          id: sNo,
          sNo: sNo,
          label: label,
          values: values,
          rowNumber: i + 1,
          level: 2,
          isTotalRow: false,
          isSectionHeader: false,
          children: [],
        };

        // if (!nodeMap.has(sNo)) {
        //   nodeMap.set(sNo, entry);
        //   console.log(`Added special node ${sNo}: ${label} with OVERALL_EXPOSURE:`, values.OVERALL_EXPOSURE);
        // }
      }
    }
  }

  // Handle row 8 itself
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] || "").trim();
    const label = String(row[1] || "").trim();

    if (sNo === "8" && label) {
      const values = {};

      for (let j = 0; j < CURRENCIES.length; j++) {
        values[CURRENCIES[j]] = null;
      }

      values["OTHER1"] = null;
      values["OTHER2"] = null;
      values["OTHER3"] = null;
      values.OVERALL_EXPOSURE = null;

      const entry = {
        id: "8",
        sNo: "8",
        label: label,
        values: values,
        rowNumber: i + 1,
        level: 1,
        isTotalRow: false,
        isSectionHeader: true,
        children: [],
      };

      // if (!nodeMap.has('8')) {
      //   nodeMap.set('8', entry);
      //   console.log(`Added section node 8: ${label}`);
      // }
    }
  }

  // Build the hierarchy
  for (const [sNo, node] of nodeMap) {
    if (
      node.isTotalRow &&
      node.id !== "total-assets" &&
      node.id !== "total-liabilities"
    ) {
      continue;
    }

    const parts = sNo.split(".");

    if (parts.length === 1) {
      topLevelNodes.push(node);
      console.log(`Added top-level node: ${sNo} - ${node.label}`);
    } else if (parts.length > 1) {
      const parentSNo = parts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentSNo);

      if (parent) {
        const exists = parent.children.some((child) => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          console.log(`Added node ${sNo} as child of ${parentSNo}`);
        }
      } else {
        const baseSNo = parts[0];
        const baseParent = nodeMap.get(baseSNo);
        if (baseParent) {
          const exists = baseParent.children.some(
            (child) => child.id === node.id,
          );
          if (!exists) {
            baseParent.children.push(node);
            console.log(`Added node ${sNo} as child of ${baseSNo} (fallback)`);
          }
        } else {
          topLevelNodes.push(node);
          console.log(`Added node ${sNo} as top-level (no parent found)`);
        }
      }
    }
  }

  // Sort children by S/No
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      if (a.isTotalRow && !b.isTotalRow) return 1;
      if (!a.isTotalRow && b.isTotalRow) return -1;

      if (a.sNo && b.sNo) {
        const aParts = a.sNo.split(".").map(Number);
        const bParts = b.sNo.split(".").map(Number);

        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
          }
        }
        return aParts.length - bParts.length;
      }

      if (a.sNo && !b.sNo) return -1;
      if (!a.sNo && b.sNo) return 1;

      return 0;
    });

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(topLevelNodes);

  // Clean up - remove empty children arrays
  const cleanData = (nodes) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  console.log("Final top-level nodes:", topLevelNodes.length);
  console.log(
    "Top-level nodes:",
    topLevelNodes.map((n) => n.sNo + " - " + n.label),
  );

  // return topLevelNodes;

  return {
    hierarchicalData: topLevelNodes,
    columns: CURRENCIES,
    additionalColumns: ["OTHER1", "OTHER2", "OTHER3", "OVERALL_EXPOSURE"],
    noandtitles:noandtitles
  };
};

export default extractForexData