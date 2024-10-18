import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './firebase/AuthContext';
import Login from './components/Login';
import UserDetections from './components/UserDetections';
import UserPestWiki from './components/UserPestWiki';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import AdminPestWiki from './components/AdminPestWiki';
import Footer from './components/Footer';
import ResponsiveHeader from './components/ResponsiveHeader';
import UserHomePage from './components/UserHomePage';
import './App.css';

const App = () => {
  const { currentUser } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem('isAdminLoggedIn') === 'true'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, [currentUser]);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('isAdminLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={`app-container ${isLoggedIn || isAdminLoggedIn ? 'with-header' : ''}`}>
        {(isLoggedIn || isAdminLoggedIn) && (
          <ResponsiveHeader onLogout={handleLogout} isAdmin={isAdminLoggedIn} />
        )}
        <RoutesContainer>
          <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
            <Route path="/home" element={isLoggedIn ? <UserHomePage /> : <Navigate to="/login" />} />
            <Route path="/user-panel" element={isLoggedIn ? <UserDetections /> : <Navigate to="/login" />} />
            <Route path="/user-pestwiki" element={isLoggedIn ? <UserPestWiki /> : <Navigate to="/login" />} />
            <Route path="/admin-login" element={isAdminLoggedIn ? <Navigate to="/admin-panel" /> : <AdminLogin onAdminLogin={handleAdminLogin} />} />
            <Route path="/admin-panel" element={isAdminLoggedIn ? <AdminPanel /> : <Navigate to="/admin-login" />} />
            <Route path="/admin-pestwiki" element={isAdminLoggedIn ? <AdminPestWiki /> : <Navigate to="/admin-login" />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </RoutesContainer>
        <Footer />
      </div>
    </Router>
  );
};

const RoutesContainer = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/admin-login';
  return (
    <div className={`routes-container ${isLoginPage ? 'login-background' : ''}`}>
      {children}
    </div>
  );
};

export default App;
