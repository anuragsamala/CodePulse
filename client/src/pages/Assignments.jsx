import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookmarkCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookmarkCheck className="w-3.5 h-3.5" /> Assigned
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Assigned Questions</h1>
        <p className="text-xs text-slate-400 mt-1">
          DSA algorithm problems explicitly assigned to you by mentors with targeted completion deadlines.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-300">No pending assignments!</p>
          <p className="text-xs mt-1">You are all caught up on your mentor assigned curriculum.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {asg.question?.topic}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400">
                    {asg.question?.difficulty}
                  </span>
                  {statusBadge(asg.status)}
                </div>

                <Link
                  to={`/questions/${asg.question?.id}`}
                  className="font-bold text-base text-white hover:text-indigo-400 transition block"
                >
                  {asg.question?.title}
                </Link>

                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Assigned by {asg.assignedBy?.name}</span>
                  <span>�</span>
                  <span>
                    Deadline: {asg.deadline ? new Date(asg.deadline).toLocaleDateString() : 'No deadline'}
                  </span>
                </p>
              </div>

              <Link
                to={`/questions/${asg.question?.id}`}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition self-start sm:self-center flex items-center gap-1.5 shrink-0"
              >
                <span>{asg.status === 'COMPLETED' ? 'Review Solution' : 'Start Solving'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
