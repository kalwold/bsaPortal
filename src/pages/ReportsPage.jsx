import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import ReportList from '../components/reports/ReportList';
import { FiSearch } from 'react-icons/fi';

const ReportsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: reports, isLoading } = useQuery({
    //queryKey: ['reports', user?.departmentId, statusFilter],
    queryKey: ['reports', user?.departmentId, statusFilter],
    // queryFn: () => reportService.getReports({
    //   departmentId: user?.departmentId,
    //   status: statusFilter || undefined,
    // }),
    queryFn: () => reportService.getReports(),
    //enabled: !!user,
  });

  const filteredReports = reports?.filter(report => 
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all Single Currency Exposure reports
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <ReportList reports={reports} loading={isLoading} />
      </div>
    </div>
  );
};

export default ReportsPage;