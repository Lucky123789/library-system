import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import BookList from './components/BookList';
import MyBorrowings from './components/MyBorrowings';

/**
 * 受保护的路由组件
 * 需要登录才能访问
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * 导航栏组件
 */
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/books" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', fontSize: '18px' }}>
            Book Management System
          </Link>
          <Link to="/books" style={{ textDecoration: 'none', color: '#666' }}>
            Book List
          </Link>
          <Link to="/my-borrowings" style={{ textDecoration: 'none', color: '#666' }}>
            My Borrowings
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>
            {user?.username} {isAdmin() && <span className="badge badge-info">Admin</span>}
          </span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

/**
 * 主应用组件
 */
const AppContent = () => {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/books" replace /> : <Login />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/books" replace /> : <Register />
        } />
        <Route path="/books" element={
          <ProtectedRoute>
            <BookList />
          </ProtectedRoute>
        } />
        <Route path="/my-borrowings" element={
          <ProtectedRoute>
            <MyBorrowings />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/books" replace />} />
      </Routes>
    </Router>
  );
};

/**
 * App 根组件
 */
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

