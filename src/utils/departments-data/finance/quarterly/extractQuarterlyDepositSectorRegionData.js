import { excelDateToISO } from "../../../utils";

const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_");
};

export const extractQuarterlyDepositSectorRegionMetadata = (data) => {
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
    const eleventhCell = String(row[10] || "").trim();


    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("DEP_SEC&REG_DS003")) {
        metadata.reportType = "finance-quarterly_deposit-sector";
        metadata.reportTypeId = "finance-quarterly_deposit-sector";
        metadata.departmentId = "finance";
        metadata.departmentName = "Finance";
      }
    }

    if (i === 3 && (firstCell || secondCell)) {
      metadata.reportTitle = firstCell || secondCell;
    }

    if (
      i === 7 &&
      (firstCell || secondCell) &&
      (firstCell.includes("Instiution") || secondCell.includes("Institution"))
    ) {
      metadata.institutionCode = thirdCell || "";
    }

    if (
      i === 8 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || "";
    }

    if (
      i === 9 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
      metadata.startDate = excelDateToISO(thirdCell) || "";
    }

    if (
      i === 10 &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
    }

    if (i === 12 && eleventhCell) {
      metadata.unit = eleventhCell;
    }
  }

  return metadata;
};

export const extractQuarterlyDepositSectorRegionData = (data) => {
  let dataTableStart = -1;
  let noandtitles = [];

  if (data[13]) {
    noandtitles = [
      String(data[13][0] || "").trim(),
      String(data[13][1] || "").trim(),
    ];
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || "").trim();
    if (firstCell === "Code" || firstCell === "1" || firstCell === "1.") {
      dataTableStart = firstCell === "Code" ? i + 1 : i;
      break;
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: [], additionalColumns: [], noandtitles: [] };
  }

  const depositCategories = [
    "Pub_Enterprise",
    "Private_Coop",
    "Regional_Gov",
    "Banks",
    "Others",
    "Total",
  ];

  const topLevelNodes = [];
  const nodeMap = new Map();
  const uncodedSubNodes = []; 
  let currentRegionCode = null;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const rawCode = String(row[0] || "").trim();
    const label = String(row[1] || "").trim();

    if (!label) continue;

    if (
      rawCode.toUpperCase().includes("NOTE") ||
      label.toUpperCase().includes("NOTE") ||
      label.includes("Central Ethiopia Regional State") ||
      label.includes("South Ethiopia Regional State")
    ) {
      break;
    }

    let cleanedCode = rawCode.replace(/[^\d.]/g, "").replace(/\.$/, "");
    const isTotalRow = label.toLowerCase().includes("total deposits");

    if (isTotalRow) {
      cleanedCode = "";
    }

    if (cleanedCode && !cleanedCode.includes(".")) {
      currentRegionCode = cleanedCode;
    }

    const isSectionHeader = cleanedCode && !cleanedCode.includes(".");
    const level = cleanedCode ? cleanedCode.split(".").length : 1;

    const values = {};
    for (let j = 0; j < depositCategories.length; j++) {
      const amountIdx = 2 + j * 3;
      const depositorsIdx = 3 + j * 3;
      const accountsIdx = 4 + j * 3;

      const amtKey = sanitizeKey(`${depositCategories[j]}_Amount`);
      const depKey = sanitizeKey(`${depositCategories[j]}_Depositors`);
      const accKey = sanitizeKey(`${depositCategories[j]}_Accounts`);

      const parseVal = (val, dec = 2) => {
        const parsed = parseFloat(val);
        return !isNaN(parsed) && parsed !== 0 ? parsed.toFixed(dec) : "0";
      };

      values[amtKey] = parseVal(row[amountIdx], 2);
      values[depKey] = parseVal(row[depositorsIdx], 0);
      values[accKey] = parseVal(row[accountsIdx], 0);
    }

    const entry = {
      id: cleanedCode || "",
      sNo: cleanedCode || "",
      code: cleanedCode || "",
      key: cleanedCode || "",
      displayCode: cleanedCode || "",
      label: label,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow,
      isSectionHeader: isSectionHeader || false,
      children: [],
    };

    if (cleanedCode) {
      nodeMap.set(cleanedCode, entry);
    } else if (isTotalRow) {
      topLevelNodes.push(entry);
    } else if (currentRegionCode) {

      uncodedSubNodes.push({ parentRegionCode: currentRegionCode, node: entry });
    }

    if (isTotalRow) {
      break;
    }
  }

  const regionNodes = [];
  for (const [code, node] of nodeMap) {
    const codeParts = code.split(".");

    if (codeParts.length === 1) {
      regionNodes.push(node);
    } else {
      const parentCode = codeParts.slice(0, -1).join(".");
      const parent = nodeMap.get(parentCode);

      if (parent) {
        parent.children.push(node);
      } else {
        regionNodes.push(node);
      }
    }
  }

  for (const { parentRegionCode, node } of uncodedSubNodes) {
    const parentRegion = nodeMap.get(parentRegionCode);
    if (parentRegion) {
      parentRegion.children.push(node);
    }
  }

  const finalHierarchy = [...regionNodes, ...topLevelNodes];

  const processHierarchy = (nodes) => {
    nodes.forEach((node) => {
      if (node.children.length === 0) {
        delete node.children;
      } else {
        processHierarchy(node.children);
      }
    });
  };

  processHierarchy(finalHierarchy);

  const columnNames = [];
  for (const category of depositCategories) {
    columnNames.push(sanitizeKey(`${category}_Amount`));
    columnNames.push(sanitizeKey(`${category}_Depositors`));
    columnNames.push(sanitizeKey(`${category}_Accounts`));
  }

  return {
    hierarchicalData: finalHierarchy,
    columns: columnNames,
    additionalColumns: [],
    noandtitles,
  };
};

export default extractQuarterlyDepositSectorRegionData;