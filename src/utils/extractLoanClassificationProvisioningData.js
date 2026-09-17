import { excelDateToISO } from "./excelParser";
export const extractLoanClassificationProvisioningMetadata = (data) => {
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

      if (firstCell.includes("LOAN_CLA&PROV") || firstCell.includes("LP001")) {
        metadata.reportType = "credit-quarterly_loan-classification-provisioning";
        metadata.reportTypeId =
          "credit-quarterly_loan-classification-provisioning";
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

const extractLoanClassificationProvisioningData = (data) => {
 let dataTableStart = -1;
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
  //console.log('=== Extracting Loan Classification Data ===');


  const sanitizeKey = (text) => {
  return text
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_');
};
  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      //console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Code" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 1;
      //console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "Pass"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '1') {
        const secondCell = String(row[1] || '').trim();
        if (secondCell && secondCell.includes('Pass')) {
          dataTableStart = i;
          //console.log('Found data table at row (alt):', dataTableStart);
          break;
        }
      }
    }
  }

  if (dataTableStart === -1) {
    //console.log('Could not find data table');
    return { hierarchicalData: [], columns: [], additionalColumns: [] };
  }

  // Get the header row to identify column positions
  const headerRow = data[dataTableStart - 1];
  //console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Define column mappings
  // Based on the Excel: Amount(A), Deductible collateral(B), Cash/cash substitute(C), Net recoverable value(D), Total(E), Net loans and advances(F), Provisioning rate(G), Required provision(H), Accumulated provision held(I), Excess/shortfall in provisions(J)
  
  const columnMap = {
    amount: 2,           // Column C (index 2)
   // deductibleCollateral: 3, // Column D (index 3)
    cashSubstitute: 3,   // Column E (index 4)
    netRecoverable: 4,   // Column F (index 5)
    total: 5,            // Column G (index 6)
    netLoans: 6,         // Column H (index 7)
    provisioningRate: 7, // Column I (index 8)
    requiredProvision: 8, // Column J (index 9)
    accumulatedProvision: 9, // Column K (index 10)
    excessShortfall: 10  // Column L (index 11)
  };

  // Find actual column positions from header
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    if (cell === 'Amount') columnMap.amount = i;
    if (cell === 'Deductible collateral') columnMap.deductibleCollateral = i;
    if (cell === 'Cash/cash substitute') columnMap.cashSubstitute = i;
    if (cell === 'Net recoverable value') columnMap.netRecoverable = i;
    if (cell === 'Total') columnMap.total = i;
    if (cell === 'Net loans and advances') columnMap.netLoans = i;
    if (cell === 'Provisioning rate') columnMap.provisioningRate = i;
    if (cell === 'Required provision') columnMap.requiredProvision = i;
    if (cell === 'Accumulated provision held') columnMap.accumulatedProvision = i;
    if (cell === 'Excess/shortfall in provisions') columnMap.excessShortfall = i;
  }

  //console.log('Column map:', columnMap);

  // Define column names for columns
  const columnNames = [
    'Deductible_Collateral_Amount_A',
    'Deductible_Collateral_Cash_Cash_Substitute_B',
    'Deductible_Collateral_Net_Recoverable_Value_C',
    'Deductible_Collateral_Total_D',
    'Deductible_Collateral_Net_Loans_And_Advances_E',
    'Provisioning_Rate_F',
    'Required_Provision_G',
    'Accumulated_Provision_Held_H',
    'Excess_Shortfall_In_Provisions_I'
  ];

  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    // Skip if no description
    if (!description) continue;

    
    // Skip footer rows or notes
    // if (description.includes('Total_Accumulated') || 
    //     description.includes('Note:') || 
    //     description.includes('Note')) continue;

    // Check if this is a total row
    const isTotalRow = description === 'Total Loans and Advances (Sum 1-5)' ||
                       description === 'Total Non Performing (Sum 3-5)' ||
                       description.includes('Total_Accumulated') ||
                       description === 'NPLs Ratio(7/6)';

    // Check if this is a section header (like 1, 2, 3, 4, 5)
    const isSectionHeader = code && (code === '1' || code === '2' || code === '3' || code === '4' || code === '5' || code === '6' || code === '7' || code === '8');

    // Extract values for each column
    const values = {};

    // Helper function to get value from row
    const getValue = (index) => {
      if (index !== undefined && index < row.length) {
        const val = parseFloat(row[index]);
        if (!isNaN(val) && val !== 0) {
          return val.toFixed(2);
        }
        return '0';
      }
      return '0';
    };

    // Extract all values using the column map
    values['Deductible_Collateral_Amount_A'] = getValue(columnMap.amount);
    values['Deductible_Collateral_Cash_Cash_Substitute_B'] = getValue(columnMap.cashSubstitute);
    values['Deductible_Collateral_Net_Recoverable_Value_C'] = getValue(columnMap.netRecoverable);
    values['Deductible_Collateral_Total_D'] = getValue(columnMap.total);
    values['Deductible_Collateral_Net_Loans_And_Advances_E'] = getValue(columnMap.netLoans);
    values['Provisioning_Rate_F'] = getValue(columnMap.provisioningRate);
    values['Required_Provision_G'] = getValue(columnMap.requiredProvision);
    values['Accumulated_Provision_Held_H'] = getValue(columnMap.accumulatedProvision);
    values['Excess_Shortfall_In_Provisions_I'] = getValue(columnMap.excessShortfall);

    // Determine level
    let level = 0;
    if (code && code !== '') {
      const codeParts = code.split('.');
      level = codeParts.length;
    } else if (isTotalRow) {
      level = 0;
    } else if (isSectionHeader) {
      level = 0;
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

   //console.log('lc datas' , entry)
    if (code) {
      nodeMap.set(code, entry);
    }

    if (!code) {
      // Rows without code
      if (isTotalRow) {
        if (description.includes('Total Loans and Advances')) {
          const parent = nodeMap.get('6');
          if (parent) {
            parent.children.push(entry);
          } else {
            topLevelNodes.push(entry);
          }
        } else if (description.includes('Total Non Performing')) {
          const parent = nodeMap.get('7');
          if (parent) {
            parent.children.push(entry);
          } else {
            topLevelNodes.push(entry);
          }
        } else if (description.includes('NPLs Ratio')) {
          const parent = nodeMap.get('8');
          if (parent) {
            parent.children.push(entry);
          } else {
            topLevelNodes.push(entry);
          }
        } 
        else if (description.includes('Total_Accumulated')) {
         topLevelNodes.push(entry);
        } 
        else {
          topLevelNodes.push(entry);
        }
      } else {
        // Other rows without code - add to current parent
        if (currentParent) {
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
    
    if (codeParts.length === 1 ) {
      // Top level nodes (1, 2, 3, 4, 5, 6, 7, 8)
      const existing = topLevelNodes.find(n => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
        //console.log(`Added top-level node: ${code} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      // Child nodes (1.1, 1.1.1, etc.)
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          //console.log(`Added node ${code} as child of ${parentCode}`);
        }
      } else {
        // Try to find parent by base code
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
            //console.log(`Added node ${code} as child of ${baseCode} (fallback)`);
          }
        } else {
          // If still no parent, add to top level
          topLevelNodes.push(node);
          //console.log(`Added node ${code} as top-level (no parent found)`);
        }
      }
    }
  }

  // Sort children by code
//   const sortChildren = (nodes) => {
//     nodes.sort((a, b) => {
//       if (a.isTotalRow && !b.isTotalRow) return 1;
//       if (!a.isTotalRow && b.isTotalRow) return -1;
      
//       if (a.sNo && b.sNo) {
//         const aParts = a.sNo.split('.').map(Number);
//         const bParts = b.sNo.split('.').map(Number);
//         for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
//           if (aParts[i] !== bParts[i]) {
//             return aParts[i] - bParts[i];
//           }
//         }
//         return aParts.length - bParts.length;
//       }
//       return 0;
//     });

//     nodes.forEach(node => {
//       if (node.children && node.children.length > 0) {
//         sortChildren(node.children);
//       }
//     });
//   };

//   sortChildren(topLevelNodes);

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

// ======================================================
// FORCE Total_Accumulated TO THE LAST TOP-LEVEL POSITION
// ======================================================
const accumulatedIndex = topLevelNodes.findIndex(node =>
  node.label.toLowerCase().includes('total_accumulated')
);

if (accumulatedIndex !== -1) {
  const accumulatedNode = topLevelNodes.splice(accumulatedIndex, 1)[0];
  topLevelNodes.push(accumulatedNode);
}

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

  //console.log('Final top-level nodes:', topLevelNodes.length);
  //console.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  // Return sanitized column names for columns
  const currencyColumns = columnNames.map(name => sanitizeKey(name));

  return {
    hierarchicalData: topLevelNodes,
    columns: currencyColumns,
    additionalColumns: [],
    noandtitles
  };
};

export default extractLoanClassificationProvisioningData;