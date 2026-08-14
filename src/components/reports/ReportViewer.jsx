import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportService } from '../../services/reportService';
import StatusBadge from '../common/StatusBadge';
import ReportDataTable from './ReportDataTable';
import { FiArrowLeft, FiDownload, FiCheck, FiX } from 'react-icons/fi';

const ReportViewer = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');

  const { data: report, refetch, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: () => reportService.getReport(reportId),
  });

  const approveMutation = useMutation({
    mutationFn: (data) => reportService.approveReport(reportId, data),
    onSuccess: () => {
      toast.success('Report approved successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve report');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data) => reportService.rejectReport(reportId, data),
    onSuccess: () => {
      toast.success('Report rejected');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject report');
    },
  });

  const handleApprove = () => {
    if (!comment.trim()) {
      toast.error('Please add a comment');
      return;
    }
    approveMutation.mutate({ comment });
  };

  const handleReject = () => {
    if (!comment.trim()) {
      toast.error('Please provide reason for rejection');
      return;
    }
    rejectMutation.mutate({ comment });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
      </div>
    );
  }

  const currencies = report.currencies || ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'DJF', 'KES', 'INR', 'DKK', 'SEK', 'SAR', 'CAD', 'AED', 'AUD', 'CNY', 'NOK', 'KWD'];
  const reportData = report.data || [];

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {report.reportTypeName || 'Daily Foreign Currency Exposure Report'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {report.departmentName || 'Treasury Department'} • {report.reportCode || 'OP001'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Report ID: {report.id} • File: {report.fileName}
              </p>
            </div>
            <StatusBadge status={report.status} />
          </div>
        </div>

        <div className="p-6">
          {/* Metadata Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md mb-6">
            <div>
              <p className="text-sm text-gray-500">Institution Code</p>
              <p className="font-medium">{report.metadata?.institutionCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Financial Year</p>
              <p className="font-medium">{report.metadata?.financialYear || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{report.metadata?.startDate ? new Date(report.metadata.startDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{report.metadata?.endDate ? new Date(report.metadata.endDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <p className="font-medium">{report.metadata?.unit || 'In Thousands'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Uploaded By</p>
              <p className="font-medium">{report.createdBy || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Uploaded At</p>
              <p className="font-medium">{report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{report.status || 'PENDING'}</p>
            </div>
          </div>

          {/* Data Table */}
          {reportData.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Report Data</h3>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <FiDownload className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
              <ReportDataTable data={reportData} currencies={currencies} />
            </div>
          )}

          {/* Approval Actions */}
          {report.status === 'PENDING' && (
            <div className="border-t pt-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {report.role === 'checker' ? 'Review Comment' : 'Approval Comment'}
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add your comments..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                {(report.role === 'checker' || report.role === 'approver') && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={approveMutation.isLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>{approveMutation.isLoading ? 'Approving...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejectMutation.isLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>{rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {report.status === 'APPROVED' && (
            <div className="border-t pt-6">
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-700">
                  ✓ Approved by {report.approvedBy} on {new Date(report.approvedAt).toLocaleString()}
                </p>
                {report.comment && (
                  <p className="text-sm text-green-600 mt-1">Comment: {report.comment}</p>
                )}
              </div>
            </div>
          )}

          {report.status === 'REJECTED' && (
            <div className="border-t pt-6">
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">
                  ✗ Rejected by {report.rejectedBy} on {new Date(report.rejectedAt).toLocaleString()}
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


// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import { reportService } from '../../services/reportService';
// import StatusBadge from '../common/StatusBadge';
// import { FiArrowLeft, FiDownload, FiCheck, FiX } from 'react-icons/fi';

// const ReportViewer = () => {
//   const { reportId } = useParams();
//   const navigate = useNavigate();
//   const [comment, setComment] = useState('');

//   const { data: report, refetch, isLoading } = useQuery({
//     queryKey: ['report', reportId],
//     queryFn: () => reportService.getReport(reportId),
//   });

//   const approveMutation = useMutation({
//     mutationFn: (data) => reportService.approveReport(reportId, data),
//     onSuccess: () => {
//       toast.success('Report approved successfully!');
//       refetch();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to approve report');
//     },
//   });

//   const rejectMutation = useMutation({
//     mutationFn: (data) => reportService.rejectReport(reportId, data),
//     onSuccess: () => {
//       toast.success('Report rejected');
//       refetch();
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to reject report');
//     },
//   });

//   const handleApprove = () => {
//     if (!comment.trim()) {
//       toast.error('Please add a comment');
//       return;
//     }
//     approveMutation.mutate({ comment });
//   };

//   const handleReject = () => {
//     if (!comment.trim()) {
//       toast.error('Please provide reason for rejection');
//       return;
//     }
//     rejectMutation.mutate({ comment });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!report) {
//     return (
//       <div className="text-center py-12">
//         <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto">
//       <button
//         onClick={() => navigate(-1)}
//         className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
//       >
//         <FiArrowLeft className="w-4 h-4 mr-2" />
//         Back
//       </button>

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="p-6 border-b">
//           <div className="flex justify-between items-start">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {report.title || 'Single Currency Exposure Report'}
//               </h2>
//               <p className="text-sm text-gray-500 mt-1">
//                 {report.department} • {report.type}
//               </p>
//             </div>
//             <StatusBadge status={report.status} />
//           </div>
//         </div>

//         <div className="p-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md mb-6">
//             <div>
//               <p className="text-sm text-gray-500">Institution Code</p>
//               <p className="font-medium">{report.institutionCode || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Financial Year</p>
//               <p className="font-medium">{report.financialYear || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Period</p>
//               <p className="font-medium">{report.period || 'N/A'}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Uploaded By</p>
//               <p className="font-medium">{report.uploadedBy}</p>
//             </div>
//           </div>

//           {report.data && (
//             <div className="mb-6">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-lg font-medium">Report Data</h3>
//                 <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
//                   <FiDownload className="w-4 h-4 mr-1" />
//                   Export
//                 </button>
//               </div>
//               <div className="overflow-x-auto border rounded-md max-h-96 overflow-y-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Particulars
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         USD
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         EUR
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Others
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {Object.entries(report.data).slice(0, 15).map(([key, values]) => (
//                       <tr key={key} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 text-sm text-gray-900 capitalize">
//                           {key.replace(/_/g, ' ')}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-900">
//                           {values.USD || 0}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-900">
//                           {values.EUR || 0}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-900">
//                           {values.overallExposure || 0}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {report.status === 'pending' && (
//             <div className="border-t pt-6">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   {report.role === 'checker' ? 'Review Comment' : 'Approval Comment'}
//                 </label>
//                 <textarea
//                   rows={3}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   placeholder="Add your comments..."
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                 />
//               </div>

//               <div className="flex justify-end space-x-3">
//                 {(report.role === 'checker' || report.role === 'approver') && (
//                   <>
//                     <button
//                       onClick={handleApprove}
//                       disabled={approveMutation.isLoading}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
//                     >
//                       <FiCheck className="w-4 h-4" />
//                       <span>{approveMutation.isLoading ? 'Approving...' : 'Approve'}</span>
//                     </button>
//                     <button
//                       onClick={handleReject}
//                       disabled={rejectMutation.isLoading}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
//                     >
//                       <FiX className="w-4 h-4" />
//                       <span>{rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}</span>
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {report.status === 'approved' && (
//             <div className="border-t pt-6">
//               <div className="bg-green-50 p-4 rounded-md">
//                 <p className="text-green-700">
//                   ✓ Approved by {report.approvedBy} on {new Date(report.approvedAt).toLocaleString()}
//                 </p>
//                 {report.comment && (
//                   <p className="text-sm text-green-600 mt-1">Comment: {report.comment}</p>
//                 )}
//               </div>
//             </div>
//           )}

//           {report.status === 'rejected' && (
//             <div className="border-t pt-6">
//               <div className="bg-red-50 p-4 rounded-md">
//                 <p className="text-red-700">
//                   ✗ Rejected by {report.rejectedBy} on {new Date(report.rejectedAt).toLocaleString()}
//                 </p>
//                 {report.comment && (
//                   <p className="text-sm text-red-600 mt-1">Reason: {report.comment}</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportViewer;