import React from 'react';

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { label: 'Pending', className: 'status-badge-pending' },
    review: { label: 'In Review', className: 'status-badge-review' },
    approved: { label: 'Approved', className: 'status-badge-approved' },
    rejected: { label: 'Rejected', className: 'status-badge-rejected' },
  };

  const { label, className } = statusMap[status?.toLowerCase()] || statusMap.pending;

  return <span className={`status-badge ${className}`}>{label}</span>;
};

export default StatusBadge;