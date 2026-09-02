import { excelDateToISO } from "./excelParser";
export const extractReserveBaseMetadata = (data) => {
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
    const thirtyThreeCell = String(row[32] || "").trim();

    // //consol.log(`Row ${i + 1}:`, {
    //   firstCell,
    //   secondCell,
    //   thirdCell,
    //   fourthCell,
    //   eighthCell,
    //   tweneeEigntsCell
    // });

    if (i === 0 && firstCell) {
      metadata.ReturnKey = firstCell;
      //consol.log("Found Return Key:", metadata.ReturnKey);
     

if (firstCell.includes('RB001')){
        metadata.reportType = 'finance-monthly_reserve';
        metadata.departmentName = 'Finance';
        metadata.departmentId='finance';
        metadata.reportTypeId='finance-monthly_reserve'
        
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
      metadata.institutionCode = thirdCell || '';
      //consol.log("Found Institution Code:", metadata.institutionCode);
    }

    if (
      (i === 8)&&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Financial Year")
    ) {
      metadata.financialYear = thirdCell || '';
      //consol.log("Found Financial Year:", metadata.financialYear);
    }

    if (
      ( i === 9) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("Start Date")
    ) {
     // metadata.startDate = excelDateToISO(secondCell||thirdCell  || fourthCell || "");
     metadata.startDate = excelDateToISO(thirdCell) || '';
      //consol.log("Found Start Date:", metadata.startDate);
    }

    if (
      (i === 10 ) &&
      (firstCell || secondCell) &&
      (firstCell || secondCell).includes("End Date")
    ) {
      metadata.endDate = excelDateToISO(thirdCell) || "";
      // metadata.endDate =excelDateToISO(secondCell||thirdCell  || fourthCell || "");
      //consol.log("Found End Date:", metadata.endDate);
    }

    if (
      ( i === 11) &&
      (thirdCell || thirtyThreeCell || firstCell) &&
      (thirdCell.toLowerCase().includes("in") ||
        thirtyThreeCell.toLowerCase().includes("in") || firstCell.toLowerCase().includes('In'))
    ) {
      metadata.unit = thirtyThreeCell  || '';
      //consol.log("Found Unit:", metadata.unit);
    }
  }
return metadata
}
const extractReserveBaseData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 12) {
      noandtitles = [firstCell, secondCell];
      //consol.log("Found title:", noandtitles);
    }
  }
  //consol.log('=== Extracting Reserve Base Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      //consol.log(`Row ${i}:`, row.slice(0, 10).map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Code" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 1;
      //consol.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Reserve Base"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '1') {
        const secondCell = String(row[1] || '').trim();
        if (secondCell && secondCell.includes('Reserve Base')) {
          dataTableStart = i;
          //consol.log('Found data table at row (alt):', dataTableStart);
          break;
        }
      }
    }
  }

  if (dataTableStart === -1) {
    //consol.log('Could not find data table');
    return { hierarchicalData: [], currencies: [], additionalColumns: [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  
  // Print header row for debugging
  //consol.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Find day columns
  const dayColumns = [];
  let dayStartIndex = -1;
  
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim().replace(/\s+/g, '_');
if (cell === 'Day_1') {
    dayStartIndex = i;
    //consol.log('Found Day 1 at column:', i, cell);
  }

  if (cell && cell.startsWith('Day_') && !isNaN(cell.split('_')[1])) {
    dayColumns.push(cell);
  }

  if (cell === 'Monthly_Average') {
    dayColumns.push(cell);
  }
  }

  // If we couldn't find day columns, use default positions
  // if (dayColumns.length === 0) {
  //   dayStartIndex = 2;
  //   for (let i = 1; i <= 31; i++) {
  //     dayColumns.push(`Day ${i}`);
  //   }
  //   dayColumns.push('Monthly Average');
  // }

  //consol.log('Day columns:', dayColumns);
  //consol.log('Day start index:', dayStartIndex);

  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    // Skip if no description or if it's a note
    if (!description) continue;
    if (description.includes('Note:') || description.includes('Note')) continue;

    // Skip if code is a formula or reference
    if (code && code.startsWith('=')) continue;

    // Check if this is a section header (like "Reserve Base (1.1+1.2+1.3)")
    const isSectionHeader = description.includes('Reserve Base') || 
                           description.includes('Deductions Items') ||
                           description.includes('Net Reserve Base') ||
                           description.includes('Deposit Balance with NBE') ||
                           description.includes('Excess/Deficiency') ||
                           description.includes('Reserve Ratio');

    // Check if this is a total row (like for Reserve Ratio)
    const isTotalRow = description.includes('Reserve Ratio');

    // Extract values for each day
    const values = {};

    // Only extract values if not a section header without data
    //if (!isSectionHeader || description.includes('Reserve Base') || description.includes('Net Reserve Base')) {
    if (!description.includes('Reserve Ratio')){ 
    for (let j = 0; j < dayColumns.length; j++) {
        const colIndex = dayStartIndex + j;
        if (colIndex < row.length) {
          const rawValue = parseFloat(row[colIndex]);
          if (!isNaN(rawValue) && rawValue !== 0) {
            values[dayColumns[j]] = rawValue.toFixed(2);
          } else {
            values[dayColumns[j]] = '0';
          }
        } else {
          values[dayColumns[j]] = '0';
        }
      }
    } else {
      // For section headers without data, set all to null
       for (let j = 0; j < dayColumns.length; j++) {
        const colIndex = dayStartIndex + j;
        if (colIndex < row.length) {
          const rawValue = parseFloat(row[colIndex]);
          if (!isNaN(rawValue) && rawValue !== 0) {
            values[dayColumns[j]] = (rawValue * 100).toFixed(2) + '%';
          } else {
            values[dayColumns[j]] = '0';
          }
        } else {
          values[dayColumns[j]] = '0';
        }

       
      }
    }

    // Determine level
    let level = 0;
    if (code && code !== '') {
      // Code like "1", "1.1", "1.2"
      const codeParts = code.split('.');
      level = codeParts.length;
    } else if (isSectionHeader) {
      level = 0;
    } else if (isTotalRow) {
      level = 1;
    }

    const entry = {
      id: code || ``,
      sNo: code || '',
      label: description,
      values: values,
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      children: []
    };

    if (code) {
      nodeMap.set(code, entry);
    }

    if (!code) {
      if (isSectionHeader) {
        topLevelNodes.push(entry);
        currentParent = entry;
      } else if (isTotalRow) {
        if (currentParent) {
          currentParent.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      } else {
        if (currentParent && !currentParent.isSectionHeader) {
          currentParent.children.push(entry);
        } else if (currentParent) {
          currentParent.children.push(entry);
        } else {
          topLevelNodes.push(entry);
        }
      }
    }
  }

  // Build hierarchy for nodes with codes
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length === 1) {
      const existing = topLevelNodes.find(n => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
        //consol.log(`Added top-level node: ${code} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          //consol.log(`Added node ${code} as child of ${parentCode}`);
        }
      } else {
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
            //consol.log(`Added node ${code} as child of ${baseCode} (fallback)`);
          }
        } else {
          topLevelNodes.push(node);
          //consol.log(`Added node ${code} as top-level (no parent found)`);
        }
      }
    }
  }

  // Sort children by code
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      if (a.isTotalRow && !b.isTotalRow) return 1;
      if (!a.isTotalRow && b.isTotalRow) return -1;
      
      if (a.sNo && b.sNo) {
        const aParts = a.sNo.split('.').map(Number);
        const bParts = b.sNo.split('.').map(Number);
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

  sortChildren(topLevelNodes);

  // Clean up - remove empty children arrays
  const cleanData = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanData(node.children);
      }
    });
  };
  cleanData(topLevelNodes);

  //consol.log('Final top-level nodes:', topLevelNodes.length);
  //consol.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  return {
    hierarchicalData: topLevelNodes,
    columns: dayColumns,
    additionalColumns: [],
    noandtitles:noandtitles
  };
};

export default extractReserveBaseData;