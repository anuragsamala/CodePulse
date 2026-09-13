import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import QuestionDetails from './pages/QuestionDetails';
import CreateQuestion from './pages/CreateQuestion';
import MyQuestions from './pages/MyQuestions';
import MySolutions from './pages/MySolutions';
import MyContributions from './pages/MyContributions';
import Assignments from './pages/Assignments';
import StudentDirectory from './pages/StudentDirectory';
import StudentAnalytics from './pages/StudentAnalytics';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">403 - Access Forbidden</h1>
        <p className="text-sm text-slate-400 mb-4">
          You do not have the required permissions to access this page.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Core Authenticated Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/questions/create" element={<CreateQuestion />} />
            <Route path="/questions/:id" element={<QuestionDetails />} />
            <Route path="/my-questions" element={<MyQuestions />} />
            <Route path="/my-solutions" element={<MySolutions />} />
            <Route path="/my-contributions" element={<MyContributions />} />
            <Route path="/assignments" element={<Assignments />} />
            
            {/* Student Directory & Peer Analytics (Accessible to Students, Mentors, Admins) */}
            <Route path="/students" element={<StudentDirectory />} />
            <Route path="/students/:id" element={<StudentAnalytics />} />

            {/* Mentor Routes */}
            <Route
              path="/mentor"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/students"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <StudentDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/students/:id"
              element={
                <ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}>
                  <StudentAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}