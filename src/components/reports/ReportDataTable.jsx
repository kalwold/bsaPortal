import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

const ReportDataTable = ({ data, currencies }) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderRow = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows[node.id];
    const hasValues = node.values && Object.values(node.values).some(v => v !== null && v !== undefined);

    return (
      <React.Fragment key={node.id}>
        <tr className={level === 0 ? 'bg-gray-50' : ''}>
          <td className="px-4 py-2 text-sm">
            <div 
              className="flex items-center cursor-pointer hover:text-blue-600"
              style={{ paddingLeft: `${level * 20}px` }}
              onClick={() => hasChildren && toggleRow(node.id)}
            >
              {hasChildren && (
                <span className="mr-2 text-gray-400">
                  {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                </span>
              )}
              <span className={level === 0 ? 'font-semibold' : ''}>
                {node.label}
              </span>
            </div>
          </td>
          {currencies.map(currency => (
            <td key={currency} className="px-4 py-2 text-sm text-right">
              {node.values && node.values[currency] !== null && node.values[currency] !== undefined ? (
                <span className={level === 0 ? 'font-semibold' : ''}>
                  {node.values[currency].toLocaleString()}
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

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Particulars
            </th>
            {currencies.map(currency => (
              <th key={currency} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {currency}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map(node => renderRow(node, 0))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportDataTable;