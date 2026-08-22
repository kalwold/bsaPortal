import api from './api';

// Hardcoded department data for reference
export const DEPARTMENT_DATA = [
  {
    id: 'ibd',
    name: 'IBD',
    reportTypes: [
      { id: 'ibd-daily', name: 'Daily Foreign Currency Exposure' },
      
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    reportTypes: [
      { id: 'finance-monthly_balance-sheet', name: 'Balance Sheet' },
      { id: 'finance-weekly', name: 'Liquidity Requirement Report' },
      { id: 'finance-monthly_reserve-base', name:'Monthly Reserve Base Report'}

    ]
  },
  {
    id: 'credit',
    name: 'Credit',
    reportTypes: [
      { id: 'loan-related-parties', name: 'Loans to Related Parties Report' },
    ]
  },
 
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
  uploadReport: (reportType, formData) => {
  //  return api.post('/reports/upload', formData, {

      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
      
return api.post(`/${reportType}/post`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.data);
  },

 // getReports: (params = {}) => {
    // const queryParams = new URLSearchParams();
    // Object.entries(params).forEach(([key, value]) => {
    //   if (value) queryParams.append(key, value);
    // });
    // return api.get(`/reports?${queryParams.toString()}`).then(res => res.data);
    getReports: (reportType) =>{
    return api.get(`/${reportType}/getall`).then(res => res.data);
  },

  getReport: (reportId) => {
    return api.get(`/reports/${reportId}`).then(res => res.data);
  },

  approveReport: (reportType, data) => {
    return api.put(`/${reportType}/approve`, data).then(res => res.data);
  },

  rejectReport: (reportType, data) => {
    return api.put(`/${reportType}/reject`, data).then(res => res.data);
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


