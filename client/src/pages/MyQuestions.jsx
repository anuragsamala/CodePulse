import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, ExternalLink, FileCode2, MessageSquare } from 'lucide-react';

export default function MyQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyQuestions();
  }, []);

  const fetchMyQuestions = async () => {
    try {
      const res = await api.get('/questions', {
        params: { creatorId: user.id, limit: 50 },
      });
      setQuestions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch my questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      alert('Failed to delete question');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Questions</h1>
          <p className="text-xs text-slate-400 mt-1">Questions contributed by you to the CodePulse ecosystem.</p>
        </div>
        <Link
          to="/questions/create"
          className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-300">You haven&apos;t added any questions yet.</p>
          <p className="text-xs mt-1">Share an interesting problem from LeetCode or your contests!</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Topic</th>
                <th className="px-5 py-3.5">Difficulty</th>
                <th className="px-5 py-3.5">Community Solutions</th>
                <th className="px-5 py-3.5">Date Added</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-4 font-semibold text-white">
                    <Link to={`/questions/${q.id}`} className="hover:text-indigo-400 transition">
                      {q.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{q.topic}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex items-center gap-1.5 text-slate-400">
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{q.solutionCount} Solutions</span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
