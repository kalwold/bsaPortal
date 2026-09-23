import { excelDateToISO } from "../../../utils";

/**
 * Sanitize a key so it never contains dots or other special characters.
 * Same approach used in extractConventionalLoanSectorRegionData.
 */
const sanitizeKey = (text) => {
  return String(text || "")
    .trim()
    .replace(/\./g, "_")          // dots → underscores first
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_");
};

/**
 * Extract metadata from BSA Report on Manpower Structure
 */
export const extractManpowerStructureMetadata = (data) => {
  const metadata = {
    reportTitle: "",
    ReturnKey: "",
    institutionCode: "",
    financialYear: "",
    startDate: "",
    endDate: "",
    reportType: "",
    reportTypeId: "",
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

    // First row - Return Key / Report Type
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell.replace(/\s+/g, "");

      if (
        firstCell.includes("mp_") ||
        firstCell.includes("MP_") ||
        firstCell.toLowerCase().includes("manpower")
      ) {
        metadata.reportType = "hr-quarterly_manpower-structure";
        metadata.reportTypeId = "hr-quarterly_manpower-structure";
        metadata.departmentId = "hr";
        metadata.departmentName = "Human Resource";
      }
    }

    // Report title
    if (i === 2 && firstCell) {
      metadata.reportTitle = firstCell || "BSA Report on Manpower Structure";
    }

    // Institution
    if (
      i === 3 &&
      firstCell &&
      (firstCell.includes("Instiution") || firstCell.includes("Institution"))
    ) {
      metadata.institutionCode = secondCell || thirdCell || "";
    }

    // Financial Year
    if (i === 4 && firstCell && firstCell.includes("Financial Year")) {
      metadata.financialYear = secondCell || thirdCell || "";
    }

    // Start Date
    if (i === 5 && firstCell && firstCell.includes("Start Date")) {
      metadata.startDate =
        excelDateToISO(secondCell || thirdCell) || secondCell || "";
    }

    // End Date
    if (i === 6 && firstCell && firstCell.includes("End Date")) {
      metadata.endDate =
        excelDateToISO(secondCell || thirdCell) || secondCell || "";
    }

    // Unit
    if (
      firstCell.toLowerCase().includes("in figures") ||
      secondCell.toLowerCase().includes("in figures")
    ) {
      metadata.unit = "In figures";
    }
  }

  // Default values
  if (!metadata.reportTitle) {
    metadata.reportTitle = "BSA Report on Manpower Structure";
  }

  if (!metadata.reportType) {
    metadata.reportType = "hr-quarterly_manpower-structure";
    metadata.reportTypeId = "hr-quarterly_manpower-structure";
    metadata.departmentId = "hr";
    metadata.departmentName = "Human Resource";
  }

  if (!metadata.unit) {
    metadata.unit = "In figures";
  }

  return metadata;
};

/**
 * Extract hierarchical data from BSA Report on Manpower Structure
 */
const extractManpowerStructureData = (data) => {
  let dataTableStart = -1;

  // ---------------------------------------------------------
  // Find table header
  // ---------------------------------------------------------
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (!row || row.length === 0) continue;

    const first = String(row[0] || "").trim().toLowerCase();
    const second = String(row[1] || "").trim().toLowerCase();

    const isNoHeader =
      first === "no" ||
      first === "s/no" ||
      first === "s.no" ||
      first === "sno" ||
      first === "s no";

    const isRegionHeader =
      second === "region" ||
      second.includes("region") ||
      second === "particulars" ||
      second.includes("particular");

    if (isNoHeader && isRegionHeader) {
      dataTableStart = i + 1;
      break;
    }
  }

  // ---------------------------------------------------------
  // Fallback: find first Addis row
  // ---------------------------------------------------------
  if (dataTableStart === -1) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row) continue;

      const code = String(row[0] || "").trim();
      const region = String(row[1] || "").trim();

      if (code === "1" && region.toLowerCase().includes("addis")) {
        dataTableStart = i;
        break;
      }
    }
  }

  // ---------------------------------------------------------
  // Table not found
  // ---------------------------------------------------------
  if (dataTableStart === -1) {
    console.warn("Manpower Structure: could not find data table");

    return {
      hierarchicalData: [],
      columns: [],
      additionalColumns: [],
      rowHeaders: {
        sNo: "No",
        label: "Region",
      },
    };
  }

  // ---------------------------------------------------------
  // Value columns
  //
  // IMPORTANT:
  // The `key` values DO NOT contain dots (sanitized).
  // The original dotted names are preserved in `label`
  // in case they are needed for display.
  // ---------------------------------------------------------
  const valueColumns = [
    {
      key: sanitizeKey("Employed_During_Quarter_Permanent.Male"),
      label: "Employed_During_Quarter_Permanent.Male",
      index: 2,
    },
    {
      key: sanitizeKey("Employed_During_Quarter_Permanent.Female"),
      label: "Employed_During_Quarter_Permanent.Female",
      index: 3,
    },
    {
      key: sanitizeKey("Employed_During_Quarter_Permanent.Total"),
      label: "Employed_During_Quarter_Permanent.Total",
      index: 4,
    },
    {
      key: sanitizeKey("Employed_During_Quarter_Temporary.Male"),
      label: "Employed_During_Quarter_Temporary.Male",
      index: 5,
    },
    {
      key: sanitizeKey("Employed_During_Quarter_Temporary.Female"),
      label: "Employed_During_Quarter_Temporary.Female",
      index: 6,
    },
    {
      key: sanitizeKey("Employed_During_Quarter_Temporary.Total"),
      label: "Employed_During_Quarter_Temporary.Total",
      index: 7,
    },
    {
      key: sanitizeKey("Employed_During_Quarter_Temporary.Grand_Total"),
      label: "Employed_During_Quarter_Temporary.Grand_Total",
      index: 8,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Permanent.Male"),
      label: "Total_Banks_Staff_Qurter_End_Permanent.Male",
      index: 9,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Permanent.Female"),
      label: "Total_Banks_Staff_Qurter_End_Permanent.Female",
      index: 10,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Permanent.Total"),
      label: "Total_Banks_Staff_Qurter_End_Permanent.Total",
      index: 11,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Temporary.Male"),
      label: "Total_Banks_Staff_Qurter_End_Temporary.Male",
      index: 12,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Temporary.Female"),
      label: "Total_Banks_Staff_Qurter_End_Temporary.Female",
      index: 13,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Temporary.Total"),
      label: "Total_Banks_Staff_Qurter_End_Temporary.Total",
      index: 14,
    },
    {
      key: sanitizeKey("Total_Banks_Staff_Qurter_End_Temporary.Grand_Total"),
      label: "Total_Banks_Staff_Qurter_End_Temporary.Grand_Total",
      index: 15,
    },
  ];

  const topLevelNodes = [];
  const nodeMap = new Map();

  // ---------------------------------------------------------
  // Extract rows
  // ---------------------------------------------------------
  for (let i = dataTableStart; i < data.length; i++) {
    let row = data[i];

    if (!row || row.length === 0) continue;

    // Make sure there are at least 16 columns
    while (row.length < 16) {
      row.push("");
    }

    let code = String(row[0] || "").trim();
    const region = String(row[1] || "").trim();

    if (!region) continue;

    // Skip notes
    if (
      code.toLowerCase().includes("note") ||
      region.toLowerCase().includes("note")
    ) {
      continue;
    }

    // -------------------------------------------------------
    // Detect Grand Total
    // -------------------------------------------------------
    const isGrandTotal =
      region.toLowerCase().includes("grand total") ||
      region.toLowerCase() === "grandtotal" ||
      region.toLowerCase() === "grand total";

    if (isGrandTotal) {
      code = " ";
    }

    // -------------------------------------------------------
    // Normalize code
    // Example:
    // 1.     -> 1
    // 1.1    -> 1.1
    // -------------------------------------------------------
    let normalizedCode = code;

    if (code.endsWith(".")) {
      normalizedCode = code.slice(0, -1);
    }

    if (!normalizedCode.trim() && !isGrandTotal) {
      continue;
    }

    // -------------------------------------------------------
    // Determine hierarchy level
    // -------------------------------------------------------
    const level = isGrandTotal ? 1 : normalizedCode.split(".").length;

    const isSectionHeader = level === 1 && !isGrandTotal;

    // -------------------------------------------------------
    // Extract values
    // -------------------------------------------------------
    const values = {};

    valueColumns.forEach((column) => {
      let val = "0";

      const raw = row[column.index];

      if (
        raw !== null &&
        raw !== undefined &&
        raw !== "" &&
        raw !== "-"
      ) {
        const cleaned = String(raw).replace(/,/g, "").trim();

        const num = parseFloat(cleaned);

        if (!isNaN(num)) {
          val = Number.isInteger(num) ? String(num) : num.toFixed(2);
        }
      }

      // column.key is already sanitized (no dots)
      values[column.key] = val;
    });

    // -------------------------------------------------------
    // Create entry
    // -------------------------------------------------------
    const entry = {
      id: isGrandTotal ? " " : normalizedCode || "",

      sNo: isGrandTotal ? " " : normalizedCode || "",

      label: region,

      values,

      rowNumber: i + 1,

      level,

      isTotalRow: isGrandTotal,

      isSectionHeader,

      children: [],
    };

    // -------------------------------------------------------
    // Map key
    // -------------------------------------------------------
    const mapKey = isGrandTotal ? "__GRAND_TOTAL__" : entry.id;

    nodeMap.set(mapKey, entry);
  }

  // ---------------------------------------------------------
  // Build hierarchy
  // ---------------------------------------------------------
  for (const [code, node] of nodeMap) {
    // Grand total stays at the top level
    if (node.isTotalRow) {
      topLevelNodes.push(node);
      continue;
    }

    const parts = code.split(".");

    // Top-level node
    if (parts.length === 1) {
      if (!topLevelNodes.find((n) => n.id === code)) {
        topLevelNodes.push(node);
      }
    } else {
      // Example:
      // code = 1.2
      // parentCode = 1
      const parentCode = parts.slice(0, -1).join(".");

      const parent = nodeMap.get(parentCode);

      if (parent) {
        if (!parent.children.some((child) => child.id === node.id)) {
          parent.children.push(node);
        }
      } else {
        // If parent is missing, keep the node at top level
        topLevelNodes.push(node);
      }
    }
  }

  // ---------------------------------------------------------
  // Sort hierarchy
  // ---------------------------------------------------------
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      // Total rows always go last
      if (a.isTotalRow) return 1;
      if (b.isTotalRow) return -1;

      const aParts = (a.sNo || "").split(".").map(Number);
      const bParts = (b.sNo || "").split(".").map(Number);

      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i] - bParts[i];
        }
      }

      return aParts.length - bParts.length;
    });

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortChildren(node.children);
      }
    });
  };

  sortChildren(topLevelNodes);

  // ---------------------------------------------------------
  // Remove empty children arrays
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Return final structure
  // ---------------------------------------------------------
  return {
    hierarchicalData: topLevelNodes,

    // These are safe keys without dots
    columns: valueColumns.map((column) => column.key),

    additionalColumns: [],

    rowHeaders: {
      sNo: "No",
      label: "Region",
    },
  };
};

export default extractManpowerStructureData;