import { excelDateToISO } from "./excelParser";
export const extractKeyBalanceSheetMetadata = (data) => {
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

  //consol.log("data.length  ", data.length)
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();
    const thirdCell = String(row[2] || "").trim();
    const fourthCell = String(row[3] || "").trim();
    const eighthCell = String(row[8] || "").trim();

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //consol.log("Found Return Key:", metadata.ReturnKey);
  

if (firstCell.includes('Key Balance Sheet') || firstCell.includes('MK001')) {
        metadata.reportType = 'finance-monthly_key-balance-sheet';
        metadata.reportTypeId = 'finance-monthly_key-balance-sheet';
        metadata.departmentId = 'finance';
        metadata.departmentName = 'Finance';
      }
    }

    if (( i === 3) && (firstCell)) {
       metadata.reportTitle = firstCell || '';
      //consol.log("Found Report Title:", metadata.reportTitle);
    }

    if (
     (i === 7 )&&
      (firstCell ) &&
     ( (firstCell || secondCell).includes("Instiution") ||  (firstCell || secondCell).includes("Institution "))
    ) {
      metadata.institutionCode = secondCell || '';
      //consol.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = secondCell || '';
      //consol.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(secondCell) || '';
      //consol.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(secondCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //consol.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 12) &&
      (firstCell )
    ) {
      metadata.unit = firstCell  || '';
      //consol.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractKeyBalanceSheetData = (data) => {
  const hierarchicalData = [];

  const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};
  let dataTableStart = -1;

  //consol.log('=== Extracting Key Balance Sheet Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      //consol.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Particulars" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Particulars') {
      dataTableStart = i + 1;
      //consol.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Total assets"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell && firstCell.includes('Total assets')) {
        dataTableStart = i;
        //consol.log('Found data table at row (alt):', dataTableStart);
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    //consol.log('Could not find data table');
    return { hierarchicalData: [], columns: ['Amount'], additionalColumns: [] };
  }

  // Get the header row
  const headerRow = data[dataTableStart - 1];
  //consol.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Find the value column (column B = index 1)
  const valueColumnIndex = 1;
  const topLevelNodes = [];

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[0] || '').trim();
    
    // Skip if no label
    if (!label) continue;
   if(i >22) continue;
    // Skip note rows
    if (label.includes('Note:') || label.includes('Note')) continue;

    // Check if this is a metric we care about
    // let matchedMetric = null;
    // for (const metric of metricLabels) {
    //   if (label === metric || label.includes(metric)) {
    //     matchedMetric = metric;
    //     break;
    //   }
    // }

    // Also check if it's one of the other metrics (loans, deposits, etc.)


    if (label) {
      // Extract the value
      let value = '0';
      if (valueColumnIndex < row.length) {
        const rawVal = parseFloat(row[valueColumnIndex]);
        if (!isNaN(rawVal) && rawVal !== 0) {
          value = rawVal.toFixed(2);
        }
      }

      const values = {
        'Amount': value
      };

      const entry = {
        id: '',
        sNo: '',
        label: label,
        values: values,
        rowNumber: i + 1,
        level: 0,
        isTotalRow: false,
        isSectionHeader: false,
        children: []
      };

      topLevelNodes.push(entry);
        }
  }

  //consol.log('Total metric entries:', topLevelNodes);

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Amount'],
    additionalColumns: [],
    noandtitles:['Particulars']
  };
};
export default extractKeyBalanceSheetData