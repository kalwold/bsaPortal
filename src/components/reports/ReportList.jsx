import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const ReportList = ({ reports, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No reports found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {reports.map((report) => (
        <div
          key={report.id}
          className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
          onClick={() => navigate(`/report/${report.id}`)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <p className="text-sm font-medium text-blue-600">
                  {report.title || 'Single Currency Exposure Report'}
                </p>
                <StatusBadge status={report.status} />
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>{report.type}</span>
                <span>•</span>
                <span>{report.department}</span>
                <span>•</span>
                <span>Period: {report.period}</span>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                <span>Uploaded by: {report.uploadedBy}</span>
                <span>•</span>
                <span>{new Date(report.uploadedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <span className="text-sm text-blue-600 hover:text-blue-900">
                View →
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportList;