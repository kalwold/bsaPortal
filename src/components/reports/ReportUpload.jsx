import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportService } from '../../services/reportService';
import { 
  parseExcelReport, 
  validateReportStructure, 
  prepareReportForSubmission 
} from '../../utils/excelParser';
import ReportDataTable from './ReportDataTable';
import { FiUpload, FiFile, FiCheck, FiX, FiInfo, FiAlertCircle } from 'react-icons/fi';

const ReportUpload = ({ departmentId, reportType, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  console.log('ReportUpload props:', { departmentId, reportType });

  useEffect(() => {
  // Cleanup function - runs when component unmounts or before next render
  return () => {
    // Reset all file-related states
    setSelectedFile(null);
    setParsedData(null);
    setValidationErrors([]);
    setUploadProgress(0);

    
  };
}, [departmentId, reportType]);

  const uploadMutation = useMutation({
   mutationFn: ({ reportType, reportJson }) => reportService.uploadReport(reportType ,reportJson),
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
      
      const parsed = await parseExcelReport(file,reportType);
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
     // toast.error(`Error parsing file: ${error.message}`);
     toast.error(` ${error.message}`);
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
    const reportJson = JSON.stringify(reportData);

    console.log("report payload",reportJson)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
 console.log('Submitting report:', { reportType, reportJson });
  
    uploadMutation.mutate({ reportType, reportJson }, {
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

  const columns = parsedData?.columns || [];
  const reportData = parsedData?.data || [];
  const metadata = parsedData?.metadata || {};
  const additionalColumns =parsedData?.additionalColumns || [];
  const noandtitles=parsedData?.noandtitles|| [];

console.log('columns', columns, "additionalColumns ", additionalColumns, "noandtitles", noandtitles)
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-6">
        {/* Department and Report Type Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiInfo className="w-5 h-5 text-[#48198B]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm font-semibold text-gray-900">
                  {departmentId?.replace(/_/g, ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div>
              <p className="text-xs text-gray-500">Report Type</p>
              <p className="text-sm font-semibold text-gray-900">
                {reportType?.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      {!selectedFile && <div className="space-y-4">  <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            isDragging ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
  
    <div className={`p-4 rounded-full inline-block ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
      <FiUpload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
    <div>
      <label htmlFor="file-upload" className="cursor-pointer">
        <span className="mt-2 block text-sm font-medium text-[#48198B] hover:text-blue-900 transition-colors">
          {isDragging ? 'Drop your file here' : 'Upload Excel File'}
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
        </div>}

        {selectedFile && (
          <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiFile className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
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
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Metadata Preview */}
        {parsedData && metadata && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <FiInfo className="w-4 h-4 mr-2 text-blue-500" />
              Report Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-gray-500">Institution Code</p>
                <p className="text-sm font-semibold text-gray-900">{metadata.institutionCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Financial Year</p>
                <p className="text-sm font-semibold text-gray-900">{metadata.financialYear || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {metadata.startDate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {metadata.endDate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unit</p>
                <p className="text-sm font-semibold text-gray-900">{metadata.unit || 'In Thousands'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Template ID</p>
                <p className="text-sm font-semibold text-gray-900">{metadata.templateId || 'OP001'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Data Table */}
        {parsedData && reportData.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700">Data Preview</h4>
              <span className="text-xs text-gray-400">
                {reportData.length} sections • {columns.length} columns
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <ReportDataTable data={reportData} columns={columns} showSNo={true} additionalColumns={additionalColumns} noandtitles={noandtitles}/>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ✓ File validated successfully. Click Submit to upload.
            </p>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-[#412985] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setParsedData(null);
              setValidationErrors([]);
              setUploadProgress(0);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploadMutation.isLoading || validationErrors.length > 0}
            className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#412985] hover:bg-[#472f92] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
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