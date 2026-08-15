import api from './api';

// Hardcoded department data for reference
export const DEPARTMENT_DATA = [
  {
    id: 'ibd',
    name: 'IBD',
    reportTypes: [
      { id: 'daily-forex-exposure', name: 'Daily Foreign Currency Exposure' },
      { id: 'foreign_exchange_position', name: 'Foreign Exchange Position' },
      
    ]
  },
  {
    id: 'risk_management',
    name: 'Risk Management',
    reportTypes: [
      { id: 'credit_risk_exposure', name: 'Credit Risk Exposure' },
      { id: 'market_risk_var', name: 'Market Risk VaR' },
      { id: 'operational_risk', name: 'Operational Risk' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    reportTypes: [
      { id: 'balance_sheet', name: 'Balance Sheet' },
      { id: 'income_statement', name: 'Income Statement' },
      { id: 'cash_flow', name: 'Cash Flow Statement' },
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance',
    reportTypes: [
      { id: 'aml_cft', name: 'AML/CFT Report' },
      { id: 'regulatory_reporting', name: 'Regulatory Reporting' },
      { id: 'kyc_compliance', name: 'KYC Compliance' },
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    reportTypes: [
      { id: 'settlement_risk', name: 'Settlement Risk' },
      { id: 'transaction_monitoring', name: 'Transaction Monitoring' },
      { id: 'fraud_detection', name: 'Fraud Detection' },
    ]
  },
  {
    id: 'internal_audit',
    name: 'Internal Audit',
    reportTypes: [
      { id: 'audit_findings', name: 'Audit Findings' },
      { id: 'internal_controls', name: 'Internal Controls' },
      { id: 'compliance_audit', name: 'Compliance Audit' },
    ]
  }
];

export const getDepartmentById = (deptId) => {
  return DEPARTMENT_DATA.find(dept => dept.id === deptId);
};

export const getReportTypeById = (deptId, reportTypeId) => {
  const dept = getDepartmentById(deptId);
  if (!dept) return null;
  return dept.reportTypes.find(type => type.id === reportTypeId);
};

export const reportService = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  getCurrentUser: () => api.get('/auth/me').then(res => res.data),

  // Report Management
  uploadReport: (formData) => {
  //  return api.post('/reports/upload', formData, {

      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
return api.post('/ibd-daily/post', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.data);
  },

  getReports: (params = {}) => {
    // const queryParams = new URLSearchParams();
    // Object.entries(params).forEach(([key, value]) => {
    //   if (value) queryParams.append(key, value);
    // });
    // return api.get(`/reports?${queryParams.toString()}`).then(res => res.data);
    return api.get('/ibd-daily/getall').then(res => res.data);
  },

  getReport: (reportId) => {
    return api.get(`/reports/${reportId}`).then(res => res.data);
  },

  approveReport: (reportId, data) => {
    return api.post(`/reports/${reportId}/approve`).then(res => res.data);
  },

  rejectReport: (reportId, data) => {
    return api.post(`/reports/${reportId}/reject`, data).then(res => res.data);
  },

  // Department Management (using hardcoded data)
  getDepartments: () => {
    return Promise.resolve(DEPARTMENT_DATA);
  },

  getDepartment: (deptId) => {
    const dept = getDepartmentById(deptId);
    return Promise.resolve(dept);
  },

  getReportTypes: (departmentId) => {
    const dept = getDepartmentById(departmentId);
    return Promise.resolve(dept ? dept.reportTypes : []);
  },

  getReportType: (departmentId, reportTypeId) => {
    const type = getReportTypeById(departmentId, reportTypeId);
    return Promise.resolve(type);
  },

  // Stats
  getReportStats: (departmentId) => {
    const params = departmentId ? `?departmentId=${departmentId}` : '';
    return api.get(`/reports/stats${params}`).then(res => res.data);
  },
};


