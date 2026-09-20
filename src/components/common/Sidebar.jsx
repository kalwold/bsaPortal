import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiUpload,
  FiFileText,
  FiCheckCircle,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiBarChart2,
  FiLogOut,
  FiTrendingUp,
  FiShare,
  FiSmartphone,
} from "react-icons/fi";
import {DEPARTMENTS} from "../../utils/departments";

// Hardcoded department and report types data
const DEPARTMENT_ICONS = {
  ibd: FiTrendingUp,
  finance: FiBarChart2,
  share: FiShare,
  "digital-banking": FiSmartphone,
};

const DEPARTMENT_DATA = DEPARTMENTS.map((d) => ({
  ...d,
  icon: DEPARTMENT_ICONS[d.id] ? DEPARTMENT_ICONS[d.id] : FiBarChart2,
}));

const Sidebar = () => {
  const { user, logout } = useAuth();
  //console.log('Sidebar user:', user); // Debugging line to check user data
  const navigate = useNavigate();
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [expandedPeriods, setExpandedPeriods] = useState({});

  const toggleDepartment = (deptId) => {
    setExpandedDepartments((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

  const togglePeriod = (deptId, periodId) => {
    const key = `${deptId}-${periodId}`;

    setExpandedPeriods((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const navigateToReportType = (deptId, reportTypeId) => {
    navigate(`/department/${deptId}/report/${reportTypeId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mainNavItems = [
    { to: "/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/upload", icon: FiUpload, label: "Upload Report" },
    // { to: '/review', icon: FiCheckCircle, label: 'Review' },
    { to: "/reports", icon: FiFileText, label: "All Reports" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-[#48198B]">GBB BSA Report</h1>
        <p className="text-xs text-gray-400 mt-0.5">v1.0.0</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {/* Main Navigation */}
        <div className="space-y-0.5 mb-4">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${isActive
                  ? "bg-blue-50 text-[#412985] font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#412985]"
                }`
              }
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${({ isActive }) => (isActive ? "text-[#412985]" : "text-gray-400")}`}
              />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Departments Section */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <FiGrid className="w-4 h-4 mr-2" />
            Departments
          </div>

          {DEPARTMENT_DATA.map((dept) => {
            const isExpanded = expandedDepartments[dept.id];
            const hasPeriods = dept.periods?.length > 0;

            const Icon = dept.icon || FiBarChart2;

            return (
              <div key={dept.id} className="mt-0.5">
                {/* Department */}
                <button
                  onClick={() => hasPeriods && toggleDepartment(dept.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${!hasPeriods
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center text-gray-700">
                    <Icon className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />

                    <span className="leading-5">{dept.name}</span>
                  </span>

                  {hasPeriods && (
                    <span className="text-gray-400 flex-shrink-0">
                      {isExpanded ? (
                        <FiChevronDown className="w-4 h-4" />
                      ) : (
                        <FiChevronRight className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </button>

                {/* Time Periods */}
                {isExpanded && hasPeriods && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-gray-200 pl-3">
                    {dept.periods.map((period) => {
                      const periodKey = `${dept.id}-${period.id}`;
                      const isPeriodExpanded = expandedPeriods[periodKey];
                      const hasReports = period.reportTypes?.length > 0;

                      return (
                        <div key={period.id}>
                          {/* Period */}
                          <button
                            onClick={() =>
                              hasReports && togglePeriod(dept.id, period.id)
                            }
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-[#412985] hover:bg-blue-50 rounded transition-colors"
                          >
                            <span className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                              {period.name}
                            </span>

                            {hasReports && (
                              <span className="text-gray-400">
                                {isPeriodExpanded ? (
                                  <FiChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <FiChevronRight className="w-3.5 h-3.5" />
                                )}
                              </span>
                            )}
                          </button>

                          {/* Reports */}
                          {isPeriodExpanded && hasReports && (
                            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-gray-200 pl-3">
                              {period.reportTypes.map((type) => (
                                <button
                                  key={type.id}
                                  onClick={() =>
                                    navigateToReportType(dept.id, type.id)
                                  }
                                  className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-[#412985] hover:bg-blue-50 rounded transition-colors leading-5"
                                >
                                  {type.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Viewer"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;