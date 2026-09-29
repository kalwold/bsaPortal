import { excelDateToISO } from "../../../utils";

export const extractQuarterlyMaturityOfAssetsLiabilitiesMetadata = (data) => {
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
    const unitCell = String(row[7] || "").trim(); // column H carries "(In Millions of Birr)"

    // Row 1: return key / report identifier
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("NBE_MAT_ANL_MA001")) {
        metadata.reportType = "finance-quarterly_maturity-asset-liability";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
        metadata.reportTypeId = "finance-quarterly_maturity-asset-liability";
      }
    }

    // Row 4: report title ("Maturity of Assets & Liabilities")
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

    // Row 14: unit note, e.g. "(In Millions of Birr)"
    if (i === 13 && unitCell && unitCell.toLowerCase().includes("in")) {
      metadata.unit = unitCell;
    }
  }

  return metadata;
};

const extractQuarterlyMaturityOfAssetsLiabilitiesData = (data) => {
  let dataTableStart = -1;
  let headerRowIndex = -1;

  // Find the header row: "Code" | "Time bands" | ...time-band columns... | "Total"
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    if (firstCell === "Code" && secondCell.toLowerCase().includes("time band")) {
      headerRowIndex = i;
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Build the value columns dynamically from the header row (Amount, 1 day, 2-7 days, ..., Total)
  const headerRow = data[headerRowIndex];
  const columns = [];
  const columnIndexes = [];
  for (let c = 2; c < headerRow.length; c++) {
    const label = String(headerRow[c] || "").trim();
    if (!label) continue;
    columns.push(label.replace(/\s+/g, "_"));
    columnIndexes.push(c);
  }

  const nodeMap = new Map();
  const topLevelNodes = [];
  let assetsNode = null;
  let liabilitiesNode = null;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || "").trim();
    const description = String(row[1] || "").trim();
    if (!description) continue;

    const isAssetsSection = description === "ASSETS";
    const isLiabilitiesSection = description.toUpperCase().startsWith("LIABILITIES");
    const isTotalRow = description.trim().toUpperCase() === "TOTAL";
    const isMismatchRow = description.toUpperCase().includes("MISMATCH");
   
    const values = {};
    columnIndexes.forEach((colIdx, idx) => {
      const raw = parseFloat(row[colIdx]);
      values[columns[idx]] = !isNaN(raw) ? raw.toFixed(2) : "0";
    });

    const codeParts = code ? code.split(".") : [];
    const level = codeParts.length;

    const entry = {
      id: code || "",
      sNo: code || "",
      label: description,
      values,
      rowNumber: i + 1,
      level,
      isTotalRow: isTotalRow || isMismatchRow,
      isSectionHeader: isAssetsSection || isLiabilitiesSection,
      isAssetsSection,
      isLiabilitiesSection,
      children: [],
    };

    if (code) {
      nodeMap.set(code, entry);
    }

    if (isAssetsSection) {
      topLevelNodes.push(entry);
      assetsNode = entry;
    } else if (isLiabilitiesSection) {
      topLevelNodes.push(entry);
      liabilitiesNode = entry;
    } 
  }

  // Nest coded rows: 1.x under ASSETS(1), 2.x under LIABILITIES(2), n.n.n under its parent code
  for (const [code, node] of nodeMap) {
    const codeParts = code.split(".");

    if (codeParts.length === 1) {
      const codeNum = parseInt(codeParts[0], 10);
      const parentSection = codeNum === 1 ? assetsNode : codeNum === 2 ? liabilitiesNode : null;
      if (parentSection && parentSection !== node) {
        if (!parentSection.children.some((c) => c.id === code)) {
          parentSection.children.push(node);
        }
      }
    } else {
      const parentCode = codeParts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentCode);
      if (parent) {
        if (!parent.children.some((c) => c.id === node.id)) {
          parent.children.push(node);
        }
      }
    }
  }

  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      const aParts = (a.sNo || "").split(".").map(Number);
      const bParts = (b.sNo || "").split(".").map(Number);
      for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) return aParts[i] - bParts[i];
      }
      return aParts.length - bParts.length;
    });
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) sortChildren(node.children);
    });
  };
  sortChildren(topLevelNodes);

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

  return { hierarchicalData: topLevelNodes, columns, additionalColumns: [] };
};

export default extractQuarterlyMaturityOfAssetsLiabilitiesData;
