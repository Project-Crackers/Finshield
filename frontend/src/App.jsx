import { useState, useEffect } from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expense from "./pages/Expense";
import Income from "./pages/Income";
import BlockchainView from "./pages/BlockchainView";
import Profile from "./pages/Profile";
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import Unauthorized from './pages/Unauthorized';


// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only check roles if allowedRoles is provided
  if (allowedRoles) {
    const userRole = user.role || (user.user && user.user.role);
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

function App() {

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen App bg-base-100 text-base-content">
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Redirect root to login always */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login and Register pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <Expense />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/incomes" element={
          <ProtectedRoute>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <Income />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/blockchain" element={
          <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <BlockchainView />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <Notifications />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Admin-only routes */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <MainLayout toggleTheme={toggleTheme} theme={theme}>
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
