import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Users, HelpCircle, FileCode2, MessageSquare, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [uRes, aRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics'),
      ]);
      setUsers(uRes.data.data);
      setAnalytics(aRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
          Superuser Administration & Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Admin Control Center
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full system visibility, user lifecycle permissions, platform analytics, and content governance.
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Users
          </span>
          <p className="text-3xl font-extrabold text-white">{analytics?.totalUsers || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Questions
          </span>
          <p className="text-3xl font-extrabold text-indigo-400">{analytics?.totalQuestions || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Solutions
          </span>
          <p className="text-3xl font-extrabold text-emerald-400">{analytics?.totalSolutions || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Comments
          </span>
          <p className="text-3xl font-extrabold text-amber-400">{analytics?.totalComments || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Assignments Active
          </span>
          <p className="text-3xl font-extrabold text-purple-400">{analytics?.totalAssignments || 0}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            System User Management ({users.length})
          </h2>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Assigned Role</th>
              <th className="px-5 py-3.5">Created Problems</th>
              <th className="px-5 py-3.5">Solutions</th>
              <th className="px-5 py-3.5">Comments</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition">
                <td className="px-5 py-4">
                  <div className="font-semibold text-white">{u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                </td>
                <td className="px-5 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-5 py-4 font-mono">{u._count?.createdQuestions || 0}</td>
                <td className="px-5 py-4 font-mono">{u._count?.solutions || 0}</td>
                <td className="px-5 py-4 font-mono">{u._count?.comments || 0}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
