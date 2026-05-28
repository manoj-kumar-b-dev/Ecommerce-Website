import { useState, useEffect } from 'react';
import { ChevronDown, RefreshCw, Eye, MoreVertical, Package } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const STATUS_OPTIONS = ['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/admin/orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateOrderStatus = async (id, targetStatus) => {
    try {
      await axiosInstance.put(`/api/admin/orders/${id}/status`, { status: targetStatus });
      fetchOrders();
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors shadow-sm"
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All Orders' : status}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh orders"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Orders Table / Mobile Cards */}
      <div className="bg-white border border-gray-200 md:rounded-2xl shadow-sm overflow-hidden -mx-4 md:mx-0">
        <div className="overflow-x-auto p-4 md:p-0">
          <table className="w-full admin-mobile-card-table text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Order Details</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Payment</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Package className="h-10 w-10 text-gray-300" />
                      No orders found
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Order ID">
                      <div className="text-right md:text-left">
                        <span className="font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md text-xs border border-primary-100">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Customer">
                      <div className="text-right md:text-left">
                        <p className="font-semibold text-gray-900">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Amount">
                      <span className="font-bold text-gray-900">₹{order.totalPrice}</span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Payment">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {order.paymentMethod === 'COD' ? 'COD' : 'Online'}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Status">
                      <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right" data-label="Actions">
                      {order.status !== 'Cancelled' && order.status !== 'Delivered' ? (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          className="bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 hover:bg-gray-50 w-full md:w-auto mt-2 md:mt-0"
                        >
                          <option value="Pending">Set Pending</option>
                          <option value="Processing">Set Processing</option>
                          <option value="Shipped">Set Shipped</option>
                          <option value="Delivered">Set Delivered</option>
                        </select>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;