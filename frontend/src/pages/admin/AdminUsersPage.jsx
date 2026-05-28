import { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, RefreshCw, User, ShieldAlert, MoreVertical } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdminRole = async (id) => {
    try {
      await axiosInstance.put(`/api/admin/users?id=${id}`);
      fetchUsers();
    } catch (err) {
      alert('Error updating user role');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/api/admin/users?id=${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h2>
          <p className="text-sm text-gray-500 mt-1">Manage customer accounts and administrative roles</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors flex-shrink-0 self-start sm:self-auto"
          title="Refresh users"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 md:rounded-2xl shadow-sm overflow-hidden -mx-4 md:mx-0">
        <div className="overflow-x-auto p-4 md:p-0">
          <table className="w-full admin-mobile-card-table text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider text-xs">Joined</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <User className="h-10 w-10 text-gray-300" />
                      No users found
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="User">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden flex-shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-gray-500">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4" data-label="Role">
                      <div className="text-right md:text-left">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                            user.role === 'admin' 
                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {user.role === 'admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-sm text-gray-600" data-label="Joined">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 md:px-6 md:py-4 text-right" data-label="Actions">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleAdminRole(user._id)}
                          className={`p-2.5 rounded-xl transition-colors ${
                            user.role === 'admin' 
                            ? 'text-primary-600 hover:bg-primary-50 bg-primary-50 md:bg-transparent'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700 bg-gray-50 md:bg-transparent'
                          }`}
                          title={user.role === 'admin' ? 'Remove admin rights' : 'Grant admin rights'}
                        >
                          {user.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 bg-gray-50 md:bg-transparent rounded-xl transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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

export default AdminUsersPage;