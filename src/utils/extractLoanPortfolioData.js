const extractLoanPortfolioData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;
   let noandtitles = [];
    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if(i === 13){
      noandtitles = [firstCell,secondCell]
      console.log("Found title:", noandtitles);
    }
  }
  console.log('=== Extracting Loan Portfolio Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row) {
      console.log(`Row ${i}:`, row.map(c => String(c || '').trim()));
    }
  }

  // Find the data table start - look for "Code" column
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === 'Code') {
      dataTableStart = i + 1;
      console.log('Found data table at row:', dataTableStart);
      break;
    }
  }

  if (dataTableStart === -1) {
    // Try to find by looking for "1.1" or "Advance on import bills"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      const secondCell = String(row[1] || '').trim();
      if (firstCell === '1.1' || secondCell === 'Advance on import bills') {
        dataTableStart = i;
        console.log('Found data table at row (alt):', dataTableStart);
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: ['Disbursement_Amount', 'Disbursement_Percentage', 'Outstanding_Amount', 'Outstanding_Percentage'], additionalColumns: [],noandtitles };
  }

  const topLevelNodes = [];
  let sectionParent = null;

  // Parse each row
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    // Skip if no description
    if (!description) continue;

    // Skip note rows
    if (description.includes('Note:')) continue;

    // Check if this is a total row
    const isTotalRow = description.includes('Total(sum') || 
                       description.includes('Total(') ||
                       description.includes('Total (sum');

    // Check if this is a section header (2.1, 2.2, etc.)
    const isSectionHeader = code && (code === '2.1' || code === '2.2');

    // Check if this is the main section (1.1 - 1.6)
    const isMainSection = code && code.startsWith('1.');

    // Extract values
    let disbursementAmount = '0';
    let disbursementPercentage = '0';
    let outstandingAmount = '0';
    let outstandingPercentage = '0';

    // Disbursement Amount is in column C (index 2)
    if (row.length > 2) {
      const val = parseFloat(row[2]);
      if (!isNaN(val) && val !== 0) {
        disbursementAmount = val.toFixed(2);
      }
    }

    // Disbursement Percentage is in column D (index 3)
    if (row.length > 3) {
      const val = parseFloat(row[3]);
      if (!isNaN(val) && val !== 0) {
        disbursementPercentage = val.toFixed(2);
      }
    }

    // Outstanding Amount is in column E (index 4)
    if (row.length > 4) {
      const val = parseFloat(row[4]);
      if (!isNaN(val) && val !== 0) {
        outstandingAmount = val.toFixed(2);
      }
    }

    // Outstanding Percentage is in column F (index 5)
    if (row.length > 5) {
      const val = parseFloat(row[5]);
      if (!isNaN(val) && val !== 0) {
        outstandingPercentage = val.toFixed(2);
      }
    }

    // Determine level
    let level = 0;
    if (isMainSection) {
      level = 1;
    } else if (isSectionHeader) {
      level = 0;
    } else if (isTotalRow) {
      level = 0;
    }

    const entry = {
      id: code || ``,
      sNo: code || '',
      label: description,
      values: {
        'Disbursement_Amount': disbursementAmount,
        'Disbursement_Percentage(%)': disbursementPercentage,
        'Outstanding_Amount': outstandingAmount,
        'Outstanding_Percentage(%)': outstandingPercentage
      },
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      isMainSection: isMainSection || false,
      children: []
    };

    if (isMainSection) {
      // Main section items (1.1 - 1.6)
      if (!sectionParent) {
        // Create a section parent if not exists
        sectionParent = {
          id: '1',
          sNo: '1',
          label: 'Loans by Category',
          values: {
            'Disbursement Amount': '0',
            'Disbursement Percentage (%)': '0',
            'Outstanding Amount': '0',
            'Outstanding Percentage (%)': '0'
          },
          rowNumber: dataTableStart,
          level: 0,
          isTotalRow: false,
          isSectionHeader: true,
          isMainSection: false,
          children: []
        };
        topLevelNodes.push(sectionParent);
      }
      sectionParent.children.push(entry);
    } else if (isSectionHeader) {
      // Section headers (2.1, 2.2)
      topLevelNodes.push(entry);
    } else if (isTotalRow) {
      // Total rows - add to the last appropriate parent
      if (sectionParent && entry.label.includes('Total(sum')) {
        sectionParent.children.push(entry);
      } else {
        topLevelNodes.push(entry);
      }
    } else {
      // Other rows
      if (sectionParent) {
        sectionParent.children.push(entry);
      } else {
        topLevelNodes.push(entry);
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

  console.log('Final top-level nodes:', topLevelNodes.length);
  console.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Disbursement_Amount', 'Disbursement_Percentage(%)', 'Outstanding_Amount', 'Outstanding_Percentage(%)'],
    additionalColumns: [],
    noandtitles:noandtitles
  };
};

export default extractLoanPortfolioData