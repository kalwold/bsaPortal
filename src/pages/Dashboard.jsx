import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { reportService, DEPARTMENT_DATA } from '../services/reportService';

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
  Cell,
} from 'recharts';

import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  // =========================================================
  // FETCH ALL REPORTS
  // =========================================================
  const {
    data: reports = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dashboardReports'],

    queryFn: async () => {
      // Get every report type from every department
      const reportTypes = DEPARTMENT_DATA.flatMap((department) =>
        department.reportTypes.map((reportType) => ({
          ...reportType,
          departmentId: department.id,
          departmentName: department.name,
        }))
      );

      console.log('Report Types:', reportTypes);

      // Fetch all report types at the same time
      const results = await Promise.all(
        reportTypes.map(async (reportType) => {
          try {
            const response = await reportService.getReports(
              reportType.id
            );

            // Make sure response is an array
            const reports = Array.isArray(response)
              ? response
              : [];

            return reports.map((report) => ({
              ...report,

              // Report information
              reportTypeId: reportType.id,
              reportTypeName: reportType.name,

              // Department information
              departmentId: reportType.departmentId,
              departmentName: reportType.departmentName,
            }));
          } catch (err) {
            console.error(
              `Failed to load ${reportType.id}:`,
              err
            );

            // Don't fail the entire dashboard
            // if one report type fails
            return [];
          }
        })
      );

      const allReports = results.flat();

      console.log('All Reports:', allReports);

      return allReports;
    },

    staleTime: 5 * 60 * 1000,
  });

  // =========================================================
  // REPORT STATISTICS
  // =========================================================
  const statistics = useMemo(() => {
    const total = reports.length;

    const pending = reports.filter(
      (report) =>
        report.status?.toUpperCase() === 'PENDING'
    ).length;

    const inReview = reports.filter(
      (report) =>
        report.status?.toUpperCase() === 'IN_REVIEW'
    ).length;

    const approved = reports.filter(
      (report) =>
        report.status?.toUpperCase() === 'APPROVED'
    ).length;

    const rejected = reports.filter(
      (report) =>
        report.status?.toUpperCase() === 'REJECTED'
    ).length;

    return {
      total,
      pending,
      inReview,
      approved,
      rejected,
    };
  }, [reports]);

  // =========================================================
  // MONTHLY DATA
  // =========================================================
  const monthlyData = useMemo(() => {
    const monthly = {};

    reports.forEach((report) => {
      if (!report.uploadedAt) return;

      const date = new Date(report.uploadedAt);

      if (isNaN(date.getTime())) return;

      const month = date.toLocaleString('default', {
        month: 'short',
      });

      if (!monthly[month]) {
        monthly[month] = {
          month,
          uploaded: 0,
          approved: 0,
        };
      }

      monthly[month].uploaded += 1;

      if (
        report.status?.toUpperCase() === 'APPROVED'
      ) {
        monthly[month].approved += 1;
      }
    });

    return Object.values(monthly);
  }, [reports]);

  // =========================================================
  // RECENT REPORTS
  // =========================================================
  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => {
        const dateA = new Date(
          a.uploadedAt || a.createdAt || 0
        );

        const dateB = new Date(
          b.uploadedAt || b.createdAt || 0
        );

        return dateB - dateA;
      })
      .slice(0, 10);
  }, [reports]);

  // =========================================================
  // PIE CHART
  // =========================================================
  const COLORS = [
    '#3b237b',
    '#F59E0B',
    '#10B981',
    '#EF4444',
  ];

  const pieData = [
    {
      name: 'Pending',
      value: statistics.pending,
    },
    {
      name: 'In Review',
      value: statistics.inReview,
    },
    {
      name: 'Approved',
      value: statistics.approved,
    },
    {
      name: 'Rejected',
      value: statistics.rejected,
    },
  ];

  // =========================================================
  // STAT CARDS
  // =========================================================
  const statCards = [
    {
      label: 'Total Reports',
      value: statistics.total,
      icon: FiFileText,
      color: 'bg-[#3b237b]',
    },
    {
      label: 'Pending',
      value: statistics.pending,
      icon: FiClock,
      color: 'bg-[#E4AA25]',
    },
    {
      label: 'Approved',
      value: statistics.approved,
      icon: FiCheckCircle,
      color: 'bg-[#00a887]',
    },
    {
      label: 'Rejected',
      value: statistics.rejected,
      icon: FiXCircle,
      color: 'bg-[#ff4d00]',
    },
  ];

  // =========================================================
  // LOADING
  // =========================================================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          Failed to load reports.
          <p className="text-sm mt-1">
            {error?.message || 'Something went wrong.'}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <div className="text-sm text-gray-500">
          Welcome back, {user?.name}
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">

                  <div
                    className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
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
          );
        })}

      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Report Status Distribution
          </h3>

          <div className="h-64">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0
                      ? `${name} ${(percent * 100).toFixed(0)}%`
                      : null
                  }
                  outerRadius={80}
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

        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-lg shadow">

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Trend
          </h3>

          <div className="h-64">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={monthlyData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="uploaded"
                  fill="#3B82F6"
                  name="Uploaded"
                />

                <Bar
                  dataKey="approved"
                  fill="#10B981"
                  name="Approved"
                />

              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

      </div>

      {/* =====================================================
          RECENT REPORTS
      ===================================================== */}
      <div className="bg-white shadow rounded-lg">

        <div className="px-6 py-4 border-b border-gray-200">

          <h3 className="text-lg font-medium text-gray-900">
            Recent Reports
          </h3>

        </div>

        <div className="divide-y divide-gray-200">

          {recentReports.length > 0 ? (

            recentReports.map((report) => {

              const status =
                report.status?.toUpperCase();

              return (
                <div
                  key={report.id}
                  className="px-6 py-4 hover:bg-gray-50"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-medium text-[#48198B]">
                        {report.title ||
                          report.reportTypeName ||
                          'Report'}
                      </p>

                      <p className="text-sm text-gray-500">
                        {report.reportTypeName}
                        {' • '}
                        {report.departmentName}
                      </p>

                    </div>

                    <div className="flex items-center space-x-4">

                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : status === 'IN_REVIEW'
                            ? 'bg-blue-100 text-blue-800'
                            : status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {report.status || 'UNKNOWN'}
                      </span>

                    </div>

                  </div>

                </div>
              );
            })

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



// import React from 'react';




// import { useQuery } from '@tanstack/react-query';
// import { useAuth } from '../context/AuthContext';
// import { reportService } from '../services/reportService';
// import { DEPARTMENT_DATA } from '../services/reportService';
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import { FiFileText, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

// const Dashboard = () => {
//   const { user } = useAuth();

   

//   //  const { data: stats, isLoading } = useQuery({
//   //   queryKey: ['reportStats'],
//   //   queryFn: () => reportService.getReports(
//   //           'ibd-daily'
//   //         ),
//   //   //enabled: !!user,
//   // });


//   const { data: stats, isLoading } = useQuery({
//   queryKey: ['reportStats'],
//   queryFn: async () => {
//     const reportTypes = DEPARTMENT_DATA.flatMap(department =>
//       department.reportTypes
//     );
//  console.log("reportTypes ",reportTypes)
//     const results = await Promise.all(
//       reportTypes.map(async reportType => {
//         const reports = await reportService.getReports(reportType.id);

//         return reports.map(report => ({
//           ...report,
//           reportTypeId: reportType.id,
//           reportTypeName: reportType.name,
//         }));
//       }
    
//     )
//     );
//  console.log("results.flat()",results.flat())
//     return results.flat();
//   },
// });
//   // const { data: recentReports } = useQuery({
//   //   queryKey: [],
//   //   // queryFn: () => reportService.getReports({ 
//   //   //   departmentId: user?.departmentId,
//   //   //   limit: 5,
//   //   // }),
//   //   queryFn: () => reportService.getReports(
//   //           'ibd-daily'
//   //         ),
//   //  // enabled: !!user,
//   // });

// //   const { data: recentReports } = useQuery({
// //   queryKey: ['recentReports'],
// //   queryFn: async () => {
// //     const reportTypes = DEPARTMENT_DATA.flatMap(department =>
// //       department.reportTypes
// //     );
// // console.log("reportTypes", reportTypes)
// //     const results = await Promise.all(
// //       reportTypes.map( reportType => 
// //         reportService.getReports(reportType.id)

// //         // return reports.map(report => ({
// //         //   ...report,
// //         //   reportTypeId: reportType.id,
// //         //   reportTypeName: reportType.name,
// //         // }));
// //       )
// //     );

// //     console.log("results.flat()",results.flat())

// //     return results.flat();
// //   },
// // });
// const { data: recentReports } = useQuery({
//   queryKey: ['recentReports'],
//   queryFn: async () => {
//     const reportTypes = DEPARTMENT_DATA.flatMap(department =>
//       department.reportTypes.map(reportType => ({
//         ...reportType,
//         departmentId: department.id,
//         departmentName: department.name,
//       }))
//     );

//     const results = await Promise.all(
//       reportTypes.map(async reportType => {
//         const reports = await reportService.getReports(reportType.id);

//         return reports.map(report => ({
//           ...report,
//           reportTypeId: reportType.id,
//           reportTypeName: reportType.name,
//           departmentId: reportType.departmentId,
//           departmentName: reportType.departmentName,
//         }));
//       })

      
//     );
//  console.log("results.flat()",results.flat())
//     return results.flat();
//   },
// });
//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   const COLORS = ['#3b237b', '#F59E0B', '#10B981', '#EF4444'];
//  console.log("recentReports",stats)
//   const totalReports = stats?.length || 0;
//   const pendingCount = stats?.filter((r) => r.status === "PENDING").length || 0;
//   const inReviewCount = stats?.filter((r) => r.status === "IN_REVIEW").length || 0;
//   const approvedCount = stats?.filter((r) => r.status === "APPROVED").length || 0;
//   const rejectedCount = stats?.filter((r) => r.status === "REJECTED").length || 0;
//   const pieData = [
//     { name: 'Pending',  value: pendingCount},
//     { name: 'In Review', value: inReviewCount },
//     { name: 'Approved', value: approvedCount },
//     { name: 'Rejected', value: rejectedCount },
//   ];

//   const statCards = [
//     { 
//       label: 'Total Reports', 
//       value: totalReports, 
//       icon: FiFileText, 
//       color: 'bg-[#3b237b]' 
//     },
//     { 
//       label: 'Pending', 
//       value: pendingCount, 
//       icon: FiClock, 
//       color: 'bg-[#E4AA25]' 
//     },
//     { 
//       label: 'Approved', 
//       value: approvedCount, 
//       icon: FiCheckCircle, 
//       color: 'bg-[#00a887]' 
//     },
//     { 
//       label: 'Rejected', 
//       value: rejectedCount, 
//       icon: FiXCircle, 
//       color: 'bg-[#ff4d00]' 
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
//         <div className="text-sm text-gray-500">
//           Welcome back, {user?.name}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//         {statCards.map((stat) => (
//           <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
//                   <stat.icon className="h-6 w-6 text-white" />
//                 </div>
//                 <div className="ml-5 w-0 flex-1">
//                   <dl>
//                     <dt className="text-sm font-medium text-gray-500 truncate">
//                       {stat.label}
//                     </dt>
//                     <dd className="text-lg font-medium text-gray-900">
//                       {stat.value}
//                     </dd>
//                   </dl>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Report Status Distribution</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 {/* <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie> */}
//                 <Pie
//   data={pieData}
//   cx="50%"
//   cy="50%"
//   labelLine={false}
//   label={({ name, percent }) =>
//     percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : null
//   }
//   outerRadius={80}
//   fill="#8884d8"
//   dataKey="value"
// >
//   {pieData.map((entry, index) => (
//     <Cell
//       key={`cell-${index}`}
//       fill={COLORS[index % COLORS.length]}
//     />
//   ))}
// </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={stats?.monthlyData || []}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="uploaded" fill="#3B82F6" name="Uploaded" />
//                 <Bar dataKey="approved" fill="#10B981" name="Approved" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white shadow rounded-lg">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
//         </div>
//         <div className="divide-y divide-gray-200">
//           {recentReports?.length > 0 ? (
//             recentReports.map((report) => (
//               <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-[#48198B]">
//                       {report.title || 'Single Currency Exposure Report'}
//                     </p>
//                     <p className="text-sm text-gray-500">{report.type} • {report.department}</p>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                       report.status === 'approved' ? 'bg-green-100 text-green-800' :
//                       report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {report.status}
//                     </span>
//                     {/* <span className="text-sm text-gray-500">
//                       {new Date(report.uploadedAt).toLocaleDateString()}
//                     </span> */}
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="px-6 py-4 text-center text-gray-500">
//               No recent reports
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;