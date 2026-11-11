import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import StudentHome from './pages/StudentHome';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import Improvements from './pages/Improvements';
import DataUpload from './pages/DataUpload';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Goals from './pages/Goals';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* The public application URL always opens the sign-in screen. */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Student portal: students only. */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/studentHome" element={<StudentHome />} />
            {/* Keep the previous student URL working as a safe alias. */}
            <Route
              path="/student"
              element={<Navigate to="/studentHome" replace />}
            />
          </Route>

          {/* Mentor portal: every mentor page remains role-protected. */}
          <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/improvements" element={<Improvements />} />
              <Route path="/upload" element={<DataUpload />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Unknown URLs return to the public sign-in entry point. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
