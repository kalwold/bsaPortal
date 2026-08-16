import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportService } from '../../services/reportService';
import StatusBadge from '../common/StatusBadge';
import ReportDataTable from './ReportDataTable';
import { FiArrowLeft, FiDownload, FiCheck, FiX, FiFileText, FiCalendar, FiHash } from 'react-icons/fi';
import { BsFillBuildingFill } from 'react-icons/bs';

const ReportViewer = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [comment, setComment] = useState('');

  // Try to get report from location state (passed from navigation)
  const locationReport = location.state?.report;

  // If report is not in location state, fetch it from API
  // const { data: fetchedReport, refetch, isLoading } = useQuery({
  //   queryKey: ['report', reportId],
  //   queryFn: () => reportService.getReport(reportId),
  //   enabled: !locationReport, // Only fetch if not passed via location
  // });

  // Use location report if available, otherwise use fetched report
  // const report = locationReport || fetchedReport;
  const report = locationReport;

  const approveMutation = useMutation({
       mutationFn: (data) => {
      // Use report type from the report data
      const reportType = report?.reportTypeId || report?.metadata?.reportType || 'ibd-daily';
      return reportService.approveReport(reportType, data);
    },
    onSuccess: () => {
      toast.success('Report approved successfully!');
      navigate(-1)
      // refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve report');
    },
  });

  const rejectMutation = useMutation({
       mutationFn: (data) => {
      // Use report type from the report data
      const reportType = report?.reportTypeId || report?.metadata?.reportType ;
      return reportService.rejectReport(reportType, data);
    },
    onSuccess: () => {
      toast.success('Report rejected');
      navigate(-1)
      // refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject report');
    },
  });

  const handleApprove = () => {
     const approver = "system";
    const approvalData = {
      id: report.id || reportId,
      approver: approver
    };

    console.log('Approval Data:', approvalData);
    console.log('Report Type:', report?.reportTypeId || report?.metadata?.reportType);
    approveMutation.mutate({ 
      id: report.id || reportId,
      approver: approver
     });
  };

  const handleReject = () => {
     const approver = "system";
    if (!comment.trim()) {
      toast.error('Please provide reason for rejection');
      return;
    }
     const rejectionData = {
      id: report.id || reportId,
      approver: approver,
      rejectReason: comment.trim()
    };

    console.log('Rejection Data:', rejectionData);
    console.log('Report Type:', report?.reportTypeId || report?.metadata?.reportType);
    rejectMutation.mutate(rejectionData);
  };

  // Show loading only if we don't have location data and are fetching
  // if (isLoading && !locationReport) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[#48198B] hover:text-blue-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currencies = report.currencies || ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'DJF', 'KES', 'INR', 'DKK', 'SEK', 'SAR', 'CAD', 'AED', 'AUD', 'CNY', 'NOK', 'KWD'];
  const reportData = report.data || [];
  const metadata = report.metadata || {};

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Back to Reports
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Report Header with Title */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiFileText className="w-6 h-6 text-[#48198B]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {metadata.reportTitle || report.reportTypeName || 'Daily Foreign Currency Exposure Reports'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.departmentName || 'Treasury Department'} • {report.reportCode || 'OP001'}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span>Report ID: {report.id}</span>
                <span className="w-px h-4 bg-gray-300"></span>
                <span>File: {report.fileName}</span>
                <span className="w-px h-4 bg-gray-300"></span>
                <span>Version: 1.0</span>
                {locationReport && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    Cached
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge status={report.status} />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Institution Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-1">
                <BsFillBuildingFill className="w-4 h-4 text-blue-500" />
                <p className="text-xs text-gray-500 uppercase tracking-wider">Institution Code</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{metadata.institutionCode || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-1">
                <FiHash className="w-4 h-4 text-green-500" />
                <p className="text-xs text-gray-500 uppercase tracking-wider">Financial Year</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{metadata.financialYear || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-1">
                <FiCalendar className="w-4 h-4 text-purple-500" />
                <p className="text-xs text-gray-500 uppercase tracking-wider">Start Date</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {metadata.startDate ? new Date(metadata.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 mb-1">
                <FiCalendar className="w-4 h-4 text-red-500" />
                <p className="text-xs text-gray-500 uppercase tracking-wider">End Date</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {metadata.endDate ? new Date(metadata.endDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Additional Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg mb-6">
            <div>
              <p className="text-xs text-gray-500">Unit</p>
              <p className="text-sm font-medium text-gray-700">{metadata.unit || 'In Thousands'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Template ID</p>
              <p className="text-sm font-medium text-gray-700">{metadata.templateId || 'OP001'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Report Type</p>
              <p className="text-sm font-medium text-gray-700">{report.reportTypeId || 'ibd-daily'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded By</p>
              <p className="text-sm font-medium text-gray-700">{report.createdBy || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Uploaded At</p>
              <p className="text-sm font-medium text-gray-700">
                {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Data Table */}
          {reportData.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Data</h3>
                  <p className="text-xs text-gray-500">Click on rows with arrow icons to expand/collapse nested data</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">
                    {reportData.length} sections • {currencies.length} currencies
                  </span>
                  <button className="flex items-center text-sm text-[#48198B] hover:text-blue-800 transition-colors px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <FiDownload className="w-4 h-4 mr-1" />
                    Export
                  </button>
                </div>
              </div>
              <ReportDataTable 
  data={reportData} 
  currencies={currencies} 
  additionalColumns={report.additionalColumns}
  showSNo={true} 
/>
            </div>
          )}

          {/* Approval Actions */}
          {report.status === 'PENDING' && (
            <div className="border-t pt-6 mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* {report.role === 'checker' ? 'Review Comment' : 'Approval Comment'} */}
                  Reject Reason
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add your reason..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                {/* {(report.role === 'checker' || report.role === 'approver') && ( */}
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={approveMutation.isLoading}
                      className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>{approveMutation.isLoading ? 'Approving...' : 'Approve Report'}</span>
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejectMutation.isLoading}
                      className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                      <span>{rejectMutation.isLoading ? 'Rejecting...' : 'Reject Report'}</span>
                    </button>
                  </>
                {/* )} */}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {report.status === 'APPROVED' && (
            <div className="border-t pt-6 mt-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-700 font-medium">
                  ✓ Approved by {report.approvedBy} 
                </p>
                {report.comment && (
                  <p className="text-sm text-green-600 mt-1">Comment: {report.comment}</p>
                )}
              </div>
            </div>
          )}

          {report.status === 'REJECTED' && (
            <div className="border-t pt-6 mt-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-700 font-medium">
                  ✗ Rejected by {report.rejectedBy} 
                </p>
                {report.comment && (
                  <p className="text-sm text-red-600 mt-1">Reason: {report.comment}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;