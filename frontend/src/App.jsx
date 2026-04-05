import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Auth from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import UserManagement from './pages/UserManagement';
import Profile from './pages/MyProfile';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <Router>
  
      <Navbar /> 
      
      <main className="max-w-7xl mx-auto">
        <Routes>
          {/* Auth Route: If user is already logged in, send them to dashboard */}
          <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['Viewer', 'Analyst', 'Admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/transactions" element={
            <ProtectedRoute allowedRoles={['Analyst', 'Admin', 'Viewer']}>
              <Transactions />
            </ProtectedRoute>
          } />

          <Route path="/my-profile" element={
            <ProtectedRoute allowedRoles={['Admin', 'Viewer',"Analyst"]}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['Admin', 'Viewer',"Analyst"]}>
              <UserManagement />
            </ProtectedRoute>
          } />

          {/* Catch-all: Redirect to dashboard or login */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;