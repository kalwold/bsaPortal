import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import ReportList from '../components/reports/ReportList';

const ReviewPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('pending');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', 'review', filter, user?.departmentId],
    queryFn: () => reportService.getReports({
      departmentId: user?.departmentId,
      status: filter,
      role: 'reviewer',
    }),
    enabled: !!user,
  });

  const filters = [
    { value: 'pending', label: 'Pending' },
    { value: 'review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Review Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve Single Currency Exposure reports submitted by makers
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filter === f.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            {reports?.length || 0} reports
          </div>
        </div>

        <ReportList reports={reports} loading={isLoading} />
      </div>
    </div>
  );
};

export default ReviewPage;