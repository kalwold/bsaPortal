import * as XLSX from 'xlsx';

// Currency columns in the report
const CURRENCIES = ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'DJF', 'KES', 'INR', 'DKK', 'SEK', 'SAR', 'CAD', 'AED', 'AUD', 'CNY', 'NOK', 'KWD'];

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

        // Extract all metadata including title
        const metadata = extractMetadata(jsonData);
        console.log('Extracted Metadata:', metadata);

        // Extract hierarchical data with S/No
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
    reportTitle: '',
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

    if (firstCell.includes('Daily Foreign Currency Exposure') || 
        firstCell.includes('Foreign Currency Exposure')) {
      metadata.reportTitle = firstCell;
    }

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

    if (firstCell.includes('In Thousands')) {
      metadata.unit = 'In Thousands';
    }
  }

  if (!metadata.reportTitle) metadata.reportTitle = 'Daily Foreign Currency Exposure Reports';
  if (!metadata.institutionCode) metadata.institutionCode = 'E023100202605';
  if (!metadata.financialYear) metadata.financialYear = '2026';
  if (!metadata.startDate) metadata.startDate = new Date().toISOString();
  if (!metadata.endDate) metadata.endDate = new Date().toISOString();

  return metadata;
};

const extractHierarchicalData = (data) => {
  const result = [];
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
  let currentParent = null;
  let currentLevel = 0;

  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const sNo = String(row[0] || '').trim();
    const label = String(row[1] || '').trim();
    
    // Skip empty rows or rows without S/No
    if (!label || !sNo) continue;

    // Check if this is a section header (no S/No or empty S/No)
    const isSectionHeader = label.includes('Foreign Currency Assets') || 
                           label.includes('Foreign Currency Liabilities') ||
                           label.includes('Foreign Exhange Position') ||
                           label.includes('Overall Foreign Exhange Position');

    // Check if this is a total row
    const isTotalRow = label.includes('Total Foreign Assets') || 
                       label.includes('Total Foreign Liabilities');

    // Extract values for each currency
    const values = {};
    for (let j = 0; j < CURRENCIES.length; j++) {
      const colIndex = 2 + j;
      const value = parseFloat(row[colIndex]);
      values[CURRENCIES[j]] = !isNaN(value) ? value : null;
    }

    // Determine the level based on S/No format
    let level = 0;
    if (sNo) {
      const parts = sNo.split('.');
      level = parts.length;
    }

    const entry = {
      id: sNo || `row-${i}`,
      sNo: sNo || '',
      label: label,
      values: values,
      rowNumber: i + 1,
      level: level,
      isSectionHeader: isSectionHeader,
      isTotalRow: isTotalRow,
      children: []
    };

    if (level === 0 || isSectionHeader) {
      // Top level or section header
      result.push(entry);
      currentParent = entry;
      currentLevel = 0;
    } else if (level === 1) {
      // Second level - add to top level
      const parent = findParentByLevel(result, 0);
      if (parent) {
        parent.children.push(entry);
        currentParent = entry;
      } else {
        result.push(entry);
      }
    } else if (level === 2) {
      // Third level - add to second level
      const parent = findParentByLevel(result, 1);
      if (parent) {
        parent.children.push(entry);
        currentParent = entry;
      } else if (currentParent) {
        currentParent.children.push(entry);
      } else {
        result.push(entry);
      }
    } else {
      // Deeper levels or fallback
      if (currentParent) {
        currentParent.children.push(entry);
      } else if (result.length > 0) {
        result[result.length - 1].children.push(entry);
      } else {
        result.push(entry);
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

const findParentByLevel = (nodes, targetLevel) => {
  for (const node of nodes) {
    if (node.level === targetLevel) {
      return node;
    }
    if (node.children) {
      const found = findParentByLevel(node.children, targetLevel);
      if (found) return found;
    }
  }
  return null;
};

const flattenData = (nodes) => {
  const result = [];
  const traverse = (nodes, parentId = null) => {
    nodes.forEach(node => {
      const flatNode = {
        id: node.id,
        sNo: node.sNo || '',
        label: node.label,
        values: node.values || {},
        rowNumber: node.rowNumber,
        level: node.level || 0,
        isSectionHeader: node.isSectionHeader || false,
        isTotalRow: node.isTotalRow || false,
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
  if (!parsedData.metadata.reportTitle) {
    errors.push('Report Title is missing');
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