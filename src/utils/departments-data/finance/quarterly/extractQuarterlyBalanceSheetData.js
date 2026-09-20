import { excelDateToISO } from "../../../utils";

export const extractQuarterlyBalanceSheetMetadata = (data) => {
  const metadata = {
    reportTitle: "",
    ReturnKey: "",
    institutionCode: "",
    financialYear: "",
    startDate: "",
    endDate: "",
    reportType: "",
    unit: "",
    departmentName: "",
    departmentId: "",
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();

    // Row 1: return key / report identifier
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("BAL_SHEET_BS001")) {
        metadata.reportType = "finance-monthly_balance-sheet";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
        metadata.reportTypeId = "finance-monthly_balance-sheet";
      }
    }

    // Row 4: report title ("Quarterly Balance Sheet")
    if (i === 3 && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || "";
    }

    // Row 8: Institution code
    if (
      i === 7 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Instiution")
    ) {
      metadata.institutionCode = thirdCell || "";
    }

    // Row 9: Financial Year
    if (
      i === 8 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || "";
    }

    // Row 10: Start Date
    if (
      i === 9 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
      metadata.startDate = excelDateToISO(thirdCell) || "";
    }

    // Row 11: End Date
    if (
      i === 10 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
    }

    // Row 13: unit note, e.g. "In Millions of ETB"
    if (i === 12 && thirdCell && thirdCell.toLowerCase().includes("in")) {
      metadata.unit = thirdCell;
    }
  }

  return metadata;
};

const extractQuarterlyBalanceSheetData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      // header row is now correctly row 14 (i === 13): "Code" | "Description"
      noandtitles = [firstCell, secondCell];
    }
  }

  // Find the data table start (unchanged — already searches by text, not row index)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    if (firstCell === 'Code' || secondCell === 'Description') {
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === 'ASSETS') {
        dataTableStart = i + 1;
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: ['Current_Month'], additionalColumns: [] };
  }

  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;
  let assetsNode = null;
  let liabilitiesNode = null;

  // Find value column
  let valueColumnIndex = -1;
  const headerRow = data[dataTableStart - 1];
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    if (cell === 'Current Month' || cell === 'Current Month ' || cell.includes('Current')) {
      valueColumnIndex = i;
      break;
    }
  }
  if (valueColumnIndex === -1) valueColumnIndex = 2;

  // Parse the data
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    if (!description) continue;
    if (description.toLowerCase().includes('note:') || description.toLowerCase().includes('the cbe should')) continue;

    // === IDENTIFY SECTION HEADERS ===
    const isAssetsSection = description === 'ASSETS';
    const isLiabilitiesSection = description === 'LIABILITIES & CAPITAL';
    const isSectionHeader = isAssetsSection || isLiabilitiesSection;

    // === IDENTIFY TOTAL ROWS ===
    const isTotalRow = description.includes('TOTAL ASSETS') ||
                       description.includes('TOTAL LIABILITIES AND NET WORTH') ||
                       description.includes('NON-FINANCIAL ASSETS') ||
                       description.includes('TOTAL LIABILITIES');

    // Extract value
    let value = null;
    if (valueColumnIndex < row.length) {
      const raw = row[valueColumnIndex];
       const cleaned = String(raw).replace(/,/g, "").trim();
      const rawValue = parseFloat(cleaned);
      if (!isNaN(rawValue) && rawValue !== 0) {
        value = rawValue;
      }
    }

    // Determine level
    let level = 0;
    if (code && code !== '') {
      const codeParts = code.split('.');
      level = codeParts.length;
    } else if (isSectionHeader) {
      level = 0;
    } else if (isTotalRow) {
      level = 0;
    }

    const entry = {
      id: code || ``,
      sNo: code || '',
      label: description,
      values: {
        'Current_Month': value !== null ? value.toFixed(2) : '0'
      },
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      isAssetsSection: isAssetsSection || false,
      isLiabilitiesSection: isLiabilitiesSection || false,
      children: []
    };

    if (code) {
      nodeMap.set(code, entry);
    }

    // === BUILD HIERARCHY ===
    if (!code) {
      if (isAssetsSection) {
        topLevelNodes.push(entry);
        assetsNode = entry;
        currentParent = entry;
      } else if (isLiabilitiesSection) {
        topLevelNodes.push(entry);
        liabilitiesNode = entry;
        currentParent = entry;
      } else if (isTotalRow) {
        if (description.includes('TOTAL ASSETS') && assetsNode) {
          assetsNode.children.push(entry);
        } else if (description.includes('TOTAL LIABILITIES') && liabilitiesNode) {
          liabilitiesNode.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      } else {
        if (currentParent) {
          currentParent.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      }
    }
  }

  // === BUILD HIERARCHY FOR CODED NODES ===
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');

    if (codeParts.length === 1) {
      const codeNum = parseInt(codeParts[0]);
      let parentSection = null;

      if (codeNum >= 1 && codeNum <= 12) {
        parentSection = assetsNode;
      } else if (codeNum >= 13 && codeNum <= 22) {
        parentSection = liabilitiesNode;
      }

      if (parentSection) {
        const exists = parentSection.children.some(child => child.id === code);
        if (!exists) {
          parentSection.children.push(node);
        }
      } else {
        const existing = topLevelNodes.find(n => n.id === code);
        if (!existing) {
          topLevelNodes.push(node);
        }
      }
    } else if (codeParts.length > 1) {
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);

      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
        }
      } else {
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
          }
        }
      }
    }
  }

  // === SORT CHILDREN ===
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      if ((a.isTotalRow && !b.isTotalRow) && a.label.includes('TOTAL LIABILITIES AND NET WORTH')) return 1;
      if ((!a.isTotalRow && b.isTotalRow) && b.label.includes('TOTAL LIABILITIES AND NET WORTH')) return -1;

      if (a.sNo && b.sNo) {
        const aParts = a.sNo.split('.').map(Number);
        const bParts = b.sNo.split('.').map(Number);
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) {
            return aParts[i] - bParts[i];
          }
        }
        return aParts.length - bParts.length;
      }
      return 0;
    });

    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(topLevelNodes);

  // === CLEAN UP ===
  const cleanData = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Current_Month'],
    additionalColumns: [],
    noandtitles: noandtitles
  };
};

export default extractQuarterlyBalanceSheetData;
