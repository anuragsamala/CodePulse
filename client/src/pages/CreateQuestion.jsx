import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, PlusCircle, ArrowLeft, ExternalLink } from 'lucide-react';

const TOPICS = [
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

export default function CreateQuestion() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('EASY');
  const [platform, setPlatform] = useState('LeetCode');
  const [problemUrl, setProblemUrl] = useState('');
  const [tags, setTags] = useState('');
  const [initialNotes, setInitialNotes] = useState('');

  // Duplicate warning state
  const [duplicates, setDuplicates] = useState([]);
  const [hasCheckedDuplicates, setHasCheckedDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkDuplicates = async () => {
    if (!title.trim() && !problemUrl.trim()) return;
    try {
      const res = await api.get('/questions/check-duplicate', {
        params: { title, problemUrl, platform },
      });
      setDuplicates(res.data.duplicates || []);
      setHasCheckedDuplicates(true);
    } catch (err) {
      console.error('Failed to check duplicate:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/questions', {
        title,
        description,
        topic,
        difficulty,
        platform,
        problemUrl,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        visibility: 'PUBLIC',
        initialNotes,
      });

      navigate(`/questions/${res.data.question.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Add DSA Question</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Share a new algorithm problem with the community. Your personal progress will remain independent.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Duplicate warning alert banner */}
      {duplicates.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>A similar question already exists in the community bank:</span>
          </div>
          <div className="space-y-1 pl-6">
            {duplicates.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>
                  &quot;{d.question.title}&quot; ({d.question.platform}) � Added by {d.question.creator?.name}
                </span>
                <a
                  href={`/questions/${d.question.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold flex items-center gap-1 text-amber-400 hover:text-amber-300"
                >
                  View Existing Question <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-400/80 pt-1">
            You can still proceed to submit if you have a distinct variant or custom test cases!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Problem Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onBlur={checkDuplicates}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Two Sum"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Topic *
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Difficulty *
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Platform *
            </label>
            <input
              type="text"
              required
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. LeetCode, Codeforces, GFG"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Original Problem URL
            </label>
            <input
              type="url"
              value={problemUrl}
              onBlur={checkDuplicates}
              onChange={(e) => setProblemUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Problem Description & Constraints *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste or write the question description, input/output format, and constraints..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="array, hash-table, two-pointers"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Personal Study Notes (Private to you)
            </label>
            <input
              type="text"
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              placeholder="Remind yourself what key concept to practice on this problem..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/25 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Creating Question...' : 'Publish to Community'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
