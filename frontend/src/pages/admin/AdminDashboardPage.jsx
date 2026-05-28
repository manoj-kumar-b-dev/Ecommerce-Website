import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, Users2, TrendingUp, AlertCircle, RefreshCw, Eye, MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import axiosInstance from '../../utils/axiosInstance';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: responseData } = await axiosInstance.get('/api/admin/stats');
      setData(responseData);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load dashboard data. Please try again.';
      setError(errorMsg);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white h-24 rounded-xl border border-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white h-80 rounded-xl lg:col-span-2" />
          <div className="bg-white h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-danger-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-danger-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-gray-600 mb-6">{error || 'Unable to fetch dashboard data'}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  const stats = data.stats || {};
  const cardsData = [
    {
      label: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-success-600',
      bg: 'bg-success-50',
    },
    {
      label: 'Total Orders',
      value: (stats.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Products Listed',
      value: (stats.totalProducts || 0).toLocaleString(),
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: Users2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    }
  ];

  const pieData = [
    { name: 'Delivered', value: stats.deliveredOrders || 0, color: '#22c55e' },
    { name: 'Processing', value: stats.processingOrders || 0, color: '#f59e0b' },
    { name: 'Shipped', value: stats.shippedOrders || 0, color: '#3b82f6' },
    { name: 'Cancelled', value: stats.cancelledOrders || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          title="Refresh data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 text-success-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>+12% from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
            <p className="text-gray-600 text-sm mt-1">Monthly revenue trend and performance</p>
          </div>

          {data.revenueTimeline && data.revenueTimeline.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={data.revenueTimeline} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => `₹${value}`}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No revenue data available
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
            <p className="text-gray-600 text-sm mt-1">Distribution of order statuses</p>
          </div>

          {pieData.some(d => d.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No order data available
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
          <p className="text-gray-600 text-sm mt-1">Best performing items this month</p>
        </div>

        {data.topProducts && data.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topProducts.slice(0, 5).map((product, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || 'https://placehold.co/40x40?text=Product'}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                        />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.totalQtySold} units</td>
                    <td className="px-6 py-4 text-sm font-semibold text-success-600">₹{product.totalGenerated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No product data available
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <p className="text-gray-600 text-sm mt-1">Latest customer orders</p>
        </div>

        {data.recentOrders && data.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentOrders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">#{order._id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.user?.name || 'Guest'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{order.totalPrice}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered'
                            ? 'bg-success-100 text-success-700'
                            : order.status === 'Shipped'
                              ? 'bg-primary-100 text-primary-700'
                              : order.status === 'Processing'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-danger-100 text-danger-700'
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No orders available
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;