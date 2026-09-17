import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENT_DATA } from '../services/reportService';
import ReportUpload from '../components/reports/ReportUpload';

const UploadPage = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');

  const departments = DEPARTMENT_DATA;

  const getReportTypes = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.reportTypes : [];
  };

  const reportTypes = getReportTypes(selectedDepartment);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Report</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload reports for review and approval
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedReportType('');
              }}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Report Type
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              disabled={!selectedDepartment}
            >
              <option value="">Select Report Type</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedDepartment && selectedReportType ? (
        <ReportUpload
          departmentId={selectedDepartment}
          reportType={selectedReportType}
          onSuccess={() => {
            setSelectedReportType('');
            setSelectedDepartment('');
          }}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">
            Please select a department and report type to upload
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;