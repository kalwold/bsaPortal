import { excelDateToISO } from "./excelParser";

export const extractLoanSectorRegionQuarterlyMetadata = (data) => {
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

      if (firstCell.includes("LOAN_SEC&REG_SE002") || firstCell.includes("SE002")) {
        metadata.reportType = "credit-quarterly_sector-region";
        metadata.reportTypeId = "credit-quarterly_sector-region";
        metadata.departmentId = "credit";
        metadata.departmentName = "Credit";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell || "";
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

const extractLoanSectorRegionQuarterlyData = (data) => {
  let dataTableStart = -1;
  let noandtitles = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
    }
  }

  const sanitizeKey = (text) =>
    text
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .replace(/_+/g, "_");

  // Find the data table start - look for "Code" column (2-row header, like SE002's layout)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "Code") {
      dataTableStart = i + 2;
      break;
    }
  }

  console.log('[SE002] "Code" header found, data expected to start at row index:', dataTableStart,
    dataTableStart === -1 ? '(NOT FOUND — check that a cell in column A literally reads "Code")' : `(Excel row ${dataTableStart + 1})`);

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles };
  }

  // Groups: Public Enterprise, Private & Coop., Regional Gov't, Banks, Others*, Total
  // Each group has 3 sub-columns: Amount, # of Borrowers, # of Accounts
  const sectorGroups = [
    "Public_Enterprise",
    "Private_Coop",
    "Regional_Govt",
    "Banks",
    "Others",
    "Total",
  ];

  const topLevelNodes = [];
  const nodeMap = new Map();

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || "").trim();
    const region = String(row[1] || "").trim();

    if (!region) {
      if (i < dataTableStart + 30) console.log(`[SE002] row[${i}] (Excel row ${i + 1}) skipped — no region/label:`, row);
      continue;
    }
    if (
      code.toLowerCase().includes("note") ||
      region.toLowerCase().includes("note") ||
      region.includes("Central Ethiopia Regional State") ||
      region.includes("South Ethiopia Regional State")
    ) {
      console.log(`[SE002] row[${i}] (Excel row ${i + 1}) skipped — note/footer row: code="${code}", region="${region}"`);
      continue;
    }
    if (i < dataTableStart + 30) {
      console.log(`[SE002] row[${i}] (Excel row ${i + 1}) included — code="${code}", region="${region}"`);
    }

    const normalizedCode = code === "2." ? "2" : code;
    const isSectionHeader = normalizedCode && !normalizedCode.includes(".");
    const level = normalizedCode ? normalizedCode.split(".").length : 0;
    const isTotalRow = region.toLowerCase().includes("total");

    const values = {};
    for (let j = 0; j < sectorGroups.length; j++) {
      const amountIndex = 2 + j * 3;
      const borrowersIndex = 3 + j * 3;
      const accountIndex = 4 + j * 3;

      const amountKey = sanitizeKey(`${sectorGroups[j]}_Amount`);
      const borrowersKey = sanitizeKey(`${sectorGroups[j]}_Borrowers`);
      const accountKey = sanitizeKey(`${sectorGroups[j]}_Accounts`);

      const getNum = (idx) => {
        if (idx < row.length) {
          const val = parseFloat(row[idx]);
          if (!isNaN(val) && val !== 0) return val;
        }
        return 0;
      };

      values[amountKey] = getNum(amountIndex).toFixed(2);
      values[borrowersKey] = getNum(borrowersIndex).toFixed(0);
      values[accountKey] = getNum(accountIndex).toFixed(0);
    }

    const entry = {
      id: normalizedCode || `row-${i}`,
      sNo: normalizedCode || "",
      label: region,
      values,
      rowNumber: i + 1,
      level,
      isTotalRow,
      isSectionHeader: isSectionHeader || false,
      children: [],
    };

    if (normalizedCode) nodeMap.set(normalizedCode, entry);
  }

  for (const [normalizedCode, node] of nodeMap) {
    const codeParts = normalizedCode.split(".");
    if (codeParts.length === 1) {
      if (!topLevelNodes.find((n) => n.id === normalizedCode)) {
        topLevelNodes.push(node);
      }
    } else {
      const parentCode = codeParts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentCode) || nodeMap.get(codeParts[0]);
      if (parent) {
        if (!parent.children.some((c) => c.id === node.id)) {
          parent.children.push(node);
        }
      } else {
        topLevelNodes.push(node);
      }
    }
  }

  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      if (a.isTotalRow && !b.isTotalRow) return 1;
      if (!a.isTotalRow && b.isTotalRow) return -1;
      if (a.sNo && b.sNo) {
        const aParts = a.sNo.split(".").map(Number);
        const bParts = b.sNo.split(".").map(Number);
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
        }
        return aParts.length - bParts.length;
      }
      return 0;
    });
    nodes.forEach((n) => n.children && n.children.length && sortChildren(n.children));
  };
  sortChildren(topLevelNodes);

  const cleanData = (nodes) => {
    nodes.forEach((n) => {
      if (n.children && n.children.length === 0) delete n.children;
      else if (n.children) cleanData(n.children);
    });
  };
  cleanData(topLevelNodes);

  const columnNames = [];
  for (const group of sectorGroups) {
    columnNames.push(sanitizeKey(`${group}_Amount`));
    columnNames.push(sanitizeKey(`${group}_Borrowers`));
    columnNames.push(sanitizeKey(`${group}_Accounts`));
  }

  return {
    hierarchicalData: topLevelNodes,
    columns: columnNames,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractLoanSectorRegionQuarterlyData;
