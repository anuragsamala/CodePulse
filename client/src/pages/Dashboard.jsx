import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  Flame,
  Award,
  TrendingUp,
  Target,
  ArrowRight,
  Code2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [communityFeed, setCommunityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progRes, weekRes, feedRes] = await Promise.all([
        api.get('/progress'),
        api.get('/progress/weekly'),
        api.get('/activities/feed?limit=8'),
      ]);
      setMetrics(progRes.data);
      setWeekly(weekRes.data.weeklyData || []);
      setCommunityFeed(feedRes.data.activities || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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

  const todayGoal = metrics?.todayGoal || 5;
  const todaySolved = metrics?.todaySolved || 0;
  const todayProgressPercent = Math.min(100, Math.round((todaySolved / todayGoal) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Personal DSA Growth Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Welcome back, {user?.name} ??
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Track your daily algorithmic problem-solving streak, compare community approaches, and reach interview readiness.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Solve Today&apos;s Problem</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bank</span>
            <Code2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics?.totalQuestions || 0}</p>
          <span className="text-[11px] text-slate-500">Public problems</span>
        </div>

        <div className="bg-slate-900 border border-emerald-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Solved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{metrics?.solved || 0}</p>
          <span className="text-[11px] text-slate-500">Completed by you</span>
        </div>

        <div className="bg-slate-900 border border-amber-900/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{metrics?.inProgress || 0}</p>
          <span className="text-[11px] text-slate-500">Currently attempting</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Not Started</span>
            <CircleDashed className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-300">{metrics?.notStarted || 0}</p>
          <span className="text-[11px] text-slate-500">Ready to explore</span>
        </div>

        <div className="bg-slate-900 border border-orange-500/20 rounded-xl p-4 bg-orange-950/10">
          <div className="flex items-center justify-between text-orange-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 fill-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-400">{metrics?.currentStreak || 0} <span className="text-sm font-normal text-slate-400">days</span></p>
          <span className="text-[11px] text-orange-400/80">Active daily pace</span>
        </div>

        <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-4 bg-purple-950/10">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Longest</span>
            <Award className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{metrics?.longestStreak || 0} <span className="text-sm font-normal text-slate-400">days</span></p>
          <span className="text-[11px] text-purple-400/80">Personal best</span>
        </div>
      </div>

      {/* Row: Today's Goal Progress & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Goal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Today&apos;s Target
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                {todaySolved} / {todayGoal} Questions
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Daily Completion</span>
                <span>{todayProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 leading-relaxed">
              {todaySolved >= todayGoal
                ? '?? Outstanding! You have met today\'s goal of 5 questions. Keep pushing your limits!'
                : `Solve ${todayGoal - todaySolved} more question${todayGoal - todaySolved > 1 ? 's' : ''} today to lock in your daily streak target.`}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Streak Status</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>{metrics?.currentStreak} Day Streak Running</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Weekly Solved Distribution (Monday - Sunday)
            </span>
            <span className="text-xs text-slate-400">Current Week</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar dataKey="solved" radius={[6, 6, 0, 0]}>
                  {weekly.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.solved > 0 ? '#6366f1' : '#1e293b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Topic Progress Breakdown & Community Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
            Topic Mastery Progress
          </h2>
          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {metrics?.topicBreakdown &&
              Object.entries(metrics.topicBreakdown).map(([topic, data]) => {
                const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
                return (
                  <div key={topic} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-200">{topic}</span>
                      <span className="text-slate-400">{data.solved} / {data.total} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Live Community Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Community Activity
            </h2>
            <Link to="/explore" className="text-xs text-indigo-400 hover:underline">
              View All Questions
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {communityFeed.map((act) => {
              let text = '';
              if (act.action === 'QUESTION_CREATED') text = 'added question';
              else if (act.action === 'QUESTION_SOLVED') text = 'solved';
              else if (act.action === 'SOLUTION_ADDED') text = `submitted ${act.solution?.language || ''} solution for`;
              else if (act.action === 'COMMENT_ADDED') text = 'commented on';
              else text = 'attempted';

              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                    {act.user?.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-300">
                      <span className="font-semibold text-white">{act.user?.name}</span>{' '}
                      <span className="text-slate-400">{text}</span>{' '}
                      {act.question && (
                        <Link
                          to={`/questions/${act.question.id}`}
                          className="font-medium text-indigo-400 hover:underline inline"
                        >
                          &quot;{act.question.title}&quot;
                        </Link>
                      )}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
