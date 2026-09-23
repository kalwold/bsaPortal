import * as XLSX from "xlsx";
import { detectReportType } from "./detectReportType";
import { extractReport } from "./reportRegistry";


const readWorkbookRows = (arrayBuffer) => {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
    type: "array",
    cellText: true,
    cellNF: true,
  });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });
};

const buildReport = ({ file, reportType, extracted }) => {
  const { hierarchicalData, columns, additionalColumns, noandtitles, metadata } = extracted;

  return {
    id: `${reportType}-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`,
    departmentId: metadata.departmentId,
    departmentName: metadata.departmentName,
    reportTypeId: reportType,
    reportTypeName: metadata.reportTitle,
    ReturnKey: metadata.ReturnKey,
    fileName: file.name,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    createdBy: "current-user",
    metadata,
    noandtitles,
    columns,
    additionalColumns,
    data: hierarchicalData,
    flatData: flattenData(hierarchicalData),
    validations: [],
    isValid: true,
  };
};

export const parseExcelReport = (file, reportTypeIn) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = readWorkbookRows(e.target.result);
        console.log("Raw Excel Data:", jsonData);

        const reportType = detectReportType(jsonData);
        console.log("Detected report type (from A1):", reportType);

        if (reportTypeIn !== reportType) {
          throw new Error(
            `Selected report type "${reportTypeIn}" does not match the file, which looks like "${reportType}".`
          );
        }

        const extracted = extractReport(reportType, jsonData);
        console.log("Extracted metadata:", extracted.metadata);
        console.log("Extracted columns:", extracted.columns);
        console.log("hierarchicalData (first 5):", extracted.hierarchicalData.slice(0, 5));
        console.log("noandtitles:", extracted.noandtitles);

        resolve(buildReport({ file, reportType, extracted }));
      } catch (error) {
        console.error("Parse error:", error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });



const flattenData = (nodes) => {
  const result = [];
  const traverse = (nodes, parentId = null) => {
    nodes.forEach((node) => {
      const flatNode = {
        id: node.id,
        sNo: node.sNo || "",
        label: node.label,
        values: node.values || {},
        rowNumber: node.rowNumber,
        level: node.level || 0,
        isTotalRow: node.isTotalRow || false,
        parentId: parentId,
      };
      result.push(flatNode);
      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    });
  };
  traverse(nodes);
  return result;
};
