import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectEditor from './pages/ProjectEditor';
import PublicPlayer from './pages/PublicPlayer';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Check if user has valid token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/:slug" element={<PublicPlayer />} />
        
        {/* Admin routes */}
        <Route 
          path="/admin/login" 
          element={isAuthenticated ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/admin" 
          element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/projects/:id" 
          element={isAuthenticated ? <ProjectEditor /> : <Navigate to="/admin/login" />} 
        />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
