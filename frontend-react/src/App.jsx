import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TraineeCheckin from './pages/TraineeCheckin';
import EmployerValidation from './pages/EmployerValidation';
import AdminDashboard from './pages/AdminDashboard';
import PortalLogin from './pages/PortalLogin';
import Hub from './pages/Hub';
import AIGuide from './components/AIGuide';

// Role-Based Access Control Wrapper
function RoleProtected({ allowedRoles, auth, children, fallbackPortal }) {
  // If not authenticated with a valid token
  if (!auth || !auth.token) {
    return <Navigate to={`/login/${fallbackPortal}`} replace />;
  }

  // If role is not authorized (admin has global administrative access)
  if (!allowedRoles.includes(auth.role) && auth.role !== 'admin') {
    return <Navigate to={`/login/${fallbackPortal}`} replace />;
  }

  return children;
}

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userStr = localStorage.getItem('user');
    
    if (token && role) {
      return {
        token,
        role,
        user: userStr ? JSON.parse(userStr) : { name: 'User', role }
      };
    }
    return null; // Not logged in initially
  });

  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Hub / Landing Launchpad */}
        <Route path="/" element={<Hub auth={auth} setAuth={setAuth} handleLogout={handleLogout} />} />
        <Route path="/hub" element={<Hub auth={auth} setAuth={setAuth} handleLogout={handleLogout} />} />
        
        {/* Dedicated 3 Portal Login Endpoints */}
        <Route path="/login" element={<PortalLogin setAuth={setAuth} />} />
        <Route path="/login/:portal" element={<PortalLogin setAuth={setAuth} />} />
        
        {/* 1. Trainee Portal (Protected: trainee, admin) */}
        <Route path="/trainee/*" element={
          <RoleProtected allowedRoles={['trainee']} auth={auth} fallbackPortal="trainee">
            <TraineeCheckin auth={auth} handleLogout={handleLogout} />
          </RoleProtected>
        } />
        
        {/* 2. Employer Portal (Protected: employer, admin) */}
        <Route path="/employer/*" element={
          <RoleProtected allowedRoles={['employer']} auth={auth} fallbackPortal="employer">
            <EmployerValidation auth={auth} handleLogout={handleLogout} />
          </RoleProtected>
        } />
        
        {/* 3. Admin Portal (Protected: admin strictly) */}
        <Route path="/admin/*" element={
          <RoleProtected allowedRoles={['admin']} auth={auth} fallbackPortal="admin">
            <AdminDashboard auth={auth} handleLogout={handleLogout} />
          </RoleProtected>
        } />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <AIGuide auth={auth} />
    </BrowserRouter>
  );
}

export default App;
