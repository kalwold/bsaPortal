import { excelDateToISO } from "../../../utils";
export const extractNplSectorBranchMetadata = (data) => {
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
    if (row.length === 0) continue;
    const firstCell = String(row[0]).trim();
    const secondCell = String(row[1]).trim();
    const thirdCell = String(row[2]).trim();
    const fourthCell = String(row[3]).trim();
    const nineCell = String(row[9]).trim();
    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("NPL_ECPOM") || firstCell.includes("NE001")) {
        metadata.reportType = "credit-quarterly_loan-npl-ecosec-branch";
        metadata.reportTypeId = "credit-quarterly_loan-npl-ecosec-branch";
        metadata.departmentName = "Credit";
        metadata.departmentId = "credit";
      }
    }

    if (i === 3 && firstCell) {
      metadata.reportTitle = firstCell;
    }
    if (
      i === 7 &&
      (firstCell.includes("Institution") || firstCell.includes("Instiution"))
    ) {
      metadata.institutionCode = thirdCell;
    }
    if (i === 8 && firstCell.includes("Financial Year")) {
      metadata.financialYear = thirdCell;
    }
    if (i === 9 && firstCell.includes("Start Date")) {
      metadata.startDate = excelDateToISO(thirdCell);
    }
    if (i === 10 && firstCell.includes("End Date")) {
      metadata.endDate = excelDateToISO(thirdCell);
    }
    if (i === 12 && (nineCell.includes("in") || nineCell.includes("In"))) {
      metadata.unit = nineCell;
    }
  }

  return metadata;
};

const extractNplSectorBranchData = (data) => {
  let dataTableStart = -1;
  let branchSectionStart = -1;
  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      //console.log("Found title:", noandtitles);
    }
}
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || "").trim();
      if (firstCell === "S.No.") {
        dataTableStart = i + 2; // Skip header rows
        console.log("Found data table at row:", dataTableStart);
        break;
      }
    }

    if (dataTableStart === -1) {
      console.log("Could not find data table");
      return {
        hierarchicalData: [],
        columns: [],
        additionalColumns: [],
        noandtitles,
      };
    }

    // Find the branch section start - look for "II. NPLs by Branch"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const secondCell = String(row[1] || "").trim();
      if (secondCell.includes("II. NPLs by Branch")) {
        branchSectionStart = i + 1;
        console.log("Found branch section at row:", branchSectionStart);
        break;
      }
    }

    const columns = [
      "Substandard-Term_loan",
      "Substandard-O_D",
      "Doubtful-Term_loan",
      "Doubtful-O_D",
      "Loss-Term_loan",
      "Loss-O_D",
      "Total",
    ];

    const sectorNodes = [];
    const branchNodes = [];

    let currentSection = "sector";

    // Parse each row
    for (let i = dataTableStart; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const sNo = String(row[0] || "").trim();
      const label = String(row[1] || "").trim();

      // Check if we've moved to the branch section
      if (
        label.includes("II. NPLs by Branch") ||
        label.includes("NPLs by Branch")
      ) {
        currentSection = "branch";
        continue;
      }

      // Check if this is a total row
      const isTotalRow =
        label.includes("Total (Economic Sector)") ||
        label.includes("Total (Branch)");

     

      // Skip section headers
      if (label.includes("I. By Economic Sector")) {
        currentSection = "sector";
        continue;
      }

      // Extract values
      const getValue = (index) => {
        if (index !== undefined && index < row.length) {
          const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
          if (!isNaN(val) && val !== 0) {
            return val.toFixed(2);
          }
          return "0";
        }
        return "0";
      };

      const values = {};
      values["Substandard-Term_loan"] = getValue(2);
      values["Substandard-O_D"] = getValue(3);
      values["Doubtful-Term_loan"] = getValue(4);
      values["Doubtful-O_D"] = getValue(5);
      values["Loss-Term_loan"] = getValue(6);
      values["Loss-O_D"] = getValue(7);
      values["Total"] = getValue(8);

      // Determine level
      let level = 0;
      if (sNo && sNo.includes(".")) {
        level = sNo.split(".").length;
      } else if (sNo) {
        level = 1;
      }

      const entry = {
        id: sNo || "",
        sNo: sNo || "",
        label: label,
        values: values,
        rowNumber: i + 1,
        level: level,
        isTotalRow: isTotalRow || false,
        isSectionHeader: false,
        children: [],
      };

      if (currentSection === "sector") {
        sectorNodes.push(entry);
      } else if (currentSection === "branch") {
        branchNodes.push(entry);
      }
    }

    
      const sectorNodeMap = new Map();
  const sectorTopLevel = [];
    
    for (const node of sectorNodes) {
    if (node.sNo && node.sNo.includes('.')) {
      const parentSNo = node.sNo.split('.')[0];
      const parent = sectorNodeMap.get(parentSNo);
      if (parent) {
        parent.children.push(node);
      } else {
        sectorTopLevel.push(node);
      }
    } else {
      sectorNodeMap.set(node.sNo, node);
      sectorTopLevel.push(node);
    }
  }

// Sort sector top level by S.No
  sectorTopLevel.sort((a, b) => {
    const aNum = parseInt(a.sNo);
    const bNum = parseInt(b.sNo);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    // Put total row at the end
    if (a.isTotalRow && !b.isTotalRow) return 1;
    if (!a.isTotalRow && b.isTotalRow) return -1;
    return 0;
  });

  // Sort branch nodes
  branchNodes.sort((a, b) => {
    const aNum = parseInt(a.sNo);
    const bNum = parseInt(b.sNo);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    if (a.isTotalRow && !b.isTotalRow) return 1;
    if (!a.isTotalRow && b.isTotalRow) return -1;
    return 0;
  });

  // Create section nodes
  const sectorSection = {
    id: '',
    sNo: 'I',
    label: 'I. By Economic Sector',
    values: {},
    rowNumber: 13,
    level: 0,
    isTotalRow: false,
    isSectionHeader: true,
    isSectorSection: true,
    children: sectorTopLevel
  };

  const branchSection = {
    id: '',
    sNo: 'II',
    label: 'II. NPLs by Branch (Largest six branches by Amount)',
    values: {},
    rowNumber: branchSectionStart || 32,
    level: 0,
    isTotalRow: false,
    isSectionHeader: true,
    isBranchSection: true,
    children: branchNodes
  };

  // Combine sections
  const finalData = [sectorSection, branchSection];

  console.log('Sector entries:', sectorNodes.length);
  console.log('Branch entries:', branchNodes.length);

  return {
    hierarchicalData: finalData,
    columns: columns,
    additionalColumns: [],
    noandtitles
  };

  
};
export default extractNplSectorBranchData;
