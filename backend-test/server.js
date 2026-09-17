/**
 * Mock/test backend for bsaPortal (frontend-only testing).
 *
 * Implements every endpoint the React app calls:
 *   POST /api/auth/login                 (AuthContext.jsx hits this directly)
 *   GET  /api/v1/auth/me
 *   POST /api/v1/:reportType/post
 *   GET  /api/v1/:reportType/getall
 *   PUT  /api/v1/:reportType/approve
 *   PUT  /api/v1/:reportType/reject
 *   GET  /api/v1/reports/:id
 *   GET  /api/v1/reports/stats
 *
 * All data lives in memory and resets whenever the server restarts.
 * Any username/password is accepted so you don't need real credentials.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let nextId = 1000;
const newId = () => `RPT-${nextId++}`;

const now = () => new Date().toISOString();

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const makeReport = (overrides = {}) => ({
  id: newId(),
  reportCode: overrides.reportCode || `OP${String(nextId).slice(-3)}`,
  status: 'PENDING',
  createdBy: 'test.user',
  createdAt: now(),
  uploadedAt: now(),
  metadata: {
    reportTitle: 'Report',
    institutionCode: 'BSA001',
    financialYear: String(new Date().getFullYear()),
    startDate: daysAgo(30),
    endDate: daysAgo(1),
  },
  columns: [],
  data: [],
  additionalColumns: [],
  noandtitles: [],
  ...overrides,
});

// In-memory store, keyed by reportType id (e.g. "ibd-daily_single-currency")
const store = {};

const seed = (reportType, reports) => {
  store[reportType] = reports;
};

// ---------------------------------------------------------------------------
// Seed a little realistic-looking data so Dashboard/Reports pages aren't empty
// ---------------------------------------------------------------------------

seed('ibd-daily_single-currency', [
  makeReport({
    status: 'APPROVED',
    createdAt: daysAgo(2),
    uploadedAt: daysAgo(2),
    createdBy: 'maker.ibd',
    metadata: {
      reportTitle: 'Daily Foreign Currency Exposure Report',
      institutionCode: 'BSA001',
      financialYear: '2026',
      startDate: daysAgo(3),
      endDate: daysAgo(2),
    },
    data: [{ currency: 'USD', exposure: 125000 }, { currency: 'EUR', exposure: 84000 }],
  }),
  makeReport({
    status: 'PENDING',
    createdAt: daysAgo(1),
    uploadedAt: daysAgo(1),
    createdBy: 'maker.ibd',
    metadata: {
      reportTitle: 'Daily Foreign Currency Exposure Report',
      institutionCode: 'BSA001',
      financialYear: '2026',
      startDate: daysAgo(2),
      endDate: daysAgo(1),
    },
    data: [{ currency: 'USD', exposure: 131000 }, { currency: 'GBP', exposure: 40200 }],
  }),
  makeReport({
    status: 'REJECTED',
    createdAt: daysAgo(20),
    uploadedAt: daysAgo(20),
    createdBy: 'maker.ibd',
    metadata: {
      reportTitle: 'Daily Foreign Currency Exposure Report',
      institutionCode: 'BSA001',
      financialYear: '2026',
      startDate: daysAgo(21),
      endDate: daysAgo(20),
    },
    data: [{ currency: 'USD', exposure: 98000 }],
  }),
]);

seed('finance-monthly_balance-sheet', [
  makeReport({
    status: 'APPROVED',
    createdAt: daysAgo(35),
    uploadedAt: daysAgo(35),
    createdBy: 'maker.finance',
    metadata: {
      reportTitle: 'Balance Sheet',
      institutionCode: 'BSA001',
      financialYear: '2026',
      startDate: daysAgo(60),
      endDate: daysAgo(35),
    },
    data: [{ line: 'Total Assets', amount: 5400000 }, { line: 'Total Liabilities', amount: 3100000 }],
  }),
  makeReport({
    status: 'IN_REVIEW',
    createdAt: daysAgo(5),
    uploadedAt: daysAgo(5),
    createdBy: 'maker.finance',
    metadata: {
      reportTitle: 'Balance Sheet',
      institutionCode: 'BSA001',
      financialYear: '2026',
      startDate: daysAgo(30),
      endDate: daysAgo(5),
    },
    data: [{ line: 'Total Assets', amount: 5600000 }, { line: 'Total Liabilities', amount: 3200000 }],
  }),
]);

seed('credit-monthly_loan-status', [
  makeReport({
    status: 'PENDING',
    createdAt: daysAgo(3),
    uploadedAt: daysAgo(3),
    createdBy: 'maker.credit',
    metadata: {
      reportTitle: 'Loan and Advance by Status',
      institutionCode: 'BSA001',
      financialYear: '2026',
      startDate: daysAgo(30),
      endDate: daysAgo(3),
    },
    data: [{ status: 'Performing', count: 412 }, { status: 'Non-Performing', count: 18 }],
  }),
]);

// Every other report type the frontend might ask for just starts empty.
const getBucket = (reportType) => {
  if (!store[reportType]) store[reportType] = [];
  return store[reportType];
};

// ---------------------------------------------------------------------------
// Logging (handy while testing)
// ---------------------------------------------------------------------------

app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: 'usr_001',
  name: 'Test Admin',
  email: 'admin@example.com',
  role: 'admin',
  departmentId: 'finance',
  departmentName: 'Finance',
  permissions: ['upload', 'review', 'approve', 'manage_users'],
};

function handleLogin(req, res) {
  const { userName, email, password } = req.body || {};
  const identifier = userName || email || 'test.user';

  // Accepts any credentials — this is a mock backend for frontend testing.
  return res.json({
    accessToken: `mock-access-token-${Date.now()}`,
    refreshToken: `mock-refresh-token-${Date.now()}`,
    username: identifier,
    roleId: MOCK_USER.role,
    permissions: MOCK_USER.permissions,
    user: { ...MOCK_USER, name: identifier, email: identifier },
  });
}

// AuthContext.jsx currently posts straight to `${API_URL_BASE}auth/login`
app.post('/api/auth/login', handleLogin);
app.post('/api/v1/auth/login', handleLogin);

app.get('/api/v1/auth/me', (req, res) => {
  res.json({ success: true, data: MOCK_USER });
});

// ---------------------------------------------------------------------------
// Reports (generic, keyed by :reportType, e.g. "ibd-daily_single-currency")
// ---------------------------------------------------------------------------

app.get('/api/v1/:reportType/getall', (req, res) => {
  const { reportType } = req.params;
  res.json(getBucket(reportType));
});

app.post('/api/v1/:reportType/post', (req, res) => {
  const { reportType } = req.params;
  const body = req.body || {};

  const report = makeReport({
    ...body,
    id: body.id || newId(),
    status: body.status || 'PENDING',
    createdAt: body.createdAt || now(),
    uploadedAt: now(),
    metadata: {
      reportTitle: body.metadata?.reportTitle || body.reportTypeName || reportType,
      institutionCode: body.metadata?.institutionCode || 'BSA001',
      financialYear: body.metadata?.financialYear || String(new Date().getFullYear()),
      startDate: body.metadata?.startDate || daysAgo(30),
      endDate: body.metadata?.endDate || now(),
      ...body.metadata,
    },
  });

  getBucket(reportType).unshift(report);
  res.status(201).json(report);
});

app.put('/api/v1/:reportType/approve', (req, res) => {
  const { reportType } = req.params;
  const { id } = req.body || {};
  const bucket = getBucket(reportType);
  const report = bucket.find((r) => r.id === id);

  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = 'APPROVED';
  report.approver = req.body.approver || 'system';
  report.approvedAt = now();
  res.json(report);
});

app.put('/api/v1/:reportType/reject', (req, res) => {
  const { reportType } = req.params;
  const { id } = req.body || {};
  const bucket = getBucket(reportType);
  const report = bucket.find((r) => r.id === id);

  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = 'REJECTED';
  report.rejectedBy = req.body.rejecter || req.body.approver || 'system';
  report.rejectedAt = now();
  report.rejectReason = req.body.reason || req.body.comment || '';
  res.json(report);
});

app.get('/api/v1/reports/stats', (req, res) => {
  const { departmentId } = req.query;
  const all = Object.values(store).flat();
  const filtered = departmentId
    ? all.filter((r) => r.departmentId === departmentId)
    : all;

  const count = (status) =>
    filtered.filter((r) => r.status?.toUpperCase() === status).length;

  res.json({
    total: filtered.length,
    pending: count('PENDING'),
    inReview: count('IN_REVIEW'),
    approved: count('APPROVED'),
    rejected: count('REJECTED'),
  });
});

app.get('/api/v1/reports/:id', (req, res) => {
  const all = Object.values(store).flat();
  const report = all.find((r) => r.id === req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
});

// ---------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'bsaPortal mock backend is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: `No mock route for ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`\nbsaPortal mock backend listening on http://localhost:${PORT}`);
  console.log(`Point the frontend's REACT_APP_API_URL at http://localhost:${PORT}/api/v1/\n`);
});
