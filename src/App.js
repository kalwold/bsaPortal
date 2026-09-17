import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ReviewPage from './pages/ReviewPage';
import ReportsPage from './pages/ReportsPage';
import Login from './components/auth/Login';
import ReportViewer from './components/reports/ReportViewer';
import DepartmentReportPage from './pages/DepartmentReportPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" >
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upload" element={<UploadPage />} />
                {/* <Route path="review" element={<ReviewPage />} /> */}
                <Route path="reports" element={<ReportsPage />} />
                <Route path="report/:reportId" element={<ReportViewer />} />
                <Route path="department/:deptId/report/:reportTypeId" element={<DepartmentReportPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;