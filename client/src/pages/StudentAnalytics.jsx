import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Award,
  CheckCircle2,
  Clock,
  CircleDashed,
  ArrowLeft,
  BookmarkPlus,
  FileCode2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

export default function StudentAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign modal (Mentors/Admin only)
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      const [analyticsRes, qRes] = await Promise.all([
        api.get('/students/' + id),
        api.get('/questions?limit=50'),
      ]);
      setData(analyticsRes.data);
      setQuestions(qRes.data.data);
      if (qRes.data.data.length > 0) {
        setSelectedQuestionId(qRes.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load student analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignQuestion = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.post('/assignments', {
        questionId: selectedQuestionId,
        studentId: id,
        deadline,
      });
      alert('Question assigned to student successfully!');
      setShowAssignModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign question');
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { student, metrics, difficultyDistribution, topicStats, recentActivities, solutions } = data;

  const diffChartData = [
    { name: 'Easy', value: difficultyDistribution.EASY || 0, color: '#10b981' },
    { name: 'Medium', value: difficultyDistribution.MEDIUM || 0, color: '#f59e0b' },
    { name: 'Hard', value: difficultyDistribution.HARD || 0, color: '#f43f5e' },
  ];

  const topicChartData = Object.entries(topicStats || {}).map(([topic, count]) => ({
    topic,
    solved: count,
  }));

  const isMentorOrAdmin = user && ['MENTOR', 'ADMIN'].includes(user.role);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Student Profile Top Card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{student.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.email} � Enrolled {new Date(student.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isMentorOrAdmin && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/25"
          >
            <BookmarkPlus className="w-4 h-4" />
            Assign Question
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 bg-emerald-950/10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
            Problems Solved
          </span>
          <p className="text-2xl font-bold text-emerald-400">{metrics.solved}</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4 bg-amber-950/10">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <p className="text-2xl font-bold text-amber-400">{metrics.inProgress}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Completion Rate
          </span>
          <p className="text-2xl font-bold text-white">{metrics.completionRate}%</p>
        </div>

        <div className="bg-slate-900 border border-orange-500/20 rounded-2xl p-4 bg-orange-950/10">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block mb-1">
            Active Streak
          </span>
          <p className="text-2xl font-bold text-orange-400">?? {metrics.currentStreak} days</p>
        </div>

        <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-4 bg-purple-950/10">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-1">
            Longest Streak
          </span>
          <p className="text-2xl font-bold text-purple-400">?? {metrics.longestStreak} days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Difficulty breakdown */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Solved by Difficulty
          </h2>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diffChartData.map((entry, index) => (
                    <Cell key={'diff-' + index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs pt-2 border-t border-slate-800">
            <span className="text-emerald-400">Easy: {difficultyDistribution.EASY || 0}</span>
            <span className="text-amber-400">Medium: {difficultyDistribution.MEDIUM || 0}</span>
            <span className="text-rose-400">Hard: {difficultyDistribution.HARD || 0}</span>
          </div>
        </div>

        {/* Topic Breakdown Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Topic Solved Distribution
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData}>
                <XAxis dataKey="topic" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Solutions submitted by this student */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Solutions Submitted by {student.name} ({solutions.length})
        </h2>
        {solutions.length === 0 ? (
          <p className="text-xs text-slate-500">No solutions submitted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {solutions.map((sol) => (
              <div key={sol.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-400">
                    {sol.language}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(sol.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/questions/${sol.question?.id}`}
                  className="font-semibold text-white hover:text-indigo-400 transition text-xs block"
                >
                  {sol.question?.title}
                </Link>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Time: {sol.timeComplexity || 'N/A'}</span>
                  <span>Space: {sol.spaceComplexity || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Question Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Assign Question to {student.name}</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">?</button>
            </div>

            <form onSubmit={handleAssignQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Question from Bank
                </label>
                <select
                  value={selectedQuestionId}
                  onChange={(e) => setSelectedQuestionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.topic} � {q.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  {assigning ? 'Assigning...' : 'Assign Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
