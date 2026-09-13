import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, Search, ArrowRight, Flame, CheckCircle2 } from 'lucide-react';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: { search: query, limit: 50 },
      });
      setStudents(res.data.data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Student Directory &amp; Peer Progress</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse fellow students, discover their solved problems, review their code submissions, and learn from their progress.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-300">No students found.</p>
          <p className="text-xs mt-1">Try a different search keyword.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Solved</th>
                <th className="px-5 py-3.5">Bank Progress %</th>
                <th className="px-5 py-3.5">Active Streak</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">View Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{st.name}</div>
                    <div className="text-[11px] text-slate-500">{st.email}</div>
                  </td>
                  <td className="px-5 py-4 font-bold text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {st.solved} Solved
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, st.progressPercentage)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono">{st.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Flame className="w-3 h-3 fill-amber-400" /> {st.currentStreak}d
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {new Date(st.lastActive).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/students/${st.id}`}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      <span>View Progress</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
