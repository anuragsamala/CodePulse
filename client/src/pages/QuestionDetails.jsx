import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  ExternalLink,
  Plus,
  Copy,
  Check,
  MessageSquare,
  UploadCloud,
  FileCode2,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

const SUPPORTED_LANGUAGES = ['C++', 'Java', 'Python', 'JavaScript', 'C', 'Go'];

const LANGUAGE_MAP = {
  'C++': 'cpp',
  'Java': 'java',
  'Python': 'python',
  'JavaScript': 'javascript',
  'C': 'c',
  'Go': 'go',
};

export default function QuestionDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status state
  const [currentStatus, setCurrentStatus] = useState('NOT_STARTED');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Active solution tab
  const [activeSolutionIndex, setActiveSolutionIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Submit solution modal state
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [newLanguage, setNewLanguage] = useState('C++');
  const [newCode, setNewCode] = useState('// Write your solution here\n');
  const [newExplanation, setNewExplanation] = useState('');
  const [newTimeComplexity, setNewTimeComplexity] = useState('O(n)');
  const [newSpaceComplexity, setNewSpaceComplexity] = useState('O(1)');
  const [solutionFile, setSolutionFile] = useState(null);
  const [submittingSolution, setSubmittingSolution] = useState(false);

  // New comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [qRes, sRes, cRes] = await Promise.all([
        api.get(`/questions/${id}`),
        api.get(`/solutions/question/${id}`),
        api.get('/comments', { params: { questionId: id } }),
      ]);
      setQuestion(qRes.data);
      setCurrentStatus(qRes.data.personalProgress?.status || 'NOT_STARTED');
      setSolutions(sRes.data.data || []);
      setComments(cRes.data.comments || []);
    } catch (err) {
      console.error('Failed to load question details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.put(`/progress/${id}`, { status: newStatus });
      setCurrentStatus(newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSolutionFile(file);
      // Read file into editor
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewCode(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    setSubmittingSolution(true);
    try {
      const formData = new FormData();
      formData.append('language', newLanguage);
      formData.append('sourceCode', newCode);
      formData.append('explanation', newExplanation);
      formData.append('timeComplexity', newTimeComplexity);
      formData.append('spaceComplexity', newSpaceComplexity);
      if (solutionFile) {
        formData.append('solutionFile', solutionFile);
      }

      const res = await api.post(`/solutions/question/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSolutions([res.data.solution, ...solutions]);
      setShowSolutionModal(false);
      setNewExplanation('');
      setSolutionFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmittingSolution(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await api.post('/comments', {
        questionId: id,
        content: commentText.trim(),
      });
      setComments([...comments, res.data.comment]);
      setCommentText('');
    } catch (err) {
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteSolution = async (solId) => {
    if (!window.confirm('Delete this solution?')) return;
    try {
      await api.delete(`/solutions/${solId}`);
      setSolutions(solutions.filter((s) => s.id !== solId));
      if (activeSolutionIndex >= solutions.length - 1) {
        setActiveSolutionIndex(Math.max(0, solutions.length - 2));
      }
    } catch (err) {
      alert('Failed to delete solution');
    }
  };

  if (loading || !question) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const activeSolution = solutions[activeSolutionIndex];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {question.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {question.topic}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {question.platform}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {question.title}
          </h1>

          <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
            <span>Added by <strong className="text-slate-200">{question.creator?.name}</strong></span>
            <span>�</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Personal Progress Dropdown Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              My Personal Progress
            </span>
            <div className="flex items-center gap-2">
              <select
                value={currentStatus}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none transition cursor-pointer ${
                  currentStatus === 'SOLVED'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                    : currentStatus === 'IN_PROGRESS'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <option value="NOT_STARTED">? Not Started</option>
                <option value="IN_PROGRESS">? In Progress</option>
                <option value="SOLVED">? Solved</option>
              </select>
              {statusUpdating && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
            </div>
          </div>

          {question.problemUrl && (
            <a
              href={question.problemUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <span>Original Problem</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Grid: Problem Description & Solutions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Problem Description */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Problem Description
            </h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              {question.description}
            </div>

            {question.tags && question.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Tags & Categorization
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {question.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Community Discussion ({comments.length})
              </h2>
            </div>

            <form onSubmit={handleAddComment} className="space-y-2">
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ask a mentor, discuss edge cases, or share an insight..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            <div className="space-y-3 pt-2 max-h-96 overflow-y-auto pr-1">
              {comments.map((cmt) => (
                <div key={cmt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      {cmt.user?.name}
                      {cmt.user?.role === 'MENTOR' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Mentor
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(cmt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans">{cmt.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Solution Monaco Code Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  Community Solutions ({solutions.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Learn from peer implementations across multiple languages.
                </p>
              </div>

              <button
                onClick={() => setShowSolutionModal(true)}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/25"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit Solution
              </button>
            </div>

            {/* Solution Author / Language Tabs */}
            {solutions.length === 0 ? (
              <div className="p-10 text-center text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-sm font-semibold text-slate-300">No solutions submitted yet.</p>
                <p className="text-xs mt-1">Be the first student to submit an implementation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {solutions.map((sol, index) => (
                    <button
                      key={sol.id}
                      onClick={() => setActiveSolutionIndex(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition shrink-0 ${
                        activeSolutionIndex === index
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{sol.author?.name?.split(' ')[0]}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/30">
                        {sol.language}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Solution Details Bar */}
                {activeSolution && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400">
                          Author: <strong className="text-slate-200">{activeSolution.author?.name}</strong>
                        </span>
                        <span className="text-slate-500">�</span>
                        <span className="text-slate-400">
                          Time: <strong className="text-emerald-400">{activeSolution.timeComplexity || 'N/A'}</strong>
                        </span>
                        <span className="text-slate-500">�</span>
                        <span className="text-slate-400">
                          Space: <strong className="text-indigo-400">{activeSolution.spaceComplexity || 'N/A'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(activeSolution.sourceCode, activeSolutionIndex)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition border border-slate-700"
                        >
                          {copiedIndex === activeSolutionIndex ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>

                        {(user?.id === activeSolution.userId || ['MENTOR', 'ADMIN'].includes(user?.role)) && (
                          <button
                            onClick={() => handleDeleteSolution(activeSolution.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                            title="Delete Solution"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Monaco Editor Code Display */}
                    <div className="rounded-xl overflow-hidden border border-slate-800">
                      <Editor
                        height="380px"
                        language={LANGUAGE_MAP[activeSolution.language] || 'cpp'}
                        theme="vs-dark"
                        value={activeSolution.sourceCode}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 13,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                        }}
                      />
                    </div>

                    {/* Approach & Explanation */}
                    {activeSolution.explanation && (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Approach Explanation
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {activeSolution.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Solution Modal */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Submit New Solution</h3>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ?
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Language
                  </label>
                  <select
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={newTimeComplexity}
                    onChange={(e) => setNewTimeComplexity(e.target.value)}
                    placeholder="e.g. O(n)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={newSpaceComplexity}
                    onChange={(e) => setNewSpaceComplexity(e.target.value)}
                    placeholder="e.g. O(1)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* File upload trigger */}
              <div className="p-3 bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Or upload solution file (.cpp, .java, .py, .js, .go, .c):</span>
                <input
                  type="file"
                  accept=".cpp,.java,.py,.js,.go,.c,.txt"
                  onChange={handleFileChange}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              {/* Monaco Code Input */}
              <div className="rounded-xl overflow-hidden border border-slate-800">
                <Editor
                  height="260px"
                  language={LANGUAGE_MAP[newLanguage] || 'cpp'}
                  theme="vs-dark"
                  value={newCode}
                  onChange={(val) => setNewCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Explanation / Strategy
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explain why this approach works and key algorithmic insights..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSolutionModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSolution}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  {submittingSolution ? 'Submitting...' : 'Submit to Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
