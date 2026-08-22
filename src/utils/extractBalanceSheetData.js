const extractBalanceSheetData = (data) => {
  const hierarchicalData = [];
  let dataTableStart = -1;

  let noandtitles = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const firstCell = String(row[0] || "").trim();
    const secondCell = String(row[1] || "").trim();

    if (i === 12) {
      noandtitles = [firstCell, secondCell];
      console.log("Found title:", noandtitles);
    }
  }

  // Find the data table start
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();
    if (firstCell === 'Code' || secondCell === 'Description') {
      dataTableStart = i + 1;
      break;
    }
  }

  if (dataTableStart === -1) {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0] || '').trim();
      if (firstCell === 'ASSETS') {
        dataTableStart = i + 1;
        break;
      }
    }
  }

  if (dataTableStart === -1) {
    return { hierarchicalData: [], columns: ['Current_Month'], additionalColumns: [] };
  }

  const topLevelNodes = [];
  const nodeMap = new Map();
  let currentParent = null;
  let assetsNode = null;
  let liabilitiesNode = null;

  // Find value column
  let valueColumnIndex = -1;
  const headerRow = data[dataTableStart - 1];
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] || '').trim();
    if (cell === 'Current Month' || cell === 'Current Month ' || cell.includes('Current')) {
      valueColumnIndex = i;
      break;
    }
  }
  if (valueColumnIndex === -1) valueColumnIndex = 2;

  // Parse the data
  for (let i = dataTableStart; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const code = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();

    if (!description) continue;

    // === IDENTIFY SECTION HEADERS ===
    const isAssetsSection = description === 'ASSETS';
    const isLiabilitiesSection = description === 'LIABILITIES & CAPITAL';
    const isSectionHeader = isAssetsSection || isLiabilitiesSection;

    // === IDENTIFY TOTAL ROWS ===
    const isTotalRow = description.includes('TOTAL ASSETS') || 
                       description.includes('TOTAL LIABILITIES AND NET WORTH') ||
                       description.includes('NON-FINANCIAL ASSETS')||
                       description.includes('TOTAL LIABILITIES');

    // Extract value
    let value = null;
    if (valueColumnIndex < row.length) {
      const rawValue = parseFloat(row[valueColumnIndex]);
      if (!isNaN(rawValue) && rawValue !== 0) {
        value = rawValue;
      }
    }

    // Determine level
    let level = 0;
    if (code && code !== '') {
      const codeParts = code.split('.');
      level = codeParts.length;
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
        'Current_Month': value !== null ? value.toFixed(2) : '0'
      },
      rowNumber: i + 1,
      level: level,
      isTotalRow: isTotalRow || false,
      isSectionHeader: isSectionHeader || false,
      isAssetsSection: isAssetsSection || false,
      isLiabilitiesSection: isLiabilitiesSection || false,
      children: []
    };

    if (code) {
      nodeMap.set(code, entry);
    }

    // === BUILD HIERARCHY ===
    if (!code) {
      if (isAssetsSection) {
        // ASSETS section - top level
        topLevelNodes.push(entry);
        assetsNode = entry;
        currentParent = entry;
        console.log('Added ASSETS section:', entry.label);
      } else if (isLiabilitiesSection) {
        // LIABILITIES & CAPITAL section - top level
        topLevelNodes.push(entry);
        liabilitiesNode = entry;
        currentParent = entry;
        console.log('Added LIABILITIES & CAPITAL section:', entry.label);
      } else if (isTotalRow) {
        // Total rows - add to appropriate parent
        if (description.includes('TOTAL ASSETS') && assetsNode) {
          assetsNode.children.push(entry);
          console.log('Added TOTAL ASSETS to ASSETS section');
        } else if (description.includes('TOTAL LIABILITIES') && liabilitiesNode) {
          liabilitiesNode.children.push(entry);
          console.log('Added TOTAL LIABILITIES to LIABILITIES section');
        } else {
          topLevelNodes.push(entry);
          console.log('Added total row as top-level:', entry.label);
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

  // === BUILD HIERARCHY FOR CODED NODES ===
  for (const [code, node] of nodeMap) {
    const codeParts = code.split('.');
    
    if (codeParts.length === 1) {
      // Top level codes (1, 2, 3, ...)
      // Find the appropriate parent section (ASSETS or LIABILITIES)
      const codeNum = parseInt(codeParts[0]);
      let parentSection = null;
      
      if (codeNum >= 1 && codeNum <= 12) {
        // Codes 1-12 belong to ASSETS
        parentSection = assetsNode;
      } else if (codeNum >= 13 && codeNum <= 22) {
        // Codes 13-22 belong to LIABILITIES & CAPITAL
        parentSection = liabilitiesNode;
      }

      if (parentSection) {
        const exists = parentSection.children.some(child => child.id === code);
        if (!exists) {
          parentSection.children.push(node);
          console.log(`Added node ${code} to ${parentSection.label}`);
        }
      } else {
        const existing = topLevelNodes.find(n => n.id === code);
        if (!existing) {
          topLevelNodes.push(node);
          console.log(`Added node ${code} as top-level (no parent found)`);
        }
      }
    } else if (codeParts.length > 1) {
      // Child nodes (1.1, 1.1.1, etc.)
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
        }
      }
    }
  }

  // === SORT CHILDREN ===
  const sortChildren = (nodes) => {
    nodes.sort((a, b) => {
      // Put total rows at the end
      console.log('description total', a)
      if ((a.isTotalRow && !b.isTotalRow)&& a.label.includes('TOTAL LIABILITIES AND NET WORTH')) return 1;
      if ((!a.isTotalRow && b.isTotalRow)&& b.label.includes('TOTAL LIABILITIES AND NET WORTH'))return -1;
      
      // Sort by S/No
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

  // === CLEAN UP ===
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

  console.log('Final hierarchy:', JSON.stringify(topLevelNodes, null, 2));

  return {
    hierarchicalData: topLevelNodes,
    columns: ['Current_Month'],
    additionalColumns: [],
    noandtitles: noandtitles
  };
};

export default extractBalanceSheetData;