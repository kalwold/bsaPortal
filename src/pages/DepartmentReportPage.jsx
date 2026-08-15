import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  reportService,
  getDepartmentById,
  getReportTypeById,
} from "../services/reportService";
import ReportUpload from "../components/reports/ReportUpload";
import ReportDataTable from "../components/reports/ReportDataTable";
import StatusBadge from "../components/common/StatusBadge";
import {
  FiArrowLeft,
  FiUpload,
  FiRefreshCw,
  FiFileText,
  FiInfo,
} from "react-icons/fi";

const DepartmentReportPage = () => {
  const { deptId, reportTypeId } = useParams();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const department = getDepartmentById(deptId);
  const reportType = getReportTypeById(deptId, reportTypeId);

  const {
    data: reports,
    isLoading: reportsLoading,
    refetch,
  } = useQuery({
    queryKey: ["reports", deptId, reportTypeId, refreshKey],
    queryFn: () =>
      reportService.getReports({
        departmentId: deptId,
        typeId: reportTypeId,
      }),
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    refetch();
  };

    const handleReportClick = (report) => {
    // Navigate to report viewer with report data in state
    navigate(`/report/${report.id}`, {
      state: { report: report }
    });
  };

  if (!department || !reportType) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Department or Report Type not found
        </h3>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {department.name}
            </h1>
            <p className="text-sm text-gray-500">{reportType.name}</p>
            <p className="text-xs text-gray-400 mt-1">
              Department ID: {deptId} • Report Type: {reportTypeId}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiUpload className="w-4 h-4" />
              <span>{showUpload ? "Cancel" : "Upload New Report"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="mb-8">
          <ReportUpload
            departmentId={deptId}
            reportType={reportTypeId}
            onSuccess={() => {
              setShowUpload(false);
              handleRefresh();
            }}
          />
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold text-gray-900">
            {reports?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reports?.filter((r) => r.status === "PENDING").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {reports?.filter((r) => r.status === "APPROVED").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {reports?.filter((r) => r.status === "REJECTED").length || 0}
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Reports</h2>
          <div className="text-sm text-gray-500">
            {reports?.length || 0} reports found
          </div>
        </div>

        {reportsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reports?.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div
                key={report.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                //onClick={() => navigate(`/report/${report.id}`)}
                 onClick={() => handleReportClick(report)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-blue-600">
                        {report.metadata?.reportTitle ||
                          report.reportTypeName ||
                          "Daily Foreign Currency Exposure Report"}
                      </p>
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{report.ReturnKey}</span>
                      <span>•</span>
                      <span>
                        Institution: {report.metadata?.institutionCode || "N/A"}
                      </span>
                      <span>•</span>
                      <span>
                        Year: {report.metadata?.financialYear || "N/A"}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                      <span>Uploaded by: {report.createdBy || "N/A"}</span>
                      <span>•</span>
                      <span>
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleString()
                          : "N/A"}
                      </span>
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No reports found for this report type</p>
            <button
              onClick={() => setShowUpload(true)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Upload your first report →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentReportPage;
