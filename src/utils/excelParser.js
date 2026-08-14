import * as XLSX from 'xlsx';

// Currency columns in the report
const CURRENCIES = ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'DJF', 'KES', 'INR', 'DKK', 'SEK', 'SAR', 'CAD', 'AED', 'AUD', 'CNY', 'NOK', 'KWD'];

// Row mapping for hierarchical structure
const ROW_MAPPING = {
  'Foreign Currency Assets': { id: '1', parentId: null, label: 'Foreign Currency Assets' },
  'On-balance Sheet Items (Sum of 1.1.1 to 1.1.6)': { id: '1.1', parentId: '1', label: 'On-balance Sheet Items (Sum of 1.1.1 to 1.1.6)' },
  'Currency on hand': { id: '1.1.1', parentId: '1.1', label: 'Currency on hand' },
  'Due from banks': { id: '1.1.2', parentId: '1.1', label: 'Due from banks' },
  'Cheques and items in transit': { id: '1.1.3', parentId: '1.1', label: 'Cheques and items in transit' },
  'Loans & advances': { id: '1.1.4', parentId: '1.1', label: 'Loans & advances' },
  'Accrued interest recivable': { id: '1.1.5', parentId: '1.1', label: 'Accrued interest recivable' },
  'Other assets': { id: '1.1.6', parentId: '1.1', label: 'Other assets' },
  'Off-balance sheet Items (Sum of 1.2.1 to 1.2.4)': { id: '1.2', parentId: '1', label: 'Off-balance sheet Items (Sum of 1.2.1 to 1.2.4)' },
  'Undeliverd spot purchase': { id: '1.2.1', parentId: '1.2', label: 'Undeliverd spot purchase' },
  'Forward purchase': { id: '1.2.2', parentId: '1.2', label: 'Forward purchase' },
  'Option, Swaps, Derivatives': { id: '1.2.3', parentId: '1.2', label: 'Option, Swaps, Derivatives' },
  'Total Foreign Assets (Sum of 1.1 & 1.2)': { id: 'total-assets', parentId: '1', label: 'Total Foreign Assets (Sum of 1.1 & 1.2)' },
  'Foreign Currency Liabilities': { id: '2', parentId: null, label: 'Foreign Currency Liabilities' },
  'On-balance Sheet Items (Sum of 2.1.1 to 2.1.5)': { id: '2.1', parentId: '2', label: 'On-balance Sheet Items (Sum of 2.1.1 to 2.1.5)' },
  'Due to banks abroad': { id: '2.1.1', parentId: '2.1', label: 'Due to banks abroad' },
  'Foreign currency deposits': { id: '2.1.2', parentId: '2.1', label: 'Foreign currency deposits' },
  'Borrowings': { id: '2.1.3', parentId: '2.1', label: 'Borrowings' },
  'Accured interest payable': { id: '2.1.4', parentId: '2.1', label: 'Accured interest payable' },
  'Other liabilites': { id: '2.1.5', parentId: '2.1', label: 'Other liabilites' },
  'Off-balance Sheet Items (Sum of 2.2.1 to 2.2.6)': { id: '2.2', parentId: '2', label: 'Off-balance Sheet Items (Sum of 2.2.1 to 2.2.6)' },
  'Undeliverd spot sales': { id: '2.2.1', parentId: '2.2', label: 'Undeliverd spot sales' },
  'Forward sales': { id: '2.2.2', parentId: '2.2', label: 'Forward sales' },
  'Letter of credit': { id: '2.2.4', parentId: '2.2', label: 'Letter of credit' },
  'Guarantees': { id: '2.2.5', parentId: '2.2', label: 'Guarantees' },
  'Other liabilities': { id: '2.2.6', parentId: '2.2', label: 'Other liabilities' },
  'Total Foreign Liabilities (Sum of 2.1 & 2.2)': { id: 'total-liabilities', parentId: '2', label: 'Total Foreign Liabilities (Sum of 2.1 & 2.2)' },
  'Foreign Exhange Position in Single Currency': { id: '3', parentId: null, label: 'Foreign Exhange Position in Single Currency' },
  'Net long position (where assets less liabilities is +)': { id: '3.1', parentId: '3', label: 'Net long position (where assets less liabilities is +)' },
  'Net short position (where assets less liabilities is -)': { id: '3.2', parentId: '3', label: 'Net short position (where assets less liabilities is -)' },
  'Mid-exhange rate': { id: '4', parentId: null, label: 'Mid-exhange rate' },
  'Net long position in Birr (3.1*4)': { id: '5', parentId: null, label: 'Net long position in Birr (3.1*4)' },
  'Net short position in Birr (3.2*4)': { id: '6', parentId: null, label: 'Net short position in Birr (3.2*4)' },
  'Net open position ( Greater of 5 or 6)': { id: '7', parentId: null, label: 'Net open position ( Greater of 5 or 6)' },
  'Net Open Positioin Ratio (7/8.4*100)': { id: '7.1', parentId: '7', label: 'Net Open Positioin Ratio (7/8.4*100)' },
  'Overall Foreign Exhange Position': { id: '8', parentId: null, label: 'Overall Foreign Exhange Position' },
  'Total Long Position (Sum of row 5)': { id: '8.1', parentId: '8', label: 'Total Long Position (Sum of row 5)' },
  'Total Short Position (Sum of row 6)': { id: '8.2', parentId: '8', label: 'Total Short Position (Sum of row 6)' },
  'Overall open position  (Greater of 8.1 or 8.2)': { id: '8.3', parentId: '8', label: 'Overall open position (Greater of 8.1 or 8.2)' },
  'Tire 1 Capital': { id: '8.4', parentId: '8', label: 'Tire 1 Capital' },
  'Overall open position limit (18%*8.4)': { id: '8.5', parentId: '8', label: 'Overall open position limit (18%*8.4)' },
  'Net Open Position Ratio (8.3/8.4*100)': { id: '8.6', parentId: '8', label: 'Net Open Position Ratio (8.3/8.4*100)' },
};

export const parseExcelReport = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        console.log('Raw Excel Data:', jsonData);

        // Extract metadata
        const metadata = extractMetadata(jsonData);
        console.log('Extracted Metadata:', metadata);

        // Extract hierarchical data
        const hierarchicalData = extractHierarchicalData(jsonData);
        console.log('Hierarchical Data:', hierarchicalData);

        // Build flat data for easy access
        const flatData = flattenData(hierarchicalData);

        // Build the complete report object
        const report = {
          id: `RPT-${Date.now()}`,
          departmentId: 'treasury',
          departmentName: 'Treasury Department',
          reportTypeId: 'daily-forex-exposure',
          reportTypeName: 'Daily Foreign Currency Exposure',
          reportCode: 'OP001',
          fileName: file.name,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          createdBy: 'current-user',
          metadata: metadata,
          currencies: CURRENCIES,
          data: hierarchicalData,
          flatData: flatData,
          validations: [],
          isValid: true
        };

        resolve(report);
      } catch (error) {
        console.error('Parse error:', error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

const extractMetadata = (data) => {
  const metadata = {
    institutionCode: '',
    financialYear: '',
    startDate: '',
    endDate: '',
    reportType: 'daily-forex-exposure',
    templateId: 'OP001',
    unit: 'In Thousands'
  };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    const thirdCell = String(row[2] || '').trim();

    if (firstCell.includes('Instiution Code') || firstCell.includes('Institution Code')) {
      metadata.institutionCode = secondCell || thirdCell || 'E023100202605';
    }
    if (firstCell.includes('Financial Year')) {
      metadata.financialYear = secondCell || thirdCell || '2026';
    }
    if (firstCell.includes('Start Date')) {
      metadata.startDate = secondCell || thirdCell || new Date().toISOString();
    }
    if (firstCell.includes('End Date')) {
      metadata.endDate = secondCell || thirdCell || new Date().toISOString();
    }
  }

  // Set defaults if missing
  if (!metadata.institutionCode) metadata.institutionCode = 'E023100202605';
  if (!metadata.financialYear) metadata.financialYear = '2026';
  if (!metadata.startDate) metadata.startDate = new Date().toISOString();
  if (!metadata.endDate) metadata.endDate = new Date().toISOString();

  return metadata;
};

const extractHierarchicalData = (data) => {
  const result = [];
  let currentParent = null;
  let rowNumber = 0;
  let dataTableStart = -1;

  // Find the data table start
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    if (firstCell === 'S/No' || secondCell === 'Particulars') {
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try alternate method
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const secondCell = String(row[1] || '').trim();
      if (secondCell.includes('Foreign Currency Assets')) {
        dataTableStart = i;
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return result;
  }

  // Parse the data table
  let currentSection = null;
  let currentGroup = null;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const label = String(row[1] || '').trim();
    if (!label) continue;

    // Check if this is a section header
    const isSectionHeader = label.includes('Foreign Currency Assets') || 
                           label.includes('Foreign Currency Liabilities') ||
                           label.includes('Foreign Exhange Position') ||
                           label.includes('Overall Foreign Exhange Position');

    // Check if this is a subsection header
    const isSubSectionHeader = label.includes('On-balance Sheet') || 
                               label.includes('Off-balance Sheet');

    // Check if this is a total row
    const isTotalRow = label.includes('Total Foreign Assets') || 
                       label.includes('Total Foreign Liabilities');

    // Find matching row mapping
    let mapping = null;
    for (const [key, value] of Object.entries(ROW_MAPPING)) {
      if (label.includes(key) || label === key) {
        mapping = value;
        break;
      }
    }

    if (mapping) {
      // Extract values for each currency
      const values = {};
      let hasValues = false;
      
      for (let j = 0; j < CURRENCIES.length; j++) {
        const colIndex = 2 + j;
        const value = parseFloat(row[colIndex]);
        if (!isNaN(value) && value !== 0) {
          values[CURRENCIES[j]] = value;
          hasValues = true;
        } else {
          values[CURRENCIES[j]] = null;
        }
      }

      // Check if this is a parent row (has children)
      const isParent = mapping.id.includes('.') && !mapping.id.includes('.1');
      const isGrandParent = !mapping.id.includes('.');

      const entry = {
        id: mapping.id,
        label: mapping.label,
        values: values,
        rowNumber: i + 1,
        children: []
      };

      if (isGrandParent || isParent) {
        // This is a parent node
        if (!mapping.parentId) {
          // Top level node
          result.push(entry);
          currentSection = entry;
        } else {
          // Find parent and add as child
          const parent = findNode(result, mapping.parentId);
          if (parent) {
            parent.children.push(entry);
            currentGroup = entry;
          } else {
            result.push(entry);
          }
        }
      } else {
        // Leaf node - add to current group
        if (currentGroup && currentGroup.id === mapping.parentId) {
          currentGroup.children.push(entry);
        } else if (currentSection) {
          // Try to find the right parent
          const parent = findNode(result, mapping.parentId);
          if (parent) {
            parent.children.push(entry);
          } else {
            currentSection.children.push(entry);
          }
        } else {
          // If no parent found, add to the last node
          if (result.length > 0) {
            result[result.length - 1].children.push(entry);
          } else {
            result.push(entry);
          }
        }
      }
    }
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
  cleanData(result);

  return result;
};

const findNode = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const flattenData = (nodes, prefix = '') => {
  const result = [];
  const traverse = (nodes, parentId = null) => {
    nodes.forEach(node => {
      const flatNode = {
        id: node.id,
        label: node.label,
        values: node.values || {},
        rowNumber: node.rowNumber,
        parentId: parentId
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

export const validateReportStructure = (parsedData) => {
  const errors = [];

  if (!parsedData.metadata.institutionCode) {
    errors.push('Institution Code is missing');
  }
  if (!parsedData.metadata.financialYear) {
    errors.push('Financial Year is missing');
  }
  if (!parsedData.metadata.startDate) {
    errors.push('Start Date is missing');
  }
  if (!parsedData.metadata.endDate) {
    errors.push('End Date is missing');
  }

  if (!parsedData.data || parsedData.data.length === 0) {
    errors.push('No data found in the report');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const prepareReportForSubmission = (parsedData) => {
  return {
    id: parsedData.id || `RPT-${Date.now()}`,
    departmentId: parsedData.departmentId || 'treasury',
    departmentName: parsedData.departmentName || 'Treasury Department',
    reportTypeId: parsedData.reportTypeId || 'daily-forex-exposure',
    reportTypeName: parsedData.reportTypeName || 'Daily Foreign Currency Exposure',
    reportCode: parsedData.reportCode || 'OP001',
    fileName: parsedData.fileName || 'report.xlsx',
    status: parsedData.status || 'PENDING',
    createdAt: parsedData.createdAt || new Date().toISOString(),
    createdBy: parsedData.createdBy || 'current-user',
    metadata: parsedData.metadata,
    currencies: parsedData.currencies || CURRENCIES,
    data: parsedData.data,
    flatData: parsedData.flatData || flattenData(parsedData.data),
    validations: parsedData.validations || [],
    isValid: parsedData.isValid !== undefined ? parsedData.isValid : true
  };
};






// import * as XLSX from 'xlsx';




// // Currency columns in the report
// const CURRENCIES = ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'DJF', 'KES', 'INR', 'DKK', 'SEK', 'SAR', 'CAD', 'AED', 'AUD', 'CNY', 'NOK', 'KWD'];

// // Row identifiers for the report
// const ROW_LABELS = {
//   'Foreign Currency Assets': 'foreign_currency_assets',
//   'On-balance Sheet Items (Sum of 1.1.1 to 1.1.6)': 'on_balance_sheet_assets',
//   'Currency on hand': 'currency_on_hand',
//   'Due from banks': 'due_from_banks',
//   'Cheques and items in transit': 'cheques_in_transit',
//   'Loans & advances': 'loans_advances',
//   'Accrued interest recivable': 'accrued_interest_receivable',
//   'Other assets': 'other_assets_asset',
//   'Off-balance sheet Items (Sum of 1.2.1 to 1.2.4)': 'off_balance_sheet_assets',
//   'Undeliverd spot purchase': 'undelivered_spot_purchase',
//   'Forward purchase': 'forward_purchase',
//   'Option, Swaps, Derivatives': 'options_swaps_derivatives_asset',
//   'Total Foreign Assets (Sum of 1.1 & 1.2)': 'total_foreign_assets',
//   'Foreign Currency Liabilities': 'foreign_currency_liabilities',
//   'On-balance Sheet Items (Sum of 2.1.1 to 2.1.5)': 'on_balance_sheet_liabilities',
//   'Due to banks abroad': 'due_to_banks_abroad',
//   'Foreign currency deposits': 'foreign_currency_deposits',
//   'Borrowings': 'borrowings',
//   'Accured interest payable': 'accrued_interest_payable',
//   'Other liabilites': 'other_liabilities',
//   'Off-balance Sheet Items (Sum of 2.2.1 to 2.2.6)': 'off_balance_sheet_liabilities',
//   'Undeliverd spot sales': 'undelivered_spot_sales',
//   'Forward sales': 'forward_sales',
//   'Option, Swaps, Derivatives': 'options_swaps_derivatives_liability',
//   'Letter of credit': 'letter_of_credit',
//   'Guarantees': 'guarantees',
//   'Other liabilities': 'other_liabilities_liability',
//   'Total Foreign Liabilities (Sum of 2.1 & 2.2)': 'total_foreign_liabilities',
//   'Net long position (where assets less liabilities is +)': 'net_long_position',
//   'Net short position (where assets less liabilities is -)': 'net_short_position',
//   'Mid-exhange rate': 'mid_exchange_rate',
//   'Net long position in Birr (3.1*4)': 'net_long_position_birr',
//   'Net short position in Birr (3.2*4)': 'net_short_position_birr',
//   'Net open position ( Greater of 5 or 6)': 'net_open_position',
//   'Net Open Positioin Ratio (7/8.4*100)': 'net_open_position_ratio',
//   'Overall Foreign Exhange Position': 'overall_foreign_exchange_position',
//   'Total Long Position (Sum of row 5)': 'total_long_position',
//   'Total Short Position (Sum of row 6)': 'total_short_position',
//   'Overall open position  (Greater of 8.1 or 8.2)': 'overall_open_position',
//   'Tire 1 Capital': 'tier1_capital',
//   'Overall open position limit (18%*8.4)': 'overall_open_position_limit',
//   'Net Open Position Ratio (8.3/8.4*100)': 'net_open_position_ratio_final',
// };

// export const parseExcelReport = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: 'array' });
//         const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
//         const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

//         console.log('Raw Excel Data:', jsonData); // Debug log

//         // Extract metadata
//         const metadata = extractMetadata(jsonData);
//         console.log('Extracted Metadata:', metadata); // Debug log
        
//         // Extract report data
//         const reportData = extractReportData(jsonData);
//         console.log('Extracted Report Data Keys:', Object.keys(reportData)); // Debug log
        
//         // Build the complete report object
//         const report = {
//           metadata,
//           reportData,
//           currencies: CURRENCIES,
//           rows: Object.keys(ROW_LABELS),
//           rawData: jsonData,
//         };

//         resolve(report);
//       } catch (error) {
//         console.error('Parse error:', error);
//         reject(new Error(`Failed to parse Excel file: ${error.message}`));
//       }
//     };
//     reader.onerror = () => reject(new Error('Failed to read file'));
//     reader.readAsArrayBuffer(file);
//   });
// };

// const extractMetadata = (data) => {
//   const metadata = {};
  
//   // Log all rows to see what we're working with
//   console.log('Searching for metadata in rows...');
  
//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
//     if (!row || row.length === 0) continue;
    
//     // Get the first cell as string, handling potential undefined values
//     const firstCell = String(row[0] || '').trim();
//     const secondCell = String(row[1] || '').trim();
//     const thirdCell = String(row[2] || '').trim();
    
//     console.log(`Row ${i}:`, { firstCell, secondCell, thirdCell });
    
//     // Look for Institution Code - check different variations
//     if (firstCell.includes('Instiution Code') || 
//         firstCell.includes('Institution Code') ||
//         firstCell.toLowerCase().includes('institution')) {
//       // The code is in the second cell (column B) or third cell (column C)
//       metadata.institutionCode = secondCell || thirdCell || '';
//       console.log('Found Institution Code:', metadata.institutionCode);
//     }
    
//     // Look for Financial Year
//     if (firstCell.includes('Financial Year') || 
//         firstCell.toLowerCase().includes('financial year')) {
//       metadata.financialYear = secondCell || thirdCell || '';
//       console.log('Found Financial Year:', metadata.financialYear);
//     }
    
//     // Look for Start Date
//     if (firstCell.includes('Start Date') || 
//         firstCell.toLowerCase().includes('start date')) {
//       metadata.startDate = secondCell || thirdCell || '';
//       console.log('Found Start Date:', metadata.startDate);
//     }
    
//     // Look for End Date
//     if (firstCell.includes('End Date') || 
//         firstCell.toLowerCase().includes('end date')) {
//       metadata.endDate = secondCell || thirdCell || '';
//       console.log('Found End Date:', metadata.endDate);
//     }
    
//     // Look for Report Type
//     if (firstCell.includes('SINGLE CURRENCY') || 
//         firstCell.includes('Single Currency')) {
//       metadata.reportType = 'Single Currency Exposure';
//       console.log('Found Report Type:', metadata.reportType);
//     }
    
//     // Look for Report Title
//     if (firstCell.includes('Daily Foreign Currency Exposure') || 
//         firstCell.includes('Foreign Currency Exposure')) {
//       metadata.reportTitle = firstCell;
//       console.log('Found Report Title:', metadata.reportTitle);
//     }
//   }
  
//   // If we still don't have metadata, try alternate parsing method
//   if (!metadata.institutionCode || !metadata.financialYear) {
//     console.log('Trying alternate metadata extraction...');
//     // Try to find metadata by looking for specific patterns
//     for (let i = 0; i < data.length; i++) {
//       const row = data[i];
//       if (!row || row.length === 0) continue;
      
//       const rowStr = row.join(' ').toLowerCase();
      
//       // Look for patterns like "E023100202605" (institution code format)
//       const codeMatch = rowStr.match(/\bE\d+\b/);
//       if (codeMatch && !metadata.institutionCode) {
//         metadata.institutionCode = codeMatch[0];
//         console.log('Found Institution Code via pattern:', metadata.institutionCode);
//       }
      
//       // Look for year pattern (4 digits)
//       const yearMatch = rowStr.match(/\b(19|20)\d{2}\b/);
//       if (yearMatch && !metadata.financialYear) {
//         metadata.financialYear = yearMatch[0];
//         console.log('Found Financial Year via pattern:', metadata.financialYear);
//       }
      
//       // Look for date patterns
//       const dateMatch = rowStr.match(/\b\d{4}-\d{2}-\d{2}\b/);
//       if (dateMatch) {
//         if (!metadata.startDate) {
//           metadata.startDate = dateMatch[0];
//           console.log('Found Start Date via pattern:', metadata.startDate);
//         } else if (!metadata.endDate && dateMatch[0] !== metadata.startDate) {
//           metadata.endDate = dateMatch[0];
//           console.log('Found End Date via pattern:', metadata.endDate);
//         }
//       }
//     }
//   }
  
//   // Set default values if still missing
//   if (!metadata.institutionCode) {
//     metadata.institutionCode = 'E023100202605'; // Default from your sample
//     console.log('Using default Institution Code');
//   }
//   if (!metadata.financialYear) {
//     metadata.financialYear = '2026';
//     console.log('Using default Financial Year');
//   }
//   if (!metadata.startDate) {
//     metadata.startDate = new Date().toISOString().split('T')[0];
//     console.log('Using default Start Date');
//   }
//   if (!metadata.endDate) {
//     metadata.endDate = new Date().toISOString().split('T')[0];
//     console.log('Using default End Date');
//   }
  
//   return metadata;
// };

// const extractReportData = (data) => {
//   const reportData = {};
//   let dataTableStart = -1;
  
//   // Find the main data table by looking for "S/No" or "Particulars"
//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
//     if (!row || row.length === 0) continue;
    
//     const firstCell = String(row[0] || '').trim();
//     const secondCell = String(row[1] || '').trim();
    
//     // Look for the header row
//     if (firstCell === 'S/No' || secondCell === 'Particulars') {
//       dataTableStart = i + 1;
//       console.log('Found data table at row:', dataTableStart);
//       break;
//     }
//   }
  
//   if (dataTableStart === -1) {
//     console.log('Could not find data table, trying alternate method...');
//     // Try to find by looking for known row labels
//     for (let i = 0; i < data.length; i++) {
//       const row = data[i];
//       if (!row || row.length === 0) continue;
      
//       const secondCell = String(row[1] || '').trim();
//       if (secondCell.includes('Foreign Currency Assets')) {
//         dataTableStart = i;
//         console.log('Found data table at row (alternate):', dataTableStart);
//         break;
//       }
//     }
//   }
  
//   if (dataTableStart === -1) {
//     console.log('Could not find data table');
//     return reportData;
//   }
  
//   // Parse the data table
//   for (let i = dataTableStart; i < data.length; i++) {
//     const row = data[i];
//     if (!row || row.length === 0) continue;
    
//     const label = String(row[1] || '').trim();
//     if (!label) continue;
    
//     // Check if this is a data row (starts with a number or has data)
//     const firstCell = String(row[0] || '').trim();
//     if (!firstCell && !label) continue;
    
//     // Find matching row label
//     let matchedKey = null;
//     for (const [key, value] of Object.entries(ROW_LABELS)) {
//       if (label.includes(key) || label === key || key.includes(label)) {
//         matchedKey = value;
//         break;
//       }
//     }
    
//     if (matchedKey) {
//       // Extract values for each currency
//       const values = {};
//       for (let j = 0; j < CURRENCIES.length; j++) {
//         const colIndex = 2 + j; // Start from column C (index 2)
//         const value = parseFloat(row[colIndex]) || 0;
//         values[CURRENCIES[j]] = value;
//       }
      
//       // Also capture the overall exposure (last column)
//       const overallExposure = parseFloat(row[row.length - 1]) || 0;
//       values.overallExposure = overallExposure;
      
//       reportData[matchedKey] = values;
//       console.log(`Extracted data for ${matchedKey}:`, values);
//     }
//   }
  
//   return reportData;
// };

// export const validateReportStructure = (parsedData) => {
//   const errors = [];
  
//   console.log('Validating report structure...');
//   console.log('Metadata:', parsedData.metadata);
//   console.log('Report Data Keys:', Object.keys(parsedData.reportData));
  
//   // Check metadata
//   if (!parsedData.metadata.institutionCode) {
//     errors.push('Institution Code is missing');
//   }
//   if (!parsedData.metadata.financialYear) {
//     errors.push('Financial Year is missing');
//   }
//   if (!parsedData.metadata.startDate) {
//     errors.push('Start Date is missing');
//   }
//   if (!parsedData.metadata.endDate) {
//     errors.push('End Date is missing');
//   }
  
//   // Check if essential data rows exist
//   const essentialRows = [
//     'total_foreign_assets',
//     'total_foreign_liabilities',
//     'net_long_position',
//     'net_short_position',
//     'mid_exchange_rate',
//     'tier1_capital'
//   ];
  
//   for (const row of essentialRows) {
//     if (!parsedData.reportData[row]) {
//       errors.push(`Missing essential data: ${row}`);
//     }
//   }
  
//   console.log('Validation errors:', errors);
  
//   return {
//     isValid: errors.length === 0,
//     errors,
//   };
// };

// export const prepareReportForSubmission = (parsedData) => {
//   return {
//     reportType: 'SINGLE_CURRENCY_EXPOSURE',
//     institutionCode: parsedData.metadata.institutionCode,
//     financialYear: parsedData.metadata.financialYear,
//     startDate: parsedData.metadata.startDate,
//     endDate: parsedData.metadata.endDate,
//     data: parsedData.reportData,
//     currencies: CURRENCIES,
//     uploadedAt: new Date().toISOString(),
//   };
// };

// export const getReportSummary = (reportData) => {
//   const summary = {};
  
//   // Get key metrics
//   const keyMetrics = [
//     'total_foreign_assets',
//     'total_foreign_liabilities',
//     'net_long_position',
//     'net_short_position',
//     'net_open_position',
//     'tier1_capital',
//     'overall_open_position_limit',
//     'net_open_position_ratio_final'
//   ];
  
//   for (const metric of keyMetrics) {
//     if (reportData[metric]) {
//       summary[metric] = reportData[metric];
//     }
//   }
  
//   return summary;
// };