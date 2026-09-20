import { excelDateToISO } from "../../../utils";

export const extractQuarterlyMemorandumAndContingentAccountsMetadata = (data) => {
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

      if (firstCell.includes("MEM&CONT_MM001")) {
        metadata.reportType = "finance-memorandum_contingent";
        metadata.departmentName = "Finance";
        metadata.departmentId = "finance";
        metadata.reportTypeId = "finance-memorandum_contingent";
      }
    }

    // Row 4: report title ("Memorandum and Contingent Accounts")
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

    // Row 13: unit note, e.g. "In Millions of Birr"
    if (i === 12 && thirdCell && thirdCell.toLowerCase().includes("in")) {
      metadata.unit = thirdCell;
    }
  }

  return metadata;
};

const extractQuarterlyMemorandumAndContingentAccountsData = (data) => {
  const columns = ["Amount"];
  let dataTableStart = -1;

  // Find the header row: "S.No." | "Description"
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell.toLowerCase().includes("s.no")) {
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns, additionalColumns: [] };
  }

  const nodeMap = new Map();
  const topLevelNodes = [];

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || "").trim();
    const description = String(row[1] || "").trim();
    if (!description || !code) continue;
    if (description.toLowerCase().includes("note:")) continue;

    const rawValue = parseFloat(row[2]);
    const value = !isNaN(rawValue) ? rawValue.toFixed(2) : "0";

    const codeParts = code.split(".");
    const level = codeParts.length;

    const entry = {
      id: code,
      sNo: code,
      label: description,
      values: { Amount: value },
      rowNumber: i + 1,
      level,
      isTotalRow: false,
      children: [],
    };

    nodeMap.set(code, entry);

    // Top-level items (1, 2, 3, ...) go straight in; sub-items (4.1, 13.2, ...) nest under their parent
    if (codeParts.length === 1) {
      topLevelNodes.push(entry);
    } else {
      const parentCode = codeParts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentCode);
      if (parent) {
        parent.children.push(entry);
      } else {
        topLevelNodes.push(entry);
      }
    }
  }

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

export default extractQuarterlyMemorandumAndContingentAccountsData;
