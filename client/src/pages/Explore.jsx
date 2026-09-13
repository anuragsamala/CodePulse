import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  CircleDashed,
  ExternalLink,
  MessageSquare,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

const TOPICS = [
  'All',
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stack',
  'Queue',
  'Recursion',
  'Binary Search',
  'Trees',
  'BST',
  'Heap',
  'Graphs',
  'Dynamic Programming',
  'Backtracking',
  'Sorting',
];

const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD'];

export default function Explore() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [page, topic, difficulty, sort]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: {
          page,
          limit: 12,
          search,
          topic: topic !== 'All' ? topic : undefined,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
          sort,
        },
      });
      setQuestions(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const difficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
      case 'HARD':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Hard</span>;
      default:
        return null;
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'SOLVED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <CircleDashed className="w-3.5 h-3.5" /> Not Started
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Explore DSA Questions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Global community repository of {total} algorithm problems with multi-language solutions.
          </p>
        </div>
        <Link
          to="/questions/create"
          className="inline-flex items-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Link>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, tags, platform, or author..."
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

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Topic:
            </span>
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-3 mr-1">
              Difficulty:
            </span>
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sort By:
            </span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostSolutions">Most Solutions</option>
              <option value="mostComments">Most Comments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-base font-semibold text-slate-300">No questions found</p>
          <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {difficultyBadge(q.difficulty)}
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {q.topic}
                    </span>
                  </div>
                  {statusBadge(q.personalStatus)}
                </div>

                <Link
                  to={`/questions/${q.id}`}
                  className="font-bold text-base text-slate-100 group-hover:text-indigo-400 transition line-clamp-1"
                >
                  {q.title}
                </Link>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {q.description}
                </p>

                {/* Tags */}
                {q.tags && q.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {q.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                    {q.solutionCount} {q.solutionCount === 1 ? 'Sol' : 'Sols'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    {q.commentCount}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-[11px]">By {q.creator?.name?.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
