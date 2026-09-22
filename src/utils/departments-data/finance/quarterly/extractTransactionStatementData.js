import { excelDateToISO } from "../../../utils";
export const extractTransactionStatementMetadata = (data) => {
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
    const thirdCell = String(row[2] || "").trim();
    // Label merges differ slightly between templates (some merge the
    // label across A:B, some don't), so the value can land in B, C, D...
    // Scan forward from column B and take the first non-empty cell.
    const labelValue = (() => {
      for (let c = 1; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();

    // DEBUG: print exactly what's in each metadata-relevant row so you
    // can line it up against what the code below expects (row index,
    // Excel row number, full row contents, and which value it picked).
    if (i <= 13) {
      console.log(
        `[metadata] row[${i}] (Excel row ${i + 1}):`, row,
        `| firstCell="${firstCell}" | labelValue picked="${labelValue}"`
      );
    }

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("TRAN_STATQQ001") ) {
        metadata.reportType = "finance-quarterly_transaction-statement";
        metadata.reportTypeId = "finance-quarterly_transaction-statement";
        metadata.departmentId = "finance";
        metadata.departmentName = "Finance";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 7 &&
      firstCell &&
      (firstCell.toLowerCase().includes("instiution") ||
        firstCell.toLowerCase().includes("institution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    if (
      i === 8 &&
      firstCell &&
      firstCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    if (
      i === 9 &&
      firstCell &&
      firstCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (
      i === 10 &&
      firstCell &&
      firstCell.toLowerCase().includes("end date")
    ) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    if (i === 12) {
      const unitCell = row.find(
        (c) => c && String(c).toLowerCase().includes("million")
      );
      if (unitCell) metadata.unit = String(unitCell).trim();
    }
  }
  return metadata;
};
const extractTransactionStatementData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let noandtitles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "Code") {
      const secondCell = String(row[1] || "").trim();
      noandtitles = [firstCell, secondCell];
      break;
    }
  }
  // Find the data table start - look for "Code" in column A
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], currencies: [], additionalColumns: [] };
  }

  // Column indices (0-based)
  const LEFT_CODE = 0;
  const LEFT_DESC = 1;
  const LEFT_OS = 2;
  const LEFT_MATURITY = 3;
  const RIGHT_CODE = 4;
  const RIGHT_DESC = 5;
  const RIGHT_OS = 6;
  const RIGHT_MATURITY = 7;
  const NET = 8;

  const columns = [
    'O_S_Balance_Made',
    'Maturity_Made',
    'O_S_Balance_Taken',
    'Maturity_Taken',
    'NET'
  ];

  const topLevelNodes = [];
  const nodeMap = new Map();

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const leftCode = String(row[LEFT_CODE] || '').trim();
    const leftDesc = String(row[LEFT_DESC] || '').trim();
    const rightCode = String(row[RIGHT_CODE] || '').trim();
    const rightDesc = String(row[RIGHT_DESC] || '').trim();

    // Skip if both sides are empty
    if (!leftCode && !leftDesc && !rightCode && !rightDesc) continue;

    // Helper functions
    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const raw = row[index];
        // Handle empty/null
        if (raw === null || raw === undefined || raw === '') return '0';
        // Handle numeric strings and numbers
        const val = parseFloat(raw);
        if (!isNaN(val)) {
          return val.toFixed(2);
        }
        // If it's a string (not a number), return it as-is
        return String(raw).trim();
      }
      return '0';
    };

    const getStringValue = (index) => {
      if (index !== undefined && index < row.length) {
        return String(row[index] || '').trim();
      }
      return '';
    };

    // Extract values - use getValue for numeric fields and getStringValue for text fields
    const values = {
      'O_S_Balance_Made': getValue(LEFT_OS),
      'Maturity_Made': getStringValue(LEFT_MATURITY),
      'O_S_Balance_Taken': getValue(RIGHT_OS),
      'Maturity_Taken': getStringValue(RIGHT_MATURITY),
      'NET': getValue(NET)
    };

    // Determine level based on code depth
    let level = 0;
    let codeForLevel = leftCode || rightCode;
    if (codeForLevel) {
      const codeParts = codeForLevel.split('.');
      level = codeParts.length;
    }

    // Check if this is a total row
    const isTotalRow = leftDesc.includes('Total') || rightDesc.includes('Total');

    // Check if this is a section header (like "DEPOSITS", "LOANS", "INVESTMENT")
    const isSectionHeader = (level === 1 && leftDesc && leftDesc === leftDesc.toUpperCase() && !leftDesc.includes('.')) ||
                            (level === 1 && rightDesc && rightDesc === rightDesc.toUpperCase());

    // Build a combined label
    let combinedLabel = '';
    if (leftDesc && rightDesc) {
      combinedLabel = `${leftDesc} | ${rightDesc}`;
    } else if (leftDesc) {
      combinedLabel = leftDesc;
    } else if (rightDesc) {
      combinedLabel = rightDesc;
    }

    const primaryCode = leftCode || rightCode;

    const entry = {
      id: primaryCode || `row-${i}`,
      sNo: primaryCode || '',
      label: combinedLabel,
      values: values,
      leftCode: leftCode,
      leftDescription: leftDesc,
      rightCode: rightCode,
      rightDescription: rightDesc,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      children: []
    };

    if (primaryCode) {
      nodeMap.set(primaryCode, entry);
    }

    // Add to top level or as child based on level
    if (level <= 1) {
      topLevelNodes.push(entry);
    }
  }

  // Build hierarchy
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length <= 1) {
      continue;
    } else {
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
        } else {
          topLevelNodes.push(node);
        }
      }
    }
  }

  // Remove duplicates
  const uniqueTopLevel = [];
  const addedIds = new Set();
  for (const node of topLevelNodes) {
    if (!addedIds.has(node.id)) {
      addedIds.add(node.id);
      uniqueTopLevel.push(node);
    }
  }

  // Sort children by code
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      if (a.isTotalRow && !b.isTotalRow) return 1;
      if (!a.isTotalRow && b.isTotalRow) return -1;
      
      const aCode = a.sNo || a.leftCode || a.rightCode;
      const bCode = b.sNo || b.leftCode || b.rightCode;
      
      if (aCode && bCode) {
        const aParts = aCode.split('.').map(Number);
        const bParts = bCode.split('.').map(Number);
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

  sortChildren(uniqueTopLevel);

  // Clean up
  const cleanData = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(uniqueTopLevel);

  console.log('Total top-level entries:', uniqueTopLevel.length);

  return {
    hierarchicalData: uniqueTopLevel,
    columns: columns,
    additionalColumns: []
  };
};
export default extractTransactionStatementData