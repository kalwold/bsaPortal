import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportService } from '../../services/reportService';
import { 
  parseExcelReport, 
  validateReportStructure, 
  prepareReportForSubmission 
} from '../../utils/excelParser';
import ReportDataTable from './ReportDataTable';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';

const ReportUpload = ({ departmentId, reportType, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  const uploadMutation = useMutation({
    mutationFn: (formData) => reportService.uploadReport(formData),
    onSuccess: (data) => {
      toast.success('Report uploaded successfully!');
      setSelectedFile(null);
      setParsedData(null);
      setValidationErrors([]);
      setUploadProgress(0);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    },
  });

  const handleFileChange = async (file) => {
    if (!file) return;

    try {
      setValidationErrors([]);
      
      const parsed = await parseExcelReport(file);
      console.log('Parsed report:', parsed);
      
      const validation = validateReportStructure(parsed);
      console.log('Validation result:', validation);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        toast.error(`Validation failed:\n${validation.errors.join('\n')}`);
        setSelectedFile(null);
        return;
      }

      setParsedData(parsed);
      setSelectedFile(file);
      toast.success('File validated successfully!');
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error(`Error parsing file: ${error.message}`);
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !parsedData) {
      toast.error('Please select a valid file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('departmentId', departmentId);
    formData.append('reportType', reportType);
    
    const reportData = prepareReportForSubmission(parsedData);
    formData.append('reportData', JSON.stringify(reportData));

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(formData, {
      onSettled: () => {
        clearInterval(interval);
        setUploadProgress(100);
      },
    });
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileChange(file);
    } else {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
    }
  };

  const currencies = parsedData?.currencies || ['USD', 'EUR', 'CHF', 'GBP', 'JPY', 'DJF', 'KES', 'INR', 'DKK', 'SEK', 'SAR', 'CAD', 'AED', 'AUD', 'CNY', 'NOK', 'KWD'];
  const reportData = parsedData?.data || [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-6">
        {/* Department and Report Type Info */}
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-xs text-blue-600">Department</p>
              <p className="text-sm font-medium text-gray-900">
                {departmentId?.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>
            <div className="w-px h-8 bg-blue-200"></div>
            <div>
              <p className="text-xs text-blue-600">Report Type</p>
              <p className="text-sm font-medium text-gray-900">
                {reportType?.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
            <ul className="list-disc list-inside text-sm text-red-700">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="space-y-4">
            <FiUpload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
                  Upload Excel File
                </span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="sr-only"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                or drag and drop • XLSX or XLS up to 10MB
              </p>
            </div>
          </div>
        </div>

        {selectedFile && (
          <div className="bg-green-50 p-4 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiFile className="text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-medium">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setParsedData(null);
                setValidationErrors([]);
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Preview Data Table */}
        {parsedData && reportData.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Data Preview</h4>
            <div className="max-h-96 overflow-y-auto">
              <ReportDataTable data={reportData} currencies={currencies} />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Showing hierarchical data structure with {reportData.length} main sections
            </p>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setParsedData(null);
              setValidationErrors([]);
              setUploadProgress(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploadMutation.isLoading || validationErrors.length > 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploadMutation.isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportUpload;

// import React, { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import { reportService } from '../../services/reportService';
// import { 
//   parseExcelReport, 
//   validateReportStructure, 
//   prepareReportForSubmission,
//   getReportSummary 
// } from '../../utils/excelParser';
// import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';

// const ReportUpload = ({ departmentId, reportType, onSuccess }) => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [parsedData, setParsedData] = useState(null);
//   const [previewData, setPreviewData] = useState(null);
//   const [reportSummary, setReportSummary] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [validationErrors, setValidationErrors] = useState([]);

//   const uploadMutation = useMutation({
//     mutationFn: (formData) => reportService.uploadReport(formData),
//     onSuccess: (data) => {
//       toast.success('Report uploaded successfully!');
//       setSelectedFile(null);
//       setParsedData(null);
//       setPreviewData(null);
//       setReportSummary(null);
//       setValidationErrors([]);
//       setUploadProgress(0);
//       if (onSuccess) onSuccess(data);
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || 'Failed to upload report');
//     },
//   });

//   const handleFileChange = async (file) => {
//     if (!file) return;

//     try {
//       setValidationErrors([]);
      
//       // Parse the Excel file
//       const parsed = await parseExcelReport(file);
//       console.log('Parsed report:', parsed);
      
//       // Validate the structure
//       const validation = validateReportStructure(parsed);
//       console.log('Validation result:', validation);
      
//       if (!validation.isValid) {
//         setValidationErrors(validation.errors);
//         // Show errors in a more user-friendly way
//         const errorMessage = validation.errors.join('\n');
//         toast.error(`Validation failed:\n${errorMessage}`);
//         setSelectedFile(null);
//         return;
//       }

//       const summary = getReportSummary(parsed.reportData);
      
//       setParsedData(parsed);
//       setPreviewData(parsed.reportData);
//       setReportSummary(summary);
//       setSelectedFile(file);
//       toast.success('File validated successfully!');
//     } catch (error) {
//       console.error('Error parsing file:', error);
//       toast.error(`Error parsing file: ${error.message}`);
//       setSelectedFile(null);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!selectedFile || !parsedData) {
//       toast.error('Please select a valid file');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', selectedFile);
//     formData.append('departmentId', departmentId);
//     formData.append('reportType', reportType);
    
//     const reportData = prepareReportForSubmission(parsedData);
//     formData.append('reportData', JSON.stringify(reportData));

//     const interval = setInterval(() => {
//       setUploadProgress(prev => {
//         if (prev >= 90) {
//           clearInterval(interval);
//           return 90;
//         }
//         return prev + 10;
//       });
//     }, 200);

//     uploadMutation.mutate(formData, {
//       onSettled: () => {
//         clearInterval(interval);
//         setUploadProgress(100);
//       },
//     });
//   };

//   const onDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const onDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const onDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
//       handleFileChange(file);
//     } else {
//       toast.error('Please upload an Excel file (.xlsx or .xls)');
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <div className="space-y-6">
//         {/* Department and Report Type Info */}
//         <div className="bg-blue-50 p-4 rounded-md">
//           <div className="flex items-center space-x-4">
//             <div>
//               <p className="text-xs text-blue-600">Department</p>
//               <p className="text-sm font-medium text-gray-900">
//                 {departmentId?.replace(/_/g, ' ').toUpperCase()}
//               </p>
//             </div>
//             <div className="w-px h-8 bg-blue-200"></div>
//             <div>
//               <p className="text-xs text-blue-600">Report Type</p>
//               <p className="text-sm font-medium text-gray-900">
//                 {reportType?.replace(/_/g, ' ').toUpperCase()}
//               </p>
//             </div>
//           </div>
//         </div>

//         {validationErrors.length > 0 && (
//           <div className="bg-red-50 border border-red-200 rounded-md p-4">
//             <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
//             <ul className="list-disc list-inside text-sm text-red-700">
//               {validationErrors.map((error, index) => (
//                 <li key={index}>{error}</li>
//               ))}
//             </ul>
//             <p className="text-xs text-red-600 mt-2">
//               Please ensure the Excel file follows the required format.
//             </p>
//           </div>
//         )}

//         <div
//           className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
//             isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
//           }`}
//           onDragOver={onDragOver}
//           onDragLeave={onDragLeave}
//           onDrop={onDrop}
//         >
//           <div className="space-y-4">
//             <FiUpload className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
//             <div>
//               <label htmlFor="file-upload" className="cursor-pointer">
//                 <span className="mt-2 block text-sm font-medium text-blue-600 hover:text-blue-500">
//                   Upload Excel File
//                 </span>
//                 <input
//                   id="file-upload"
//                   type="file"
//                   accept=".xlsx,.xls"
//                   className="sr-only"
//                   onChange={(e) => handleFileChange(e.target.files[0])}
//                 />
//               </label>
//               <p className="text-xs text-gray-500 mt-1">
//                 or drag and drop • XLSX or XLS up to 10MB
//               </p>
//             </div>
//           </div>
//         </div>

//         {selectedFile && (
//           <div className="bg-green-50 p-4 rounded-md flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <FiFile className="text-green-600" />
//               <div>
//                 <p className="text-sm text-green-700 font-medium">
//                   {selectedFile.name}
//                 </p>
//                 <p className="text-xs text-green-600">
//                   {(selectedFile.size / 1024).toFixed(1)} KB
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => {
//                 setSelectedFile(null);
//                 setParsedData(null);
//                 setPreviewData(null);
//                 setReportSummary(null);
//                 setValidationErrors([]);
//               }}
//               className="text-sm text-red-600 hover:text-red-800"
//             >
//               <FiX className="w-4 h-4" />
//             </button>
//           </div>
//         )}

//         {reportSummary && Object.keys(reportSummary).length > 0 && (
//           <div className="bg-gray-50 p-4 rounded-md">
//             <h4 className="text-sm font-medium text-gray-700 mb-2">Report Summary</h4>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {Object.entries(reportSummary).slice(0, 8).map(([key, value]) => {
//                 const totalValue = value && typeof value === 'object' 
//                   ? Object.values(value).reduce((a, b) => a + b, 0) 
//                   : value || 0;
//                 return (
//                   <div key={key}>
//                     <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
//                     <p className="text-sm font-medium text-gray-900">
//                       {typeof totalValue === 'number' ? totalValue.toLocaleString() : 'N/A'}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {previewData && Object.keys(previewData).length > 0 && (
//           <div className="mt-4">
//             <h4 className="text-sm font-medium text-gray-700 mb-2">Data Preview</h4>
//             <div className="overflow-x-auto border rounded-md max-h-64 overflow-y-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50 sticky top-0">
//                   <tr>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">USD</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">EUR</th>
//                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Others</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {Object.entries(previewData).slice(0, 10).map(([key, values]) => {
//                     const totalOthers = values && typeof values === 'object'
//                       ? Object.entries(values)
//                           .filter(([k]) => k !== 'overallExposure')
//                           .reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0)
//                       : 0;
//                     return (
//                       <tr key={key} className="hover:bg-gray-50">
//                         <td className="px-4 py-2 text-sm text-gray-900 capitalize">
//                           {key.replace(/_/g, ' ')}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-900">
//                           {values?.USD || 0}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-900">
//                           {values?.EUR || 0}
//                         </td>
//                         <td className="px-4 py-2 text-sm text-gray-900">
//                           {values?.overallExposure || totalOthers || 0}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//               {Object.keys(previewData).length > 10 && (
//                 <p className="text-sm text-gray-500 p-2">
//                   Showing 10 of {Object.keys(previewData).length} rows
//                 </p>
//               )}
//             </div>
//           </div>
//         )}

//         {uploadProgress > 0 && uploadProgress < 100 && (
//           <div className="w-full bg-gray-200 rounded-full h-2.5">
//             <div 
//               className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//               style={{ width: `${uploadProgress}%` }}
//             ></div>
//           </div>
//         )}

//         <div className="flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={() => {
//               setSelectedFile(null);
//               setParsedData(null);
//               setPreviewData(null);
//               setReportSummary(null);
//               setValidationErrors([]);
//               setUploadProgress(0);
//             }}
//             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={!selectedFile || uploadMutation.isLoading || validationErrors.length > 0}
//             className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//           >
//             {uploadMutation.isLoading ? (
//               <>
//                 <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//                 </svg>
//                 <span>Uploading...</span>
//               </>
//             ) : (
//               <>
//                 <FiCheck className="w-4 h-4" />
//                 <span>Submit Report</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportUpload;