import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileCode2, ExternalLink, Trash2 } from 'lucide-react';

export default function MySolutions() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySolutions();
  }, []);

  const fetchMySolutions = async () => {
    try {
      const res = await api.get('/solutions/my', { params: { limit: 50 } });
      setSolutions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch my solutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this solution?')) return;
    try {
      await api.delete(`/solutions/${id}`);
      setSolutions(solutions.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete solution');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Solutions</h1>
        <p className="text-xs text-slate-400 mt-1">
          All algorithmic solutions and code submissions authored by you.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : solutions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-300">No solutions submitted yet.</p>
          <p className="text-xs mt-1">Open any question and click &quot;Submit Solution&quot; to showcase your approach.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solutions.map((sol) => (
            <div
              key={sol.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {sol.language}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{new Date(sol.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDelete(sol.id)}
                      className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                      title="Delete solution"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/questions/${sol.question?.id}`}
                  className="font-bold text-base text-white hover:text-indigo-400 transition block mt-2"
                >
                  {sol.question?.title}
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{sol.question?.topic}</span>
                  <span>�</span>
                  <span>{sol.question?.difficulty}</span>
                </div>

                {sol.explanation && (
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 line-clamp-2 mt-3 font-sans">
                    {sol.explanation}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Time: <strong className="text-emerald-400">{sol.timeComplexity || 'N/A'}</strong></span>
                  <span>Space: <strong className="text-indigo-400">{sol.spaceComplexity || 'N/A'}</strong></span>
                </div>
                <Link
                  to={`/questions/${sol.question?.id}`}
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  View in Problem <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
