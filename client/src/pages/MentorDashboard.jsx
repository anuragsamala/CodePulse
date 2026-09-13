import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users,
  CheckCircle2,
  FileCode2,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function MentorDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.get('/students/dashboard-metrics'),
        api.get('/students?limit=10'),
      ]);
      setMetrics(mRes.data);
      setStudents(sRes.data.data);
    } catch (err) {
      console.error('Failed to load mentor dashboard:', err);
    } finally {
      setLoading(false);
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
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Faculty & Mentor Command Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Mentor Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Track cohort progression, inspect student code submissions, and monitor daily engagement streaks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Students
          </span>
          <p className="text-2xl font-bold text-white">{metrics?.totalStudents || 0}</p>
        </div>

        <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-4 bg-indigo-950/10">
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
            Active Today
          </span>
          <p className="text-2xl font-bold text-indigo-400">{metrics?.activeToday || 0}</p>
        </div>

        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 bg-emerald-950/10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            Solved Today
          </span>
          <p className="text-2xl font-bold text-emerald-400">{metrics?.questionsSolvedToday || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Solutions Today
          </span>
          <p className="text-2xl font-bold text-white">{metrics?.solutionsSubmittedToday || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Cohort Progress
          </span>
          <p className="text-2xl font-bold text-slate-200">{metrics?.averageStudentProgress || 0}%</p>
        </div>

        <div className="bg-slate-900 border border-rose-500/20 rounded-2xl p-4 bg-rose-950/10">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-1">
            Needs Attention
          </span>
          <p className="text-2xl font-bold text-rose-400">{metrics?.studentsNeedingAttention || 0}</p>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Student Performance & Activity Roster
          </h2>
          <Link to="/mentor/students" className="text-xs text-indigo-400 hover:underline">
            View All Students
          </Link>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5">Solved</th>
              <th className="px-5 py-3.5">Bank Progress %</th>
              <th className="px-5 py-3.5">Streak</th>
              <th className="px-5 py-3.5">Last Active</th>
              <th className="px-5 py-3.5 text-right">Analytics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {students.map((st) => (
              <tr key={st.id} className="hover:bg-slate-800/40 transition">
                <td className="px-5 py-4">
                  <div className="font-semibold text-white">{st.name}</div>
                  <div className="text-[11px] text-slate-500">{st.email}</div>
                </td>
                <td className="px-5 py-4 font-bold text-emerald-400">{st.solved} problems</td>
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
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ?? {st.currentStreak}d (best: {st.longestStreak}d)
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-400">
                  {new Date(st.lastActive).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/mentor/students/${st.id}`}
                    className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
