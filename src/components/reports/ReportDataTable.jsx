import React, { useState ,useEffect} from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const ReportDataTable = ({

  data,
  currencies,
  additionalColumns = ['OTHER1', 'OTHER2', 'OTHER3', 'OVERALL_EXPOSURE'],
  showSNo = true
}) => {
  const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => {
    console.log('ReportDataTable received data:', data);
    if (data && data.length > 0) {
      console.log('First node:', data[0]);
      console.log('First node values keys:', Object.keys(data[0].values || {}));
    }
  }, [data]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderRow = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows[node.id];
    const isSectionHeader = node.isSectionHeader;
    const isTotalRow = node.isTotalRow;

    // Determine row styling
    let rowClass = 'hover:bg-gray-50';
    if (isSectionHeader) {
      rowClass = 'bg-blue-50 hover:bg-blue-100 font-semibold';
    } else if (isTotalRow) {
      rowClass = 'bg-yellow-50 hover:bg-yellow-100 font-bold';
    } else if (level === 0) {
      rowClass = 'bg-gray-50 hover:bg-gray-100 font-medium';
    }

   
    // Check if there are additional column values
    const hasAdditionalValues = additionalColumns.some(col =>
      node.values && node.values[col] !== null && node.values[col] !== undefined
    );

    return (
      <React.Fragment key={node.id}>
        <tr className={`${rowClass} transition-colors`}>
          {showSNo && (
            <td className="px-3 py-2 text-sm text-gray-600 text-center font-mono border border-gray-300">
              {node.id || '-'}
            </td>
          )}
          <td className="px-4 py-2 text-sm border border-gray-300">
            <div 
              className="flex items-center cursor-pointer hover:text-blue-600"
              style={{ paddingLeft: `${level * 20}px` }}
              onClick={() => hasChildren && toggleRow(node.id)}
            >
              {hasChildren && (
                <span className="mr-2 text-gray-400 hover:text-blue-500 transition-colors">
                  {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                </span>
              )}
              {!hasChildren && level > 0 && (
                <span className="mr-2 w-4"></span>
              )}
              <span className={`${isSectionHeader ? 'text-blue-700' : ''} ${isTotalRow ? 'text-yellow-700' : ''}`}>
                {node.label}
              </span>
            </div>
          </td>
          {currencies.map(currency => (
            <td key={currency} className="px-4 py-2 text-sm text-right font-mono border border-gray-300">
              {node.values && node.values[currency] !== null && node.values[currency] !== undefined ? (
                <span className={`${isTotalRow ? 'font-bold text-yellow-700' : ''}`}>
                  {node.values[currency].toLocaleString()}
                </span>
              ) : (
                <span className="text-gray-300">-</span>
              )}
            </td>
          ))}
          {/* Additional Columns: O1, O2, O3, OVERALL_EXPOSURE */}
          {additionalColumns.map(col => (
            <td key={col} className="px-4 py-2 text-sm text-right font-mono border-l border-gray-200">
              {node.values && node.values[col] !== null && node.values[col] !== undefined ? (
                <span className={`${col === 'OVERALL_EXPOSURE' ? 'font-bold text-purple-700' : 'text-blue-600'}`}>
                  {node.values[col].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-gray-300">-</span>
              )}
            </td> 
          ))}
        </tr>
        {hasChildren && isExpanded && (
          <React.Fragment>
            {node.children.map(child => renderRow(child, level + 1))}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };

   const allColumns = [...currencies, ...additionalColumns];
  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full  border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {showSNo && (
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                S/No
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Particulars
            </th>
            {currencies.map(currency => (
              <th key={currency} className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">
                {currency}
              </th>
            ))}
                        {/* Additional Column Headers */}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">
              OTHER1
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">
              OTHER2
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">
              OTHER3
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-purple-700 uppercase tracking-wider border-l-2 border-gray-300 bg-purple-50">
              Overall Exposure
            </th>
          </tr> 
          
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 ">
          {data && data.length > 0 ? (
            data.map(node => renderRow(node, 0))
          ) : (
            <tr>
              <td colSpan={allColumns.length + (showSNo ? 2 : 1)} className="px-4 py-8 text-center text-gray-500 border border--300">  
                No data available
              </td>
            </tr> 
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDataTable;