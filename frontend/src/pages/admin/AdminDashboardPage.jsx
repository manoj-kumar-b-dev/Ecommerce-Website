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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white h-28 rounded-2xl border border-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white h-96 rounded-2xl lg:col-span-2 border border-gray-100" />
          <div className="bg-white h-96 rounded-2xl border border-gray-100" />
        </div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-gray-600 mb-6">{error || 'Unable to fetch dashboard data'}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold"
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
      color: 'text-green-600',
      bg: 'bg-green-100/50',
      trend: '+12.5%'
    },
    {
      label: 'Total Orders',
      value: (stats.totalOrders || 0).toLocaleString(),
      icon: ShoppingCart,
      color: 'text-primary-600',
      bg: 'bg-primary-100/50',
      trend: '+8.2%'
    },
    {
      label: 'Products Listed',
      value: (stats.totalProducts || 0).toLocaleString(),
      icon: Package,
      color: 'text-amber-600',
      bg: 'bg-amber-100/50',
      trend: '+2.4%'
    },
    {
      label: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      icon: Users2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-100/50',
      trend: '+14.1%'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 self-start sm:self-auto shadow-sm"
          title="Refresh data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cardsData.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg text-xs font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  <span>{card.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-gray-500 text-sm mt-1">Monthly revenue performance</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>

          {data.revenueTimeline && data.revenueTimeline.length > 0 ? (
            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={data.revenueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--admin-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No revenue data available for this period
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
            <p className="text-gray-500 text-sm mt-1">Current order distribution</p>
          </div>

          {pieData.some(d => d.value > 0) ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                       itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-4">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-semibold text-gray-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No order data available
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
              <p className="text-gray-500 text-sm mt-1">Best performing items</p>
            </div>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
          </div>

          {data.topProducts && data.topProducts.length > 0 ? (
            <div className="p-4 flex-1">
              <div className="space-y-4">
                {data.topProducts.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                    <img
                      src={product.image || 'https://placehold.co/40x40?text=Product'}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.totalQtySold} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{product.totalGenerated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 flex-1 flex flex-col items-center justify-center">
              <Package className="h-8 w-8 mb-2 opacity-50" />
              No product data available
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <p className="text-gray-500 text-sm mt-1">Latest customer purchases</p>
            </div>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
          </div>

          {data.recentOrders && data.recentOrders.length > 0 ? (
            <div className="p-4 flex-1">
              <div className="space-y-3">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 bg-gray-50/50 hover:bg-white">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                      {(order.user?.name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{order.user?.name || 'Guest User'}</p>
                      <p className="text-xs text-gray-500 font-mono">#{order._id.slice(-8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 mb-1">₹{order.totalPrice}</p>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700'
                          : order.status === 'Shipped'   ? 'bg-blue-100 text-blue-700'
                          : order.status === 'Processing'? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 flex-1 flex flex-col items-center justify-center">
              <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
              No orders available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;