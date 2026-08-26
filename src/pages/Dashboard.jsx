import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/reportService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FiFileText, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  // const { data: stats, isLoading } = useQuery({
  //   queryKey: ['reportStats', user?.departmentId],
  //   queryFn: () => reportService.getReportStats(user?.departmentId),
  //   enabled: !!user,
  // });

   const { data: stats, isLoading } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportService.getReports(
            'ibd-daily'
          ),
    //enabled: !!user,
  });

  const { data: recentReports } = useQuery({
    queryKey: ['recentReports', user?.departmentId],
    // queryFn: () => reportService.getReports({ 
    //   departmentId: user?.departmentId,
    //   limit: 5,
    // }),
    queryFn: () => reportService.getReports(
            'ibd-daily'
          ),
   // enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const COLORS = ['#3b237b', '#F59E0B', '#10B981', '#EF4444'];
 
  const totalReports = stats?.length || 0;
  const pendingCount = stats?.filter((r) => r.status === "PENDING").length || 0;
  const inReviewCount = stats?.filter((r) => r.status === "IN_REVIEW").length || 0;
  const approvedCount = stats?.filter((r) => r.status === "APPROVED").length || 0;
  const rejectedCount = stats?.filter((r) => r.status === "REJECTED").length || 0;
  const pieData = [
    { name: 'Pending',  value: pendingCount},
    { name: 'In Review', value: inReviewCount },
    { name: 'Approved', value: approvedCount },
    { name: 'Rejected', value: rejectedCount },
  ];

  const statCards = [
    { 
      label: 'Total Reports', 
      value: totalReports, 
      icon: FiFileText, 
      color: 'bg-[#3b237b]' 
    },
    { 
      label: 'Pending', 
      value: pendingCount, 
      icon: FiClock, 
      color: 'bg-[#E4AA25]' 
    },
    { 
      label: 'Approved', 
      value: approvedCount, 
      icon: FiCheckCircle, 
      color: 'bg-[#00a887]' 
    },
    { 
      label: 'Rejected', 
      value: rejectedCount, 
      icon: FiXCircle, 
      color: 'bg-[#ff4d00]' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {user?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.label}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                {/* <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie> */}
                <Pie
  data={pieData}
  cx="50%"
  cy="50%"
  labelLine={false}
  label={({ name, percent }) =>
    percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : null
  }
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
>
  {pieData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={COLORS[index % COLORS.length]}
    />
  ))}
</Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="uploaded" fill="#3B82F6" name="Uploaded" />
                <Bar dataKey="approved" fill="#10B981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports?.length > 0 ? (
            recentReports.map((report) => (
              <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#48198B]">
                      {report.title || 'Single Currency Exposure Report'}
                    </p>
                    <p className="text-sm text-gray-500">{report.type} • {report.department}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'approved' ? 'bg-green-100 text-green-800' :
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                    {/* <span className="text-sm text-gray-500">
                      {new Date(report.uploadedAt).toLocaleDateString()}
                    </span> */}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-gray-500">
              No recent reports
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;