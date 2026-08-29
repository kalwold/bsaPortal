const extractNplProvisionsData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

    let noandtitles = [];



  // =====================================================
  // 1. Extract title information
  // =====================================================
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 13) {
      noandtitles = [firstCell, secondCell];
      console.log("Found title:", noandtitles);
    }
  }
  console.log('=== Extracting NPL & Provisions Data ===');

  // Log first few rows to understand structure
  for (let i = 0; i < Math.min(data.length, 15); i++) {
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
    // Try to find by looking for "Total non-performing loans"
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === '1') {
        const secondCell = String(row[1] || '').trim();
        if (secondCell && secondCell.includes('Total non-performing loans')) {
          dataTableStart = i;
          console.log('Found data table at row (alt):', dataTableStart);
          break;
        }
      }
    }
  }

  if (dataTableStart === -1) {
    console.log('Could not find data table');
    return { hierarchicalData: [], columns: ['Amount'], additionalColumns: [] };
  }

  // Get the header row
  const headerRow = data[dataTableStart - 1];
  console.log('Header row:', headerRow.map(c => String(c || '').trim()));

  // Find the value column (column C = index 2)
  const valueColumnIndex = 2;

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
    if (description.includes('Note:') || description.includes('Note')) continue;

    // Check if this is a total row
    const isTotalRow = description === 'Total non-performing loans (sum 2-4)' ||
                       description === 'Total substandard loans' ||
                       description === 'Total doubtful loans' ||
                       description === 'Total loss loans';

    // Check if this is a section header (like 2, 3, 4)
    const isSectionHeader = code && (code === '2' || code === '3' || code === '4');

    // Extract the value
    let value = '0';
    if (valueColumnIndex < row.length) {
      const rawValue = parseFloat(row[valueColumnIndex]);
      if (!isNaN(rawValue) && rawValue !== 0) {
        value = rawValue.toFixed(2);
      } else {
        value = '0';
      }
    }

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
      values: {
        'Amount': value
      },
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
      // Rows without code are usually subtotals
      if (isTotalRow) {
        if (description.includes('Total substandard loans')) {
          const parent = nodeMap.get('2');
          if (parent) {
            parent.children.push(entry);
            console.log(`Added ${description} as child of 2`);
          } else {
            topLevelNodes.push(entry);
          }
        } else if (description.includes('Total doubtful loans')) {
          const parent = nodeMap.get('3');
          if (parent) {
            parent.children.push(entry);
            console.log(`Added ${description} as child of 3`);
          } else {
            topLevelNodes.push(entry);
          }
        } else if (description.includes('Total loss loans')) {
          const parent = nodeMap.get('4');
          if (parent) {
            parent.children.push(entry);
            console.log(`Added ${description} as child of 4`);
          } else {
            topLevelNodes.push(entry);
          }
        } else if (description.includes('Total non-performing loans')) {
          const parent = nodeMap.get('1');
          if (parent) {
            parent.children.push(entry);
            console.log(`Added ${description} as child of 1`);
          } else {
            topLevelNodes.push(entry);
          }
        } else {
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
    
    if (codeParts.length === 1) {
      // Top level nodes (1, 2, 3, 4)
      const existing = topLevelNodes.find(n => n.id === code);
      if (!existing) {
        topLevelNodes.push(node);
        console.log(`Added top-level node: ${code} - ${node.label}`);
      }
    } else if (codeParts.length > 1) {
      // Child nodes (2.1, 2.2, etc.)
      const parentCode = codeParts.slice(0, -1).join('.');
      const parent = nodeMap.get(parentCode);
      
      if (parent) {
        const exists = parent.children.some(child => child.id === node.id);
        if (!exists) {
          parent.children.push(node);
          console.log(`Added node ${code} as child of ${parentCode}`);
        }
      } else {
        // Try to find parent by base code
        const baseCode = codeParts[0];
        const baseParent = nodeMap.get(baseCode);
        if (baseParent) {
          const exists = baseParent.children.some(child => child.id === node.id);
          if (!exists) {
            baseParent.children.push(node);
            console.log(`Added node ${code} as child of ${baseCode} (fallback)`);
          }
        } else {
          // If still no parent, add to top level
          topLevelNodes.push(node);
          console.log(`Added node ${code} as top-level (no parent found)`);
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

  console.log('Final top-level nodes:', topLevelNodes.length);
  console.log('Top-level nodes:', topLevelNodes.map(n => n.sNo + ' - ' + n.label));

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Amount'],
    additionalColumns: [],
    noandtitles
  };
};
export default extractNplProvisionsData