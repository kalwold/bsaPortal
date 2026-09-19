
import api from "./api";

// Hardcoded department data for reference
export const DEPARTMENT_DATA = [
  {
    id: "ibd",
    name: "IBD",
    reportTypes: [
      {
        id: "ibd-daily_single-currency",
        name: "Daily Foreign Currency Exposure",
      },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    reportTypes: [
      { id: "finance-monthly_balance-sheet", name: "Balance Sheet" },
      { id: "finance-weekly_liquidity", name: "Liquidity Requirement Report" },
      {
        id: "finance-monthly_reserve",
        name: "Monthly Reserve Base Report",
      },
      { id: 'finance-monthly_statutory', name: 'Statutory Reserve Requirement Report' },
      { id: 'finance-monthly_key-balance-sheet', name: 'Key Balance Sheet Report' },
      { id: 'finance-monthly_capital-adequacy', name: 'CAPITAL ADEQUACY REPORT (Monthly) - Capital Components' },
      { id: 'finance-monthly_deposit-sector-region', name: 'Report on Deposits by Sector and Region' },
      { id: 'finance-monthly_deposit-range-region', name: 'Report on Deposits by Range and Region' },
         {
            id: "finance-quarterly_expense-breakdown",
            name: "BREAKDOWN OF EXPENSES",
          },
           {
            id: "finance-quarterly_income-account-breakdown",
            name: " Breakdown of Income Accounts",
          },
          {
            id: "finance-quarterly_capital-adequacy-off",
            name: "CAPITAL ADEQUACY REPORT: Off-Balance Sheet",
          },
          {
            id: "finance-quarterly_deposit-range-region",
            name: "Quarterly Report on Deposits by Range and Region",
          },
          {
            id: "finance-quarterly_profit_loss",
            name: "PROFIT AND LOSS STATEMENT",
          },
          {
            id: "finance-quarterly_on-balancesheet",
            name: " CAPITAL ADEQUACY REPORT - On Balance Sheet",
          },
          
          {
            id: "finance-quarterly_capital-adequacy",
            name: "CAPITAL ADEQUACY REPORT (QUARTERLY) - Capital Components",
          },
             {
        id: "finance-quarterly_balance-sheet",
        name: "Quarterly Balance Sheet",
      },{
        id: "finance-quarterly_top-twenty-depositors",
        name: "Quarterly Top Twenty Depositors",
      },{
        id: "finance-quarterly_maturity-assets-liabilities",
        name: "Quarterly Maturity of Assets & Liabilities",
      },
      {
        id: "finance-quarterly_memorandum",
        name: "Quarterly Memorandum and Contingent Accounts",
      },
      {
        id: "finance-quarterly_transaction-statement",
        name: "Quarterly Transaction Statement with Financial Institutions",
      },
    ],
  },
  {
    id: "credit",
    name: "Credit",
    reportTypes: [
      { id: "credit-monthy_loan-related", name: "Loans to Related Parties Report" },
      {
        id: "credit-monthly_loan-breakdown",
        name: "Breakdown of Loans and Advances",
      },
      {
        id: "credit-monthly_loan-portfolio",
        name: " Loan and Advances Portfolio Report",
      },
      {
        id: "credit-monthly_loan-nonperforming",
        name: "Non-Performing Loans and Advances & Provisions",
      },
      {
        id: "credit-monthly_loan-disbursement",
        name: "Loan & Advance Disbursement, Collection and Outstanding Report",
      },
      { id: "credit-monthly_loan-status", name: "Loan and Advance by Status" },
      {
        id: "credit-monthly_loan-classification",
        name: "Loan Classification and Provisioning",
      },
      {
        id: "credit-monthly_large-borrowers",
        name: "List of Borrowers that Exceed Ten Percent of the Banks Capital",
      },
      {
        id: "credit-monthly_loan-range-region",
        name: "Loans by Range and Region",
      },
      {
        id: "credit-monthly_loan-sector-region",
        name: "Loans by Sector and Region",
      },
      {
        id: "credit-quarterly_loan-collateralized-properties",
        name: "Collateralized Properties Foreclosed and Sold during the last 18 Consecutive Months",
      },
      {
        id: "credit-quarterly_loan-classification",
        name: "Loan Classification and Provisioning",
      },
      {
        id: "credit-quarterly_loan-npl-ecosec-branch",
        name: "BSD Quarterly NPLs Report by Economic Sector and Branch",
      },
      {
        id: "credit-quarterly_collateralized-property-acquired-last18",
        name: "Collateralized Properties Acquired during the last 18 Consecutive Months",
      },
      {
        id: "credit-quarterly_range-region",
        name: "Quarterly Conventional Loans by Range and Region",
      },
      { id: 'credit-quarterly_loans-sector-region', name: 'Conventional Loans by Sector and Region' },
      {
        id: "credit-quarterly_loan-nonperforming-top20",
        name: "Quarterly Top Twenty (20) NPLs Report",
      },
      {
        id: "credit-quarterly_top20-borrowers",
        name: "Quarterly Top Twenty (20) Borrowers Report",
      },
      {
        id: "credit-quarterly_building-construction",
        name: "Loans to Building and Construction",
      },
      {
        id: "credit-quarterly_aggregate-restructured-loans",
        name: "Aggregate of All Restructured Loans And Advances ",
      },
      {
        id: "credit-quarterly_digital-lending",
        name: "Quarterly Digital Lending Report ",
      },
      {
        id: "credit-quarterly_recategorized-loans",
        name: "Loans And Advances Re-Categorized  from Non-Accrual To Accrual Status That Are Equal To Or Above Five Percent (5%) of The Bank's Total Capital",
      },
      {
        id: "credit-quarterly_off-balance-provisioning",
        name: "Provisioning For Off-Balance Sheet Exposure"},
    ],
  },
  {
    id: "ifb",
    name: "IFB",
    reportTypes: [
      {
        id: "ifb-monthly_deposit-range-region",
        name: "Report on IFB Deposits by Range and Region",
      },
      {
        id: "ifb-monthly_deposit-sector-region",
        name: "Report on IFB Deposits by Sector and Region",
      },
      {
        id: "ifb-monthly_balance-sheet",
        name: "Interest Free Banking Service Balance sheet",
      },
      {
        id: "ifb-monthly_profit-loss",
        name: "Interest Free Banking Service Profit and loss statement",
      },
      {
        id: "ifb-monthly_loan-range-region",
        name: "IFB Loans by Range and Region",
      },
      {
        id: "ifb-monthly_loan-sector-region",
        name: "IFB Loans by Sector and Region",
      },
      { id: 'ifb-quarterly_loan-range-region', name: 'Quarterly Interest Free Loans by Range and Region	' },
      { id: 'ifb-quarterly_loan-sector-region', name: 'Quarterly Interest Free Loans by Sector and Region' },
     { id: 'ifb-quarterly_deposit-range', name: 'Quarterly Interest Free Deposits by Range and Region	' },
      { id: 'ifb-quarterly_deposit-sector', name: 'Quarterly Interest Free Deposits by Sector and Region' },
    ],
  },
  {
    id: "share",
    name: "Share",
    reportTypes: [
      {
        id: "share-quarterly_top-twenty-shareholders",
        name: "Top Twenty (20) Shareholding Structure Report",
      },
      {
        id: "share-quarterly_two-percent-shareholdings",
        name: "Two Percent (2%) and above Shareholdings of the Banks Total Share Capital Report",
      },
    ],
  },
  {
    id: "digital-banking",
    name: "Digital Banking",
reportTypes: [
      {
        id: "digital-banking-quarterly_atm-or-pos",
        name: "BSD Quarterly ATM and POS",
      },
      {
        id: "digital-banking-quarterly_mobile-transactions",
        name: "Quarterly Mobile Transactions Report",
      },
    ],
  },
];

export const getDepartmentById = (deptId) => {
  return DEPARTMENT_DATA.find((dept) => dept.id === deptId);
};

export const getReportTypeById = (deptId, reportTypeId) => {
  const dept = getDepartmentById(deptId);
  if (!dept) return null;
  return dept.reportTypes.find((type) => type.id === reportTypeId);
};

export const reportService = {
  // Auth
  login: (credentials) =>
    api.post("/auth/login", credentials).then((res) => res.data),
  getCurrentUser: () => api.get("/auth/me").then((res) => res.data),

  // Report Management
  uploadReport: (reportType, formData) => {
    //  return api.post('/reports/upload', formData, {

    // headers: {
    //   'Content-Type': 'multipart/form-data',
    // },

    return api
      .post(`/${reportType}/post`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.data);
  },

  // getReports: (params = {}) => {
  // const queryParams = new URLSearchParams();
  // Object.entries(params).forEach(([key, value]) => {
  //   if (value) queryParams.append(key, value);
  // });
  // return api.get(`/reports?${queryParams.toString()}`).then(res => res.data);
  getReports: (reportType) => {
    return api.get(`/${reportType}/getall`).then((res) => res.data);
  },

  getReport: (reportId) => {
    return api.get(`/reports/${reportId}`).then((res) => res.data);
  },

  approveReport: (reportType, data) => {
    return api.put(`/${reportType}/approve`, data).then((res) => res.data);
  },

  rejectReport: (reportType, data) => {
    return api.put(`/${reportType}/reject`, data).then((res) => res.data);
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
    const params = departmentId ? `?departmentId=${departmentId}` : "";
    return api.get(`/reports/stats${params}`).then((res) => res.data);
  },
};
