import { excelDateToISO } from "../../../utils";
export const extractAccessPointUserMetadata =(data)=>{
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
    console.log(`extractFraudOutstanding row ${i} data =`, row);
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const sixCell = String(row[5] || "").trim();

    const labelValue = (() => {
      for (let c = 2; c <= 5; c++) {
        const v = row[c];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    })();
    // Excel row number, full row contents, and which value it picked).
    if (i <= 13) {
      console.log(
        `[metadata] row[${i}] (Excel row ${i + 1}):`,
        row,
        `| firstCell="${firstCell}" | labelValue picked="${labelValue}"`,
      );
    }

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;

      if (firstCell.includes("POIACC001") ) {
        metadata.reportType = "digital-quarterly_access-point-user";
        metadata.reportTypeId = "digital-quarterly_access-point-user";
        metadata.departmentId = "branchOps";
        metadata.departmentName = "Branch Operation";
      }
    }

    if (i === 1 && sixCell) {
      metadata.reportTitle = sixCell.replace(/\s+/g, " ").trim();
    }

    if (
      i === 0 &&
      secondCell &&
      (secondCell.toLowerCase().includes("instiution") ||
        secondCell.toLowerCase().includes("institution"))
    ) {
      metadata.institutionCode = labelValue || "";
    }

    if (
      i === 1 &&
      secondCell &&
      secondCell.toLowerCase().includes("financial year")
    ) {
      metadata.financialYear = labelValue || "";
    }

    if (
      i === 2 &&
      secondCell &&
      secondCell.toLowerCase().includes("start date")
    ) {
      metadata.startDate = excelDateToISO(labelValue) || "";
    }

    if (i === 3 && secondCell && secondCell.toLowerCase().includes("end date")) {
      metadata.endDate = excelDateToISO(labelValue) || "";
    }

    // if (i === 12) {
    //   const unitCell = row.find(
    //     (c) => c && String(c).toLowerCase().includes("million"),
    //   );
    //   if (unitCell) metadata.unit = String(unitCell).trim();
    // }
  }
  return metadata;
};
const extractAccessPointUserData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

 

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 15); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for the header row with region names
  // The header row has "A/A" in first cell followed by region names
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const thirdCell = String(row[2] || '').trim();
    const secondCell = String(row[1] || '').trim();
    if (secondCell === 'A/A' || thirdCell === 'Afar') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Extract region headers from the header row
  const headerRow = data[dataTableStart - 1];
  const regions = [];
  let totalColumnIndex = -1;

  for (let i = 1; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    if (cell === 'Total') {
      totalColumnIndex = i;
    } else if (cell) {
      regions.push({
        name: cell,
        index: i
      });
    }
  }

  console.log('Regions:', regions);
  console.log('Total column index:', totalColumnIndex);

  // Define the columns - regions plus Total
  const columns = [...regions.map(r => r.name), 'Total'];

  const topLevelNodes = [];

  // Helper functions
  const getValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      const val = parseFloat(String(row[index] ?? "").replace(/[,%\s]/g, ""));
      if (!isNaN(val) && val !== 0) {
        return val.toFixed(2);
      }
      return '0';
    }
    return '0';
  };

  const getStringValue = (index, row) => {
    if (index !== undefined && index < row.length) {
      return String(row[index] || '').trim();
    }
    return ''; 
  };

  
  // Check if a row is a Total row
  const isTotalRow = (label) => {
    return label.includes('_Total') || label.endsWith('_Total_Consistency');
  };


  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[0] || '').trim();

    // Skip if no label
    if (!label) continue;

    // Extract values for each region
    const values = {};
    
    for (const region of regions) {
      values[region.name] = getValue(region.index, row);
    }

       // Total column
    if (totalColumnIndex !== -1) {
      values['Total'] = getValue(totalColumnIndex, row);
    } else {
      values['Total'] = '0';
    }

    // Create the entry
    const entry = {
      id: ``,
      sNo: '',
      label: label,
      values: values,
      rowNumber: i + 1,
      level: 1,
      isTotalRow: isTotalRow(label),
      isSectionHeader: false,
     
      children: []
    };



   
    topLevelNodes.push(entry);
  }



  console.log('Total sections:', topLevelNodes.length);

  return {
    hierarchicalData: topLevelNodes,
    columns: columns,
    additionalColumns: [],
    noandtitles:['Description']
  };
};
export default extractAccessPointUserData