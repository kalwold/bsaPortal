import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  FiTrendingUp
} from 'react-icons/fi';

// Hardcoded department and report types data
const DEPARTMENT_DATA = [
  {
    id: 'treasury',
    name: 'Treasury',
    icon: FiTrendingUp,
    reportTypes: [
      { id: 'daily-forex-exposure', name: 'Daily Foreign Currency Exposure' },
      { id: 'foreign_exchange_position', name: 'Foreign Exchange Position' },
      { id: 'liquidity_coverage_ratio', name: 'Liquidity Coverage Ratio' },
      { id: 'interest_rate_risk', name: 'Interest Rate Risk' },
    ]
  },
  {
    id: 'risk_management',
    name: 'Risk Management',
    icon: FiBarChart2,
    reportTypes: [
      { id: 'credit_risk_exposure', name: 'Credit Risk Exposure' },
      { id: 'market_risk_var', name: 'Market Risk VaR' },
      { id: 'operational_risk', name: 'Operational Risk' },
      { id: 'stress_testing', name: 'Stress Testing' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: FiBarChart2,
    reportTypes: [
      { id: 'balance_sheet', name: 'Balance Sheet' },
      { id: 'income_statement', name: 'Income Statement' },
      { id: 'cash_flow', name: 'Cash Flow Statement' },
      { id: 'financial_ratios', name: 'Financial Ratios' },
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: FiBarChart2,
    reportTypes: [
      { id: 'aml_cft', name: 'AML/CFT Report' },
      { id: 'regulatory_reporting', name: 'Regulatory Reporting' },
      { id: 'kyc_compliance', name: 'KYC Compliance' },
      { id: 'sanctions_screening', name: 'Sanctions Screening' },
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: FiBarChart2,
    reportTypes: [
      { id: 'settlement_risk', name: 'Settlement Risk' },
      { id: 'transaction_monitoring', name: 'Transaction Monitoring' },
      { id: 'fraud_detection', name: 'Fraud Detection' },
      { id: 'operational_efficiency', name: 'Operational Efficiency' },
    ]
  },
  {
    id: 'internal_audit',
    name: 'Internal Audit',
    icon: FiBarChart2,
    reportTypes: [
      { id: 'audit_findings', name: 'Audit Findings' },
      { id: 'internal_controls', name: 'Internal Controls' },
      { id: 'compliance_audit', name: 'Compliance Audit' },
      { id: 'risk_assessment', name: 'Risk Assessment' },
    ]
  }
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedDepartments, setExpandedDepartments] = useState({});

  const toggleDepartment = (deptId) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const navigateToReportType = (deptId, reportTypeId) => {
    navigate(`/department/${deptId}/report/${reportTypeId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainNavItems = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/upload', icon: FiUpload, label: 'Upload Report' },
    { to: '/review', icon: FiCheckCircle, label: 'Review' },
    { to: '/reports', icon: FiFileText, label: 'All Reports' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-blue-600">Report Portal</h1>
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
                `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className={`w-5 h-5 mr-3 ${({ isActive }) => isActive ? 'text-blue-500' : 'text-gray-400'}`} />
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
            const hasReports = dept.reportTypes.length > 0;
            const Icon = dept.icon || FiBarChart2;

            return (
              <div key={dept.id} className="mt-0.5">
                <button
                  onClick={() => hasReports && toggleDepartment(dept.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    !hasReports ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center text-gray-700">
                    <Icon className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{dept.name}</span>
                  </span>
                  {hasReports && (
                    <span className="text-gray-400 flex-shrink-0">
                      {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                    </span>
                  )}
                </button>

                {isExpanded && hasReports && (
                  <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-gray-200 pl-3">
                    {dept.reportTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => navigateToReportType(dept.id, type.id)}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors truncate"
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
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Guest'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Viewer'}</p>
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