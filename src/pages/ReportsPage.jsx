import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { reportService, DEPARTMENT_DATA } from '../services/reportService';
import ReportList from '../components/reports/ReportList';
import { FiSearch } from 'react-icons/fi';

const ReportsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // const { data: reports, isLoading } = useQuery({
  //   //queryKey: ['reports', user?.departmentId, statusFilter],
  //   queryKey: ['reports', user?.departmentId, statusFilter],
  //   // queryFn: () => reportService.getReports({
  //   //   departmentId: user?.departmentId,
  //   //   status: statusFilter || undefined,
  //   // }),
  //   queryFn: () =>  reportService.getReports(
  //           'ibd-daily'
  //         ),
  //   //enabled: !!user,
  // });

 const {
    data: reports = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dashboardReports'],

    queryFn: async () => {
      // Get every report type from every department
      const reportTypes = DEPARTMENT_DATA.flatMap((department) =>
        department.reportTypes.map((reportType) => ({
          ...reportType,
          departmentId: department.id,
          departmentName: department.name,
        }))
      );

      console.log('Report Types:', reportTypes);

      // Fetch all report types at the same time
      const results = await Promise.all(
        reportTypes.map(async (reportType) => {
          try {
            const response = await reportService.getReports(
              reportType.id
            );

            // Make sure response is an array
            const reports = Array.isArray(response)
              ? response
              : [];

            return reports.map((report) => ({
              ...report,

              // Report information
              reportTypeId: reportType.id,
              reportTypeName: reportType.name,

              // Department information
              departmentId: reportType.departmentId,
              departmentName: reportType.departmentName,
            }));
          } catch (err) {
            console.error(
              `Failed to load ${reportType.id}:`,
              err
            );

            // Don't fail the entire dashboard
            // if one report type fails
            return [];
          }
        })
      );

      const allReports = results.flat();

      console.log('All Reports:', allReports);

      return allReports;
    },

    staleTime: 5 * 60 * 1000,
  });
  console.log("reports:", reports);
  const filteredReports = reports?.filter(report => 
   ( report.reportTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportTypeId?.toLowerCase().includes(searchTerm.toLowerCase()) ) &&
    report.status?.toLowerCase().includes(statusFilter.toLowerCase())
  );

  console.log("reports:", reports);
console.log("searchTerm:", searchTerm, statusFilter);
console.log("filteredReports:", filteredReports);
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <ReportList reports={filteredReports} loading={isLoading} />
      </div>
    </div>
  );
};

export default ReportsPage;