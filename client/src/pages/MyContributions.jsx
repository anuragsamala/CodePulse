import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Flame, MessageSquare, FileCode2, HelpCircle } from 'lucide-react';

export default function MyContributions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributions();
  }, []);

  const fetchContributions = async () => {
    try {
      const res = await api.get('/progress/contributions');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toLocalDateStr = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Generate 52 weeks x 7 days grid for GitHub-style heatmap
  const generateGrid = () => {
    const grid = [];
    const today = new Date();
    const heatmap = data?.heatmap || {};

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    let currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = toLocalDateStr(currentDate);
      const count = heatmap[dateStr] || 0;
      grid.push({ date: dateStr, count });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return grid;
  };

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-slate-900 border-slate-800';
    if (count <= 2) return 'bg-indigo-900/60 border-indigo-700';
    if (count <= 4) return 'bg-indigo-600 border-indigo-500';
    return 'bg-emerald-500 border-emerald-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const cells = generateGrid();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Contributions</h1>
        <p className="text-xs text-slate-400 mt-1">
          Activity heatmap and historical community contributions across questions, solutions, and discussions.
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            Questions Added
          </span>
          <p className="text-3xl font-extrabold text-white">{data?.summary?.questionsAdded || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            Solutions Submitted
          </span>
          <p className="text-3xl font-extrabold text-indigo-400">{data?.summary?.solutionsAdded || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            Comments Posted
          </span>
          <p className="text-3xl font-extrabold text-amber-400">{data?.summary?.commentsAdded || 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
            Total Engagements
          </span>
          <p className="text-3xl font-extrabold text-emerald-400">{data?.summary?.totalContributions || 0}</p>
        </div>
      </div>

      {/* GitHub-style Contribution Heatmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            365-Day Activity Heatmap
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-slate-800"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-900/60 border border-indigo-700"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-indigo-600 border border-indigo-500"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400"></div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
            {cells.map((c, i) => (
              <div
                key={i}
                title={`${c.date}: ${c.count} activity event(s)`}
                className={`w-3 h-3 rounded-[2px] border ${getHeatmapColor(c.count)} transition-all hover:scale-125`}
              />
            ))}
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          * Each colored cell represents meaningful DSA platform activity (problem solved, solution uploaded, or discussion).
        </p>
      </div>
    </div>
  );
}
