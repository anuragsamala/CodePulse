import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  FileCode2,
  FolderGit2,
  BookmarkCheck,
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Activity,
  Flame,
  Award
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
    { name: 'Explore Questions', path: '/explore', icon: Compass, roles: ['STUDENT', 'MENTOR', 'ADMIN'] },
    { name: 'Student Directory', path: '/students', icon: Users, roles: ['STUDENT', 'MENTOR', 'ADMIN'] },
    { name: 'My Questions', path: '/my-questions', icon: FolderGit2, roles: ['STUDENT'] },
    { name: 'My Solutions', path: '/my-solutions', icon: FileCode2, roles: ['STUDENT'] },
    { name: 'My Contributions', path: '/my-contributions', icon: Activity, roles: ['STUDENT'] },
    { name: 'Assigned Questions', path: '/assignments', icon: BookmarkCheck, roles: ['STUDENT'] },
    // Mentor links
    { name: 'Mentor Dashboard', path: '/mentor', icon: LayoutDashboard, roles: ['MENTOR', 'ADMIN'] },
    // Admin links
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck, roles: ['ADMIN'] },
  ];

  const allowedItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Code<span className="text-indigo-400">Pulse</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-mono uppercase tracking-wider">DSA Community</span>
          </div>
        </div>

        <div className="p-4">
          <Link
            to="/questions/create"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Question</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/60 backdrop-blur border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="text-sm font-medium text-slate-400 hidden sm:inline">
              Welcome back, <span className="text-slate-200 font-semibold">{user?.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/students"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Peer Roster
            </Link>
            <Link
              to="/explore"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Explore Bank
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>DSA Streak Tracker Active</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
            {allowedItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4 text-indigo-400" />
                {item.name}
              </Link>
            ))}
            <Link
              to="/questions/create"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-indigo-400 font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              Add Question
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-800 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
